/**
 * ApexFlow Digital — In-Browser Autonomous AI Concierge Engine
 * Features:
 * - Bilingual English & Arabic conversational knowledge base
 * - Real-time intent recognition across all 9 ApexFlow growth services
 * - Live lead capture synced to Google Sheets Web App & WhatsApp
 */

(function() {
  'use strict';

  const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxwnLG2b2DWalLeOcwt1FiN-oc0bpMsSN2Fca6s9HByubaQTTrZNk2WnGBNWHudrucp/exec';
  const FOUNDER_WHATSAPP = '971507507963';

  const KNOWLEDGE_BASE = {
    seo: {
      keywords: ['seo', 'google maps', 'rank', 'ranking', 'local seo', '3-pack', 'traffic', 'search'],
      response: "📍 **Dubai Local SEO & Google Maps Dominance**:\nWe engineer localized entity citations, technical LocalBusiness schema, and review velocity funnels. Our clients typically secure Top-3 Google Maps rankings in 30–60 days, cutting paid ad dependence. Packages start from AED 3,500/mo.",
      cta: "Book SEO Consultation",
      serviceTag: "Local SEO UAE"
    },
    whatsapp: {
      keywords: ['whatsapp', 'bot', 'chat', 'chat bot', 'ai bot', 'automation', 'reply', 'speed'],
      response: "💬 **Sub-30s WhatsApp AI Lead Automation**:\nWe build bilingual (English/Arabic) AI agents on the official Meta WhatsApp Business Cloud API. They qualify buyer budgets, answer technical questions, and sync meetings directly into Google Calendar & HubSpot within 20 seconds.",
      cta: "Test WhatsApp Bot",
      serviceTag: "WhatsApp AI Bots UAE"
    },
    web: {
      keywords: ['web', 'website', 'speed', 'development', 'performance', 'core web vitals', 'lcp', 'fast'],
      response: "⚡ **Sub-Second Web & Next.js Engineering**:\nWe build ultra-fast, zero-bloat static & serverless web platforms achieving 100/100 Core Web Vitals on UAE 5G networks (average LCP: 0.42s). Perfect for luxury brands, real estate, and high-ticket service firms.",
      cta: "Explore Web Engineering",
      serviceTag: "Web Development UAE"
    },
    shopify: {
      keywords: ['shopify', 'ecommerce', 'e-commerce', 'store', 'tabby', 'tamara', 'checkout', 'bnpl'],
      response: "🛒 **Shopify & GCC Checkout CRO**:\nWe optimize Shopify storefronts with sub-second mobile page loads, native Tabby/Tamara 4-installment BNPL integrations, and automated WhatsApp address verification to slash Cash-on-Delivery (COD) returns.",
      cta: "Optimize Shopify Store",
      serviceTag: "Shopify E-Commerce UAE"
    },
    ads: {
      keywords: ['ads', 'google ads', 'meta', 'facebook', 'instagram', 'ppc', 'roas', 'ad spend'],
      response: "🎯 **High-ROAS Paid Acquisition**:\nWe engineer high-intent Google Search and Performance Max campaigns backed by custom 15%+ conversion landing funnels and server-side GA4 revenue attribution.",
      cta: "Review Ad Strategy",
      serviceTag: "Google & Meta Ads UAE"
    },
    pricing: {
      keywords: ['price', 'pricing', 'cost', 'rates', 'package', 'packages', 'how much', 'quote', 'aed'],
      response: "💰 **Transparent UAE Investment Packages**:\n• **Starter Stack**: AED 3,500/mo (Local SEO + Core CWV Speed)\n• **Growth Stack**: AED 6,500/mo (SEO + Sub-30s WhatsApp AI Bot + Webhooks)\n• **Enterprise Custom**: AED 12,000+/mo (Full Digital Infrastructure & Paid Ads)",
      cta: "Request Custom Quote",
      serviceTag: "Custom Quote Inquiry"
    },
    arabic: {
      keywords: ['arabic', 'عربي', 'العربية', 'مرحبا', 'خدمات', 'دبي', 'اسعار'],
      response: "🇦🇪 **مرحباً بك في أبيكس فلو ديجيتال (ApexFlow Digital)**\nنحن وكالة هندسة نمو رقمي رائدة في الإمارات، متخصصون في:\n• تحسين محركات البحث في دبي وجوجل مابس (Local SEO)\n• روبوتات واتساب الذكية للرد على العملاء في أقل من 30 ثانية\n• مواقع فائقة السرعة ومتاجر شوبيفاي مع تقسيط تابي وتمارا\n\nهل تود حجز استشارة تقنية مجانية مع المهندس ساحل شيران؟",
      cta: "حجز استشارة بالعربية",
      serviceTag: "Arabic Inquiry"
    },
    founder: {
      keywords: ['sahil', 'founder', 'who', 'team', 'experience', 'sheoran', 'credentials'],
      response: "👨‍💻 **Founder & Principal Technologist: Sahil Sheoran**\nSahil specializes in sub-second performance web engineering, conversational AI pipelines, and GCC market acquisition. Connect directly on LinkedIn: linkedin.com/in/sahilsheoran1 or book a direct consultation.",
      cta: "Connect on LinkedIn",
      serviceTag: "Founder Consultation"
    }
  };

  function findAnswer(query) {
    const clean = query.toLowerCase().trim();
    for (const key in KNOWLEDGE_BASE) {
      const item = KNOWLEDGE_BASE[key];
      if (item.keywords.some(kw => clean.includes(kw))) {
        return item;
      }
    }
    return {
      response: "⚡ I can connect you directly with **Sahil Sheoran** (Principal Technologist) to discuss your specific goals in SEO, WhatsApp AI Bots, Web Speed, or Paid Ads in Dubai & Abu Dhabi.",
      cta: "Book Free Strategy Session",
      serviceTag: "General Consultation"
    };
  }

  function initConciergeWidget() {
    const conciergeCard = document.querySelector('.whatsapp-concierge-card');
    if (!conciergeCard) return;

    // Enhance Concierge Markup with Interactive AI Chat Mode
    conciergeCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <div style="position: relative;">
            <img src="assets/images/sahil-sheoran.svg" alt="Sahil Sheoran" style="width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid var(--neon-cyan);">
            <div style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: #05ffa1; border-radius: 50%; border: 2px solid #030712;"></div>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">ApexFlow AI Concierge</div>
            <div class="text-mono" style="font-size: 0.7rem; color: var(--neon-emerald);">🟢 DUBAI_NODE // ACTIVE</div>
          </div>
        </div>
        <button class="concierge-close-btn" aria-label="Close Assistant" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">✕</button>
      </div>

      <!-- Chat History Box -->
      <div id="ai-chat-history" style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 0.75rem; padding-right: 4px;">
        <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.65rem 0.8rem; font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary);">
          👋 Hello! I am the ApexFlow AI assistant. Ask me about UAE SEO, WhatsApp Bots, Web Speed, or transparent pricing.
        </div>
      </div>

      <!-- Quick Chips -->
      <div id="ai-quick-chips" style="display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 0.6rem; scrollbar-width: none;">
        <button class="ai-chip" data-query="whatsapp">💬 WhatsApp Bot</button>
        <button class="ai-chip" data-query="seo">📍 Local SEO</button>
        <button class="ai-chip" data-query="web">⚡ 100/100 Speed</button>
        <button class="ai-chip" data-query="pricing">💰 Pricing</button>
        <button class="ai-chip" data-query="arabic">🇦🇪 بالعربية</button>
      </div>

      <!-- Chat Input Form -->
      <form id="ai-chat-form" style="display: flex; gap: 0.4rem; margin-bottom: 0.5rem;">
        <input type="text" id="ai-chat-input" placeholder="Type a question or budget..." style="flex: 1; background: rgba(3,7,18,0.9); border: 1px solid var(--border-cyber); border-radius: 6px; padding: 0.5rem 0.75rem; color: #fff; font-size: 0.85rem; outline: none;">
        <button type="submit" style="background: var(--neon-cyan); border: none; border-radius: 6px; padding: 0.5rem 0.85rem; color: #030712; font-weight: 700; cursor: pointer; font-size: 0.85rem;">Ask</button>
      </form>

      <!-- Instant WhatsApp Direct Fallback -->
      <div style="text-align: center;">
        <a href="https://wa.me/971507507963?text=Hi%20Sahil!%20I%20am%20chatting%20with%20your%20ApexFlow%20AI%20assistant%20and%20want%20to%20connect%20directly." target="_blank" rel="noopener" style="color: var(--neon-emerald); font-size: 0.775rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">
          <span>Prefer direct human chat? WhatsApp Sahil (+971 50 750 7963) →</span>
        </a>
      </div>
    `;

    const chatHistory = document.getElementById('ai-chat-history');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const quickChips = document.querySelectorAll('.ai-chip');
    const closeBtn = conciergeCard.querySelector('.concierge-close-btn');

    closeBtn?.addEventListener('click', () => conciergeCard.classList.remove('open'));

    function appendMessage(text, isUser = false, ctaText = null, serviceTag = 'General') {
      const msg = document.createElement('div');
      msg.style.padding = '0.65rem 0.8rem';
      msg.style.borderRadius = '8px';
      msg.style.fontSize = '0.825rem';
      msg.style.lineHeight = '1.5';
      msg.style.maxWidth = '92%';
      msg.style.wordBreak = 'break-word';

      if (isUser) {
        msg.style.alignSelf = 'flex-end';
        msg.style.background = 'rgba(0, 242, 254, 0.15)';
        msg.style.border = '1px solid rgba(0, 242, 254, 0.3)';
        msg.style.color = '#f8fafc';
        msg.innerText = text;
      } else {
        msg.style.alignSelf = 'flex-start';
        msg.style.background = 'rgba(255, 255, 255, 0.04)';
        msg.style.border = '1px solid var(--border-subtle)';
        msg.style.color = 'var(--text-secondary)';
        msg.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        if (ctaText) {
          const ctaBtn = document.createElement('a');
          ctaBtn.href = `https://wa.me/${FOUNDER_WHATSAPP}?text=${encodeURIComponent(`Hi Sahil! I inquired about ${serviceTag} on your website.`)}`;
          ctaBtn.target = '_blank';
          ctaBtn.rel = 'noopener';
          ctaBtn.className = 'btn btn-primary btn-sm';
          ctaBtn.style.display = 'inline-block';
          ctaBtn.style.marginTop = '0.5rem';
          ctaBtn.style.fontSize = '0.75rem';
          ctaBtn.style.padding = '0.35rem 0.65rem';
          ctaBtn.innerText = `💬 ${ctaText} →`;
          msg.appendChild(ctaBtn);
        }
      }

      chatHistory.appendChild(msg);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function handleQuery(queryText) {
      if (!queryText.trim()) return;
      appendMessage(queryText, true);
      
      const match = findAnswer(queryText);
      setTimeout(() => {
        appendMessage(match.response, false, match.cta, match.serviceTag);
        
        // Push lead intent to Google Sheets asynchronously
        try {
          fetch(GOOGLE_SHEETS_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: 'AI Chat Visitor',
              companyName: 'In-Browser Chat',
              email: 'chat@apexflowdigital.ae',
              whatsapp: 'N/A',
              serviceRequired: match.serviceTag,
              challenge: `User Chat Query: "${queryText}"`,
              contactPref: 'AI Chat',
              source: window.location.pathname
            })
          });
        } catch(e) {}

      }, 400);
    }

    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (val) {
        handleQuery(val);
        chatInput.value = '';
      }
    });

    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        handleQuery(q);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initConciergeWidget);
})();
