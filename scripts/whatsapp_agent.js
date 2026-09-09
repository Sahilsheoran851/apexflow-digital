const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const http = require('http');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const AUTH_DIR = path.join(__dirname, '../cache/wa_auth');
const LEADS_FILE = path.join(__dirname, '../whatsapp_inbound_leads.csv');
const PORT = process.env.PORT || 3000;

// Load untracked local .env if present
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const l of lines) {
      const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
} catch (_) {}

// OpenRouter Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Multi-Tier Fallback AI Models (ordered by performance, intelligence, and reliability)
const FALLBACK_MODELS = [
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat',
  'qwen/qwen-2.5-72b-instruct',
  'mistralai/mistral-small-24b-instruct-2501',
  'meta-llama/llama-3.1-8b-instruct'
];

// System Prompt with Comprehensive Agency Knowledge
const APEXFLOW_SYSTEM_PROMPT = `You are the AI Assistant for Sahil Sheoran, founder and Principal Growth Technologist at ApexFlow Digital (Dubai, UAE).

Agency Overview:
ApexFlow Digital is a premier growth technology agency based in Dubai, UAE, helping startups, boutique brands, and SMBs scale across the UAE and Saudi Arabia (KSA).

Core Services & Specializations:
1. Sub-Second Web Speed Engineering: Guaranteeing 90-100 Google Core Web Vitals on mobile. Next.js / clean HTML5, WebP/AVIF image pipelines, script deferral, edge caching. UAE mobile users drop off if load time exceeds 2.5s; ApexFlow delivers sub-second speeds.
2. Local & B2B SEO Dominance: Rank businesses top 3 on Google Maps (Local 3-Pack) in Dubai (Business Bay, Downtown, Marina, DIFC) and Riyadh. High-authority editorial backlinks, local schema, and search intent capture.
3. E-Commerce Conversion Optimization (CRO): Shopify, WooCommerce, and custom stores. 1-tap Apple Pay, Tabby / Tamara BNPL checkout acceleration, friction removal, and conversion rate lifting.
4. AI & Workflow Automation: n8n, Make.com, custom CRM integrations, and sub-30 second autonomous WhatsApp lead qualification systems.
5. The "Value-First Pilot": For qualified startups and SMBs, Sahil offers to inspect and optimize their primary bottleneck (e.g. speed or SEO) FIRST with zero upfront risk. The client verifies measurable results before deciding on a retainer.
6. Retainers & Pricing: Transparent retainers typically start between AED 4,500 and AED 8,500/month depending on scope, customized after the initial review.

Key Booking & Contact Info:
- Founder: Sahil Sheoran
- Phone / WhatsApp: +971 50 750 7963
- Google Meet Video Room: https://meet.google.com/ksd-sids-trc
- Live Calendar Scheduler: https://apexflow-digital.vercel.app/contact.html
- Website: https://apexflow-digital.vercel.app

Communication Guidelines (HUMANIZER STANDARD):
- Respond in a warm, direct, natural human tone (like a knowledgeable tech founder chatting on WhatsApp).
- Keep responses concise: 1 to 3 short paragraphs maximum. Avoid walls of text.
- NEVER use em-dashes (—). Use regular hyphens or commas instead.
- Zero AI buzzwords: Never say "delve", "tapestry", "testament", "game-changer", "seamlessly", "furthermore", "in conclusion", "it is worth noting".
- No excessive bullet points or numbered lists unless strictly clarifying steps.
- Naturally guide the conversation toward booking a 10-15 minute screen-share strategy session on Google Meet (https://meet.google.com/ksd-sids-trc) or the live calendar (https://apexflow-digital.vercel.app/contact.html).
- If the prospect wants to speak directly with Sahil or a human, gracefully let them know you have alerted Sahil and give them his direct number: +971 50 750 7963.`;

// Ensure auth dir exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

// Ensure CSV log exists
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, "Timestamp,PhoneNumber,MessageReceived,BotReply,Status\n", "utf-8");
}

let latestQR = null;
let isConnected = false;

// Conversation memory: phone -> Array<{ role: 'user' | 'assistant', content: string }>
const conversationHistories = new Map();
const activeBusinessSenders = new Set();
const pausedSenders = new Set(); // Senders who requested human takeover

// Keywords that trigger the business assistant on new conversations
const TRIGGER_KEYWORDS = [
  "speed", "audit", "quote", "pilot", "demo", "revent",
  "bottleneck", "call", "apexflow", "shopify", "woocommerce",
  "load time", "price", "pricing", "developer", "meeting",
  "seo", "website", "cost", "retainer", "marketing", "dubai",
  "ecommerce", "help", "work", "proposal", "contract", "hire", "service"
];

// Keywords indicating user wants human handover
const HUMAN_HANDOVER_KEYWORDS = [
  "human", "real person", "speak to sahil", "talk to sahil", "call me", "speak with sahil"
];

function shouldTrigger(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return TRIGGER_KEYWORDS.some(k => lower.includes(k));
}

function wantsHuman(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return HUMAN_HANDOVER_KEYWORDS.some(k => lower.includes(k));
}

function appendToHistory(sender, role, content) {
  let history = conversationHistories.get(sender);
  if (!history) {
    history = [];
    conversationHistories.set(sender, history);
  }
  history.push({ role, content });
  // Keep last 10 messages for context without exceeding tokens
  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }
}

function logLead(phone, incoming, reply, status) {
  const row = `"${new Date().toISOString()}","${phone}","${incoming.replace(/"/g, '""')}","${reply.replace(/"/g, '""')}","${status}"\n`;
  fs.appendFileSync(LEADS_FILE, row, "utf-8");
}

/**
 * Dispatches query to OpenRouter with automatic multi-model fallback
 */
async function generateAIReply(chatHistory) {
  for (let i = 0; i < FALLBACK_MODELS.length; i++) {
    const model = FALLBACK_MODELS[i];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout per model

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://apexflow-digital.vercel.app',
          'X-Title': 'ApexFlow Digital WhatsApp Assistant'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: APEXFLOW_SYSTEM_PROMPT },
            ...chatHistory
          ],
          temperature: 0.7,
          max_tokens: 350
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`  ⚠️ [Model Fail] ${model} (HTTP ${res.status}): ${errText.slice(0, 100)} -> Trying fallback...`);
        continue; // Try next fallback model
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        console.log(`  🤖 [AI Reply Generated via ${model}]`);
        // Clean up em-dashes / en-dashes
        return content.replace(/—/g, '-').replace(/–/g, '-');
      }
    } catch (err) {
      console.warn(`  ⚠️ [Model Error] ${model} failed (${err.message}) -> Trying fallback...`);
    }
  }

  // Emergency fallback if all models fail
  console.error('  ❌ All OpenRouter AI fallback models failed. Using emergency fallback template.');
  return `Hi! Thanks for your message. To quickly discuss your site bottlenecks or growth goals, feel free to pick a 15-minute slot on Sahil's live calendar: https://apexflow-digital.vercel.app/contact.html or jump straight into our Google Meet room: https://meet.google.com/ksd-sids-trc. Best, Sahil Sheoran`;
}

// Simple HTTP server to show QR code / status in browser
const server = http.createServer(async (req, res) => {
  if (req.url === "/" || req.url === "/qr") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    if (isConnected) {
      res.end(`
        <html>
          <body style="font-family:-apple-system, sans-serif; text-align:center; padding:50px; background:#f8fafc;">
            <div style="max-width:520px; margin:0 auto; background:#ffffff; padding:40px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
              <h2 style="color:#059669; margin:0 0 10px 0;">WhatsApp AI Connected!</h2>
              <p style="color:#64748b;">ApexFlow Autonomous OpenRouter AI Assistant is live and listening on your number (+971 50 750 7963).</p>
              <div style="margin-top:20px; padding:14px; background:#ecfdf5; border-radius:8px; color:#065f46; font-weight:600; text-align:left; font-size:13px; line-height:1.6;">
                <strong>Active Models (Multi-Tier Fallback):</strong><br>
                1. openai/gpt-4o-mini<br>
                2. meta-llama/llama-3.3-70b-instruct<br>
                3. deepseek/deepseek-chat<br>
                4. qwen/qwen-2.5-72b-instruct<br>
                5. mistralai/mistral-small-24b-instruct-2501<br>
                6. meta-llama/llama-3.1-8b-instruct
              </div>
            </div>
          </body>
        </html>
      `);
    } else if (latestQR) {
      const qrDataUrl = await QRCode.toDataURL(latestQR, { width: 320, margin: 2 });
      res.end(`
        <html>
          <head><meta http-equiv="refresh" content="5"></head>
          <body style="font-family:-apple-system, sans-serif; text-align:center; padding:40px; background:#f8fafc;">
            <div style="max-width:480px; margin:0 auto; background:#ffffff; padding:30px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
              <h2 style="color:#0f172a; margin:0 0 8px 0;">Connect ApexFlow WhatsApp</h2>
              <p style="color:#64748b; font-size:14px; margin:0 0 24px 0;">
                1. Open WhatsApp on your phone<br>
                2. Tap <strong>Settings &rarr; Linked Devices &rarr; Link a Device</strong><br>
                3. Point your camera at this QR code:
              </p>
              <img src="${qrDataUrl}" style="border:1px solid #e2e8f0; border-radius:12px; padding:8px; display:inline-block;" />
              <p style="color:#94a3b8; font-size:12px; margin-top:20px;">Refreshes automatically every 5 seconds until scanned.</p>
            </div>
          </body>
        </html>
      `);
    } else {
      res.end(`
        <html>
          <head><meta http-equiv="refresh" content="2"></head>
          <body style="font-family:-apple-system, sans-serif; text-align:center; padding:50px;">
            <h3>Initializing WhatsApp Engine...</h3>
            <p>Please wait a moment.</p>
          </body>
        </html>
      `);
    }
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`[HTTP] WhatsApp QR server running at: http://localhost:${PORT}`);
});

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ["ApexFlow AI Growth Assistant", "Safari", "17.0"]
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      latestQR = qr;
      console.log("\n========================================================");
      console.log("👉 SCAN THIS QR CODE IN WHATSAPP (OR OPEN http://localhost:3000):");
      console.log("========================================================\n");
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      isConnected = false;
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log(`[WhatsApp] Connection closed. Reason: ${lastDisconnect?.error?.message}. Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startWhatsAppBot, 3000);
      }
    } else if (connection === 'open') {
      isConnected = true;
      latestQR = null;
      console.log("\n🚀 [WhatsApp] CONNECTED SUCCESSFULLY TO YOUR WHATSAPP NUMBER!");
      console.log("🤖 Autonomous OpenRouter AI qualification engine is live with 6-model fallback.\n");
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      // Ignore messages sent by you
      if (msg.key.fromMe) continue;

      // Ignore group chats
      const sender = msg.key.remoteJid;
      if (sender.endsWith('@g.us')) continue;

      // Extract text content
      const text = msg.message?.conversation ||
                   msg.message?.extendedTextMessage?.text ||
                   msg.message?.imageMessage?.caption || "";

      if (!text || !text.trim()) continue;

      const phone = sender.replace('@s.whatsapp.net', '');
      console.log(`\n[Incoming] From: +${phone} | Message: "${text.trim()}"`);

      // Check if this contact has requested human takeover
      if (pausedSenders.has(sender)) {
        console.log(`  ⏸️ [Human Mode] Chat from +${phone} is paused for Sahil's direct takeover.`);
        logLead(phone, text, "[Human Handover Active]", "PAUSED_FOR_SAHIL");
        continue;
      }

      // Check if contact wants human takeover now
      if (wantsHuman(text)) {
        console.log(`  👤 [Handover Requested] Prospect +${phone} asked for Sahil directly.`);
        pausedSenders.add(sender);
        const handoverReply = `Got it! I have notified Sahil directly so he can take over this conversation. You can also call or message him directly anytime at +971 50 750 7963.`;
        await sock.sendMessage(sender, { text: handoverReply });
        logLead(phone, text, handoverReply, "HANDED_TO_SAHIL");
        continue;
      }

      // Check if user is an existing active lead or triggers a new business inquiry
      const isExistingLead = activeBusinessSenders.has(sender);
      const isNewTrigger = shouldTrigger(text);

      if (!isExistingLead && !isNewTrigger) {
        console.log(`  🤫 [Ignored] Personal / non-business message from +${phone}. Stays completely silent.`);
        continue;
      }

      // Mark as active business lead
      activeBusinessSenders.add(sender);

      // Append user message to memory
      appendToHistory(sender, 'user', text);

      // Indicate typing status
      try {
        await sock.sendPresenceUpdate('composing', sender);
      } catch (_) {}

      // Generate AI response using OpenRouter with multi-model fallback
      const reply = await generateAIReply(conversationHistories.get(sender));

      // Append AI response to memory
      appendToHistory(sender, 'assistant', reply);

      // Send reply via WhatsApp
      await sock.sendMessage(sender, { text: reply });

      // Clear typing status
      try {
        await sock.sendPresenceUpdate('paused', sender);
      } catch (_) {}

      // Log interaction
      logLead(phone, text, reply, "AI_CONVERSED");
      console.log(`  ✅ [Reply Sent] to +${phone} (${reply.length} chars).`);
    }
  });
}

startWhatsAppBot();
