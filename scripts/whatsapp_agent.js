const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const http = require('http');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const AUTH_DIR = path.join(__dirname, '../cache/wa_auth');
const LEADS_FILE = path.join(__dirname, '../whatsapp_inbound_leads.csv');
const FOLLOWUP_FILE = path.join(__dirname, '../cache/lead_followups.json');
const PORT = process.env.PORT || 3000;

// Sahil personal phone number for instant hot lead alerts
const SAHIL_PHONE = (process.env.SAHIL_PHONE || '918076541146').replace(/[^0-9]/g, '');
const SAHIL_JID = `${SAHIL_PHONE}@s.whatsapp.net`;

// Google Sheets Webhook Endpoint
const GOOGLE_SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK || 'https://script.google.com/macros/s/AKfycbxwnLG2b2DWalLeOcwt1FiN-oc0bpMsSN2Fca6s9HByubaQTTrZNk2WnGBNWHudrucp/exec';

// Load untracked local .env if present
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const l of envLines) {
      const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
} catch (_) {}

// API Keys
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Multi-Tier Fallback AI Models (ordered by intelligence, performance, and reliability)
const FALLBACK_MODELS = [
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat',
  'qwen/qwen-2.5-72b-instruct',
  'mistralai/mistral-small-24b-instruct-2501',
  'meta-llama/llama-3.1-8b-instruct'
];

// System Prompt with Comprehensive Agency Knowledge & Bilingual Gulf Dialect Support
const APEXFLOW_SYSTEM_PROMPT = `You are the AI Assistant for Sahil Sheoran, founder and Principal Growth Technologist at ApexFlow Digital (Dubai, UAE).

Agency Overview:
ApexFlow Digital is a premier growth technology agency based in Dubai, UAE, helping startups, boutique brands, and SMBs scale across the UAE and Saudi Arabia (KSA).

Core Services & Specializations:
1. Sub-Second Web Speed Engineering: Guaranteeing 90-100 Google Core Web Vitals on mobile. Next.js / clean HTML5, WebP/AVIF image pipelines, script deferral, edge caching. UAE/Saudi mobile users drop off if load time exceeds 2.5s; ApexFlow delivers sub-second speeds.
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

Bilingual Gulf Market Intelligence (Arabic & English):
- ApexFlow serves UAE (Dubai, Abu Dhabi) and Saudi Arabia (Riyadh, Jeddah).
- LANGUAGE DETECTION: If the prospect writes in Arabic (or if Arabic text is present), immediately respond in warm, polite, highly professional Modern Standard Arabic with natural Gulf business phrasing (Saudi / UAE friendly).
- If the prospect writes in English, reply in natural, concise English.
- Do not mix languages unless quoting specific technical terms (Shopify, Google Maps, Next.js).

Communication Guidelines (HUMANIZER STANDARD):
- Respond in a warm, direct, natural human tone (like a knowledgeable tech founder chatting on WhatsApp).
- Keep responses concise: 1 to 3 short paragraphs maximum. Avoid walls of text.
- NEVER use em-dashes (—). Use regular hyphens or commas instead.
- Zero AI buzzwords: Never say "delve", "tapestry", "testament", "game-changer", "seamlessly", "furthermore", "in conclusion", "it is worth noting".
- No excessive bullet points or numbered lists unless strictly clarifying steps.
- Naturally guide the conversation toward booking a 10-15 minute screen-share strategy session on Google Meet (https://meet.google.com/ksd-sids-trc) or the live calendar (https://apexflow-digital.vercel.app/contact.html).
- If the prospect wants to speak directly with Sahil or a human, gracefully let them know you have alerted Sahil and give them his direct number: +971 50 750 7963.`;

// Ensure auth and cache directories exist
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}
const CACHE_DIR = path.dirname(FOLLOWUP_FILE);
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Ensure CSV log exists
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, 'Timestamp,PhoneNumber,MessageReceived,BotReply,Status\n', 'utf-8');
}

let latestQR = null;
let isConnected = false;
let activeSock = null;

// Conversation memory: phone -> Array<{ role: 'user' | 'assistant', content: string }>
const conversationHistories = new Map();
const activeBusinessSenders = new Set();
const pausedSenders = new Set(); // Senders who requested human takeover
const alertCooldowns = new Map(); // phone -> lastAlertTimestamp

// Load or initialize lead followups persistent store
let leadFollowups = {};
try {
  if (fs.existsSync(FOLLOWUP_FILE)) {
    leadFollowups = JSON.parse(fs.readFileSync(FOLLOWUP_FILE, 'utf-8'));
  }
} catch (_) {
  leadFollowups = {};
}

function saveFollowups() {
  try {
    fs.writeFileSync(FOLLOWUP_FILE, JSON.stringify(leadFollowups, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save follow-up cache:', err.message);
  }
}

// Keywords that trigger the business assistant on new conversations (English + Arabic)
const TRIGGER_KEYWORDS = [
  'speed', 'audit', 'quote', 'pilot', 'demo', 'revent',
  'bottleneck', 'call', 'apexflow', 'shopify', 'woocommerce',
  'load time', 'price', 'pricing', 'developer', 'meeting',
  'seo', 'website', 'cost', 'retainer', 'marketing', 'dubai',
  'ecommerce', 'help', 'work', 'proposal', 'contract', 'hire', 'service',
  // Arabic Gulf keywords:
  'سرعة', 'موقع', 'متجر', 'سعر', 'أسعار', 'عرض', 'شوبيفاي',
  'سيو', 'تسويق', 'برمجة', 'أتمتة', 'استشارة', 'تكلفة', 'تطوير', 'خدمة', 'رابط'
];

// Keywords indicating user wants human handover (English + Arabic)
const HUMAN_HANDOVER_KEYWORDS = [
  'human', 'real person', 'speak to sahil', 'talk to sahil', 'call me', 'speak with sahil',
  // Arabic handover:
  'إنسان', 'تحدث مع شخص', 'اتصل بي', 'أريد التحدث مع ساحيل', 'ساحيل', 'شخص حقيقي'
];

function isArabicText(text) {
  return /[\u0600-\u06FF]/.test(text || '');
}

function shouldTrigger(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return TRIGGER_KEYWORDS.some(k => lower.includes(k)) || extractUrl(text) !== null;
}

function wantsHuman(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return HUMAN_HANDOVER_KEYWORDS.some(k => lower.includes(k));
}

function extractUrl(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.(?:ae|com|sa|me|io|net|org|store|tech|co|app)[^\s]*)/i;
  const match = text.match(urlRegex);
  if (!match) return null;
  let raw = match[0].trim().replace(/[.,;!?()]+$/, '');
  if (!/^https?:\/\//i.test(raw)) {
    raw = 'https://' + raw;
  }
  return raw;
}

function appendToHistory(sender, role, content) {
  let history = conversationHistories.get(sender);
  if (!history) {
    history = [];
    conversationHistories.set(sender, history);
  }
  history.push({ role, content });
  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }
}

function logLead(phone, incoming, reply, status) {
  const row = `"${new Date().toISOString()}","${phone}","${incoming.replace(/"/g, '""')}","${reply.replace(/"/g, '""')}","${status}"\n`;
  fs.appendFileSync(LEADS_FILE, row, 'utf-8');
}

/**
 * Live Website Performance & CMS Diagnostic Helper
 */
async function runLiveWebsiteAudit(targetUrl, isArabic) {
  const start = Date.now();
  let domain = 'website';
  try {
    domain = new URL(targetUrl).hostname;
  } catch (_) {}

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      }
    });
    clearTimeout(timeoutId);

    const ttfb = Date.now() - start;
    const bodyText = await res.text();
    const htmlKb = Math.round(bodyText.length / 1024);
    const encoding = res.headers.get('content-encoding') || 'standard';

    // Detect CMS / Stack
    const lowerBody = bodyText.toLowerCase();
    const headerStr = JSON.stringify([...res.headers.entries()]).toLowerCase();

    let stack = 'Custom Modern Web Stack';
    if (headerStr.includes('shopify') || lowerBody.includes('cdn.shopify.com')) {
      stack = 'Shopify Storefront';
    } else if (lowerBody.includes('woocommerce')) {
      stack = 'WooCommerce Store';
    } else if (lowerBody.includes('wp-content')) {
      stack = 'WordPress';
    } else if (lowerBody.includes('__next') || lowerBody.includes('/_next/')) {
      stack = 'Next.js App';
    } else if (lowerBody.includes('webflow')) {
      stack = 'Webflow';
    } else if (lowerBody.includes('magento') || lowerBody.includes('/static/frontend/')) {
      stack = 'Magento Enterprise';
    }

    // Performance Score Estimation
    let score = 92;
    if (ttfb > 1200) score -= 45;
    else if (ttfb > 600) score -= 25;
    else if (ttfb > 300) score -= 12;

    if (htmlKb > 150) score -= 15;
    else if (htmlKb > 90) score -= 8;

    if (!res.headers.get('content-encoding')) score -= 10;
    score = Math.max(24, Math.min(96, score));

    if (isArabic) {
      return {
        domain,
        score,
        ttfb,
        stack,
        summary: `⚡ *تقرير فحص السرعة المباشر: ${domain}*

📱 *تقييم أداء الجوال التقديري:* ${score}/100
⏱️ *سرعة استجابة الخادم (TTFB):* ${ttfb} مللي ثانية (المعيار المثالي: أقل من 200 مللي ثانية)
🛠️ *المنصة:* ${stack}
📦 *حجم الصفحة الرئيسية:* ${htmlKb} كيلوبايت

🚨 *التأثير على الإعلانات والتحويلات:* ${score < 60 ? 'البطء الحالي يتسبب في فقدان 30% إلى 45% من زوار الحملات الإعلانية قبل إتمام الشراء.' : 'الأداء جيد ولكن توجد فرص لتحسين سرعة الدفع ورفع معدل التحويل.'}

هل يناسبك ترتيب مكالمة سريعة لمدة 10 دقائق على Google Meet لمراجعة الحلول البرمجية لتسريع المتجر؟
https://meet.google.com/ksd-sids-trc`
      };
    }

    return {
      domain,
      score,
      ttfb,
      stack,
      summary: `⚡ *ApexFlow Live Speed Diagnostic: ${domain}*

📱 *Estimated Mobile Performance:* ${score}/100
⏱️ *Server Response Time (TTFB):* ${ttfb}ms (UAE benchmark target: < 200ms)
🛠️ *Detected Stack:* ${stack}
📦 *Page Payload:* ${htmlKb} KB (${encoding})

🚨 *Commercial Impact:* ${score < 60 ? 'Slow mobile response is likely causing ~30-40% drop-off on paid Meta & Google ad clicks before product interaction.' : 'Decent baseline, but sub-second script deferral can lift mobile checkout conversions.'}

Would you like to hop on a quick 10-minute screen share on Google Meet (https://meet.google.com/ksd-sids-trc) so I can show you the exact bottleneck scripts?`
    };

  } catch (err) {
    console.warn(`  ⚠️ [Live Audit Error] for ${targetUrl}:`, err.message);
    if (isArabic) {
      return {
        domain,
        score: null,
        summary: `مرحباً! حاولت فحص الرابط (${domain}) لكن يبدو أن الموقع محمي أو يستغرق وقتاً طويلاً للاستجابة. يمكننا مراجعة الكود مباشرة عبر مكالمة سريعة: https://meet.google.com/ksd-sids-trc`
      };
    }
    return {
      domain,
      score: null,
      summary: `I attempted to ping ${domain}, but the server took longer than 6 seconds to respond. That server delay alone is a primary reason mobile shoppers bounce. Feel free to pick a 10-minute slot on Sahil\'s calendar so we can inspect it together: https://apexflow-digital.vercel.app/contact.html`
    };
  }
}

/**
 * Voice Note (Audio) Transcription Engine via Whisper API
 */
async function transcribeAudioBuffer(audioBuffer) {
  const apiKey = GROQ_API_KEY || OPENAI_API_KEY;
  if (!apiKey) {
    console.log('  ℹ️ [Whisper] No GROQ_API_KEY or OPENAI_API_KEY configured for voice note transcription.');
    return null;
  }

  const endpoint = GROQ_API_KEY
    ? 'https://api.groq.com/openai/v1/audio/transcriptions'
    : 'https://api.openai.com/v1/audio/transcriptions';
  const model = GROQ_API_KEY ? 'whisper-large-v3-turbo' : 'whisper-1';

  try {
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'voice_note.ogg');
    formData.append('model', model);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`  ⚠️ [Whisper API Error] (${res.status}): ${errText.slice(0, 150)}`);
      return null;
    }

    const data = await res.json();
    return data.text?.trim() || null;
  } catch (err) {
    console.error('  ⚠️ [Whisper Transcription Failed]:', err.message);
    return null;
  }
}

/**
 * Real-Time Hot Lead Alert to Sahil\'s Personal WhatsApp (+918076541146)
 */
async function sendSahilHotLeadAlert(sock, leadData) {
  const phone = leadData.phone;
  const now = Date.now();
  const lastAlert = alertCooldowns.get(phone) || 0;

  if (now - lastAlert < 20 * 60 * 1000 && !leadData.forceAlert) {
    return;
  }
  alertCooldowns.set(phone, now);

  const alertMsg = `🔥 *APEXFLOW HOT LEAD ALERT*

👤 *Prospect:* +${phone}
🌐 *Website / Domain:* ${leadData.domain || 'Not mentioned'}
💬 *Incoming Message:*
"${leadData.message ? leadData.message.trim().slice(0, 250) : ''}"
🎯 *Trigger Reason:* ${leadData.reason}

👉 *Tap to open chat with prospect:*
https://wa.me/${phone}`;

  try {
    await sock.sendMessage(SAHIL_JID, { text: alertMsg });
    console.log(`  📲 [Sahil Alert Dispatched] to +${SAHIL_PHONE} for prospect +${phone}`);
  } catch (err) {
    console.warn(`  ⚠️ [Sahil Alert Failed]: ${err.message}`);
  }
}

/**
 * Real-Time Google Sheets Webhook Lead Sync
 */
async function syncLeadToGoogleSheet(leadData) {
  try {
    const payload = {
      fullName: leadData.name || `WhatsApp Lead +${leadData.phone}`,
      companyName: leadData.company || leadData.domain || 'WhatsApp Inbound',
      email: leadData.email || 'N/A',
      whatsapp: `+${leadData.phone}`,
      website: leadData.domain || 'N/A',
      serviceRequired: leadData.service || 'Speed Audit / SEO / E-Commerce',
      budget: leadData.budget || 'AED 4,500 - AED 8,500',
      challenge: leadData.message || 'Direct Inbound WhatsApp Chat',
      contactPref: 'WhatsApp',
      source: 'WhatsApp AI Engine (Cloud)'
    };

    fetch(GOOGLE_SHEETS_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(e => console.warn('  ⚠️ [Google Sheets Sync Background Error]:', e.message));

    console.log(`  📊 [Google Sheets Sync Triggered] for +${leadData.phone}`);
  } catch (err) {
    console.warn(`  ⚠️ [Google Sheets Sync Error]:`, err.message);
  }
}

/**
 * Automated 24-Hour Follow-Up Scheduler (Dubai Business Hours: 10 AM - 7 PM GST)
 */
function initFollowUpScheduler(sock) {
  // Check every 15 minutes
  setInterval(async () => {
    if (!isConnected) return;

    // Check Dubai hour
    const dubaiHourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dubai',
      hour: 'numeric',
      hour12: false
    }).format(new Date());
    const dubaiHour = parseInt(dubaiHourStr, 10);

    // Business hours gate: 10 AM to 7 PM GST
    if (dubaiHour < 10 || dubaiHour >= 19) {
      return;
    }

    const now = Date.now();
    for (const [phone, lead] of Object.entries(leadFollowups)) {
      if (lead.followUpSent || lead.paused) continue;

      const elapsedHours = (now - lead.lastInteraction) / (1000 * 60 * 60);

      // Follow up between 24 and 48 hours after inactivity
      if (elapsedHours >= 24 && elapsedHours <= 48) {
        const jid = `${phone}@s.whatsapp.net`;
        const followUpText = lead.isArabic
          ? `مرحباً! أردت فقط الاطمئنان بخصوص تقرير سرعة وأداء موقعك${lead.domain ? ` (${lead.domain})` : ''}. يسعدني ترتيب مكالمة سريعة لمدة 10 دقائق لمراجعة الحلول البرمجية وتسريع المتجر عندما يناسبك الوقت.\nhttps://meet.google.com/ksd-sids-trc`
          : `Hi! Just following up to see if you had a chance to review the speed numbers for your store${lead.domain ? ` (${lead.domain})` : ''}? Happy to walk through the 10-minute pilot fix whenever you have a moment.\nhttps://meet.google.com/ksd-sids-trc`;

        try {
          await sock.sendMessage(jid, { text: followUpText });
          lead.followUpSent = true;
          lead.followUpTimestamp = now;
          saveFollowups();
          logLead(phone, '[Automated 24h Inactivity]', followUpText, 'FOLLOW_UP_24H_SENT');
          console.log(`  ⏰ [Automated 24h Follow-Up Sent] to +${phone}`);

          // Alert Sahil
          await sock.sendMessage(SAHIL_JID, {
            text: `⏰ *24h Follow-Up Sent*\nTo: +${phone}\nWebsite: ${lead.domain || 'N/A'}\nChat: https://wa.me/${phone}`
          }).catch(() => {});

        } catch (err) {
          console.warn(`  ⚠️ [Follow-up Dispatch Failed] for +${phone}:`, err.message);
        }
      }
    }
  }, 15 * 60 * 1000);
}

/**
 * Dispatches query to OpenRouter with automatic multi-model fallback
 */
async function generateAIReply(chatHistory) {
  for (let i = 0; i < FALLBACK_MODELS.length; i++) {
    const model = FALLBACK_MODELS[i];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

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
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        console.log(`  🤖 [AI Reply Generated via ${model}]`);
        return content.replace(/—/g, '-').replace(/–/g, '-');
      }
    } catch (err) {
      console.warn(`  ⚠️ [Model Error] ${model} failed (${err.message}) -> Trying fallback...`);
    }
  }

  // Emergency fallback
  console.error('  ❌ All OpenRouter AI fallback models failed. Using emergency fallback template.');
  return `Hi! Thanks for reaching out. To analyze your website bottlenecks or growth opportunities, feel free to pick a 15-minute slot on Sahil\'s live calendar: https://apexflow-digital.vercel.app/contact.html or jump straight into our Google Meet room: https://meet.google.com/ksd-sids-trc. Best, Sahil Sheoran`;
}

// HTTP server to show QR code and system status in browser
const server = http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/qr') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (isConnected) {
      res.end(`
        <html>
          <body style="font-family:-apple-system, sans-serif; text-align:center; padding:50px; background:#f8fafc;">
            <div style="max-width:560px; margin:0 auto; background:#ffffff; padding:40px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
              <h2 style="color:#059669; margin:0 0 10px 0;">WhatsApp AI Connected &amp; Autonomous!</h2>
              <p style="color:#64748b;">ApexFlow Autonomous OpenRouter AI Assistant is live and listening on your number (+971 50 750 7963).</p>
              
              <div style="margin-top:20px; padding:14px; background:#f0fdf4; border-radius:8px; color:#166534; font-weight:600; text-align:left; font-size:13px; line-height:1.7;">
                <strong>Active 24/7 Capabilities:</strong><br>
                ⚡ Live Speed &amp; CMS Diagnostic on URL Detection<br>
                🎙️ Voice Note (Audio) Transcription Support<br>
                🌍 Native Gulf Arabic &amp; English Auto-Switching<br>
                📲 Real-Time Hot Lead WhatsApp Alerts to +${SAHIL_PHONE}<br>
                ⏰ 24-Hour Automated Follow-Up Sequence (Dubai Hours)<br>
                📊 Real-Time Google Sheets Webhook Sync
              </div>

              <div style="margin-top:14px; padding:14px; background:#ecfdf5; border-radius:8px; color:#065f46; font-weight:600; text-align:left; font-size:13px; line-height:1.6;">
                <strong>Active Models (Multi-Tier Fallback):</strong><br>
                1. openai/gpt-4o-mini<br>
                2. meta-llama/llama-3.3-70b-instruct<br>
                3. deepseek/deepseek-chat<br>
                4. qwen/qwen-2.5-72b-instruct<br>
                5. mistralai/mistral-small-24b-instruct-2501<br>
                6. meta-llama/llama-3.1-8b-instruct
              </div>

              <div style="margin-top:20px;">
                <a href="/test" style="display:inline-block; padding:10px 20px; background:#059669; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">📲 Send Test Message to Founder (+${SAHIL_PHONE})</a>
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
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: isConnected ? 'connected' : 'waiting_for_qr',
      activeLeads: activeBusinessSenders.size,
      uptime: process.uptime()
    }));
  } else if (req.url === '/test' || req.url === '/send-test') {
    if (!isConnected || !activeSock) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'WhatsApp bot is not connected yet. Please scan QR first.' }));
    }
    try {
      const msg = `⚡ *ApexFlow Digital — Manual System Ping*\n\nHi Sahil! This is a manual test dispatch from your live ApexFlow WhatsApp Engine.\n\nStatus: Operational\nNode Uptime: ${Math.round(process.uptime())}s`;
      await activeSock.sendMessage(SAHIL_JID, { text: msg });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, recipient: SAHIL_JID, timestamp: new Date().toISOString() }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`[HTTP] WhatsApp server running at: http://localhost:${PORT}`);
});

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['ApexFlow AI Growth Assistant', 'Safari', '17.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      latestQR = qr;
      console.log('\n========================================================');
      console.log('👉 SCAN THIS QR CODE IN WHATSAPP (OR OPEN http://localhost:3000):');
      console.log('========================================================\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      isConnected = false;
      activeSock = null;
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log(`[WhatsApp] Connection closed. Reason: ${lastDisconnect?.error?.message}. Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startWhatsAppBot, 3000);
      }
    } else if (connection === 'open') {
      isConnected = true;
      latestQR = null;
      activeSock = sock;
      console.log('\n🚀 [WhatsApp] CONNECTED SUCCESSFULLY TO YOUR WHATSAPP NUMBER!');
      console.log('🤖 Autonomous OpenRouter AI qualification engine is live with 6-model fallback.\n');
      initFollowUpScheduler(sock);

      // Auto-dispatch test notification to Sahil on connect
      try {
        await sock.sendMessage(SAHIL_JID, {
          text: `🚀 *ApexFlow AI WhatsApp Engine Connected!*\n\nHi Sahil! Your WhatsApp AI assistant is now online and active.\n\n✅ *Live Capabilities:*\n• Sub-second In-Chat Website Speed Diagnostic\n• Prospect Voice Note Audio Transcription\n• Native Gulf Arabic & English Auto-Switching\n• Real-Time Hot Lead Alerts & Founder Handoff\n• Dubai Business Hours Follow-Up Automation\n• Real-Time Google Sheets Webhook Sync\n\nSend any website URL or message to test live!`
        });
        console.log(`[WhatsApp] Sent connection confirmation to Sahil (${SAHIL_JID})`);
      } catch (err) {
        console.error(`[WhatsApp] Failed to send connection confirmation to Sahil:`, err.message);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;

      const sender = msg.key.remoteJid;
      if (sender.endsWith('@g.us')) continue;

      const phone = sender.replace('@s.whatsapp.net', '');
      const isAudio = Boolean(msg.message?.audioMessage);

      let text = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption || '';

      // Handle voice notes
      if (isAudio && !text) {
        console.log(`\n[Incoming Voice Note] From: +${phone}...`);
        try {
          const audioBuffer = await downloadMediaMessage(msg, 'buffer', {});
          const transcription = await transcribeAudioBuffer(audioBuffer);
          if (transcription) {
            console.log(`  🎙️ [Voice Note Transcribed]: "${transcription}"`);
            text = transcription;
          } else {
            text = '[Voice note received from prospect]';
          }
        } catch (audioErr) {
          console.warn(`  ⚠️ [Audio Download Error]:`, audioErr.message);
          text = '[Voice note received]';
        }
      }

      if (!text || !text.trim()) continue;

      const arabic = isArabicText(text);
      console.log(`\n[Incoming] From: +${phone} (${arabic ? 'Arabic' : 'English'}) | Message: "${text.trim()}"`);

      if (pausedSenders.has(sender)) {
        console.log(`  ⏸️ [Human Mode] Chat from +${phone} is paused for Sahil direct takeover.`);
        logLead(phone, text, '[Human Handover Active]', 'PAUSED_FOR_SAHIL');
        continue;
      }

      if (wantsHuman(text)) {
        console.log(`  👤 [Handover Requested] Prospect +${phone} asked for Sahil directly.`);
        pausedSenders.add(sender);

        const handoverReply = arabic
          ? `تم إبلاغ المهندس ساحيل شيران مباشرة وسيتواصل معك شخصياً في أقرب وقت. يمكنك أيضاً الاتصال به أو مراسلته مباشرة على: +971 50 750 7963.`
          : `Got it! I have notified Sahil directly so he can take over this conversation. You can also call or message him directly anytime at +971 50 750 7963.`;

        await sock.sendMessage(sender, { text: handoverReply });
        logLead(phone, text, handoverReply, 'HANDED_TO_SAHIL');

        await sendSahilHotLeadAlert(sock, {
          phone,
          message: text,
          reason: 'Prospect requested direct human handover / Sahil',
          forceAlert: true
        });

        leadFollowups[phone] = {
          phone,
          lastInteraction: Date.now(),
          isArabic: arabic,
          paused: true,
          followUpSent: true
        };
        saveFollowups();
        continue;
      }

      const isExistingLead = activeBusinessSenders.has(sender);
      const isNewTrigger = shouldTrigger(text);

      if (!isExistingLead && !isNewTrigger) {
        console.log(`  🤫 [Ignored] Personal / non-business message from +${phone}. Stays completely silent.`);
        continue;
      }

      activeBusinessSenders.add(sender);

      const detectedUrl = extractUrl(text);
      let auditResult = null;
      let reply = '';

      try {
        await sock.sendPresenceUpdate('composing', sender);
      } catch (_) {}

      if (detectedUrl) {
        console.log(`  🔍 [URL Detected]: ${detectedUrl} -> Running live performance audit...`);
        auditResult = await runLiveWebsiteAudit(detectedUrl, arabic);
        reply = auditResult.summary;

        appendToHistory(sender, 'user', text);
        appendToHistory(sender, 'assistant', reply);

        await sock.sendMessage(sender, { text: reply });

        await sendSahilHotLeadAlert(sock, {
          phone,
          domain: auditResult.domain,
          message: text,
          reason: `Shared URL (${auditResult.domain}) - Score: ${auditResult.score || 'N/A'}/100`,
          forceAlert: false
        });

        syncLeadToGoogleSheet({
          phone,
          domain: auditResult.domain,
          service: `Speed Audit (${auditResult.stack})`,
          message: text
        });

      } else {
        appendToHistory(sender, 'user', text);
        reply = await generateAIReply(conversationHistories.get(sender));
        appendToHistory(sender, 'assistant', reply);

        await sock.sendMessage(sender, { text: reply });

        const lower = text.toLowerCase();
        if (lower.includes('price') || lower.includes('cost') || lower.includes('quote') ||
            lower.includes('pilot') || lower.includes('budget') || lower.includes('سعر') || lower.includes('تكلفة')) {
          await sendSahilHotLeadAlert(sock, {
            phone,
            message: text,
            reason: 'Inquired about pricing / pilot scope'
          });

          syncLeadToGoogleSheet({
            phone,
            service: 'Pricing / Retainer Inquiry',
            message: text
          });
        }
      }

      try {
        await sock.sendPresenceUpdate('paused', sender);
      } catch (_) {}

      logLead(phone, text, reply, detectedUrl ? 'AUDIT_SENT' : 'AI_CONVERSED');
      console.log(`  ✅ [Reply Sent] to +${phone} (${reply.length} chars).`);

      leadFollowups[phone] = {
        phone,
        lastInteraction: Date.now(),
        isArabic: arabic,
        domain: detectedUrl ? auditResult?.domain : (leadFollowups[phone]?.domain || null),
        followUpSent: false,
        paused: false
      };
      saveFollowups();
    }
  });
}

startWhatsAppBot();
