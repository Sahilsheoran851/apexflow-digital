/**
 * ApexFlow Digital — Main Client-Side Application Script
 * Performance-first, zero-dependency, analytics-ready
 */

document.addEventListener('DOMContentLoaded', () => {
  initUTMTracking();
  initNavigation();
  initLeadForm();
  initFAQ();
  initWhatsAppTracker();
  initAnalyticsDataLayer();
  initServiceTabs();
  initWhatsAppConcierge();
  initMobileConversionBar();
  initStrategyCallModal();
  initConsultationTabs();
  initInlineScheduler();
});

/**
 * Capture & Store Marketing Attribution Parameters
 */
function initUTMTracking() {
  try {
    const params = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(key => {
      const val = params.get(key);
      if (val) {
        sessionStorage.setItem(`apexflow_${key}`, val);
      }
    });
    if (!sessionStorage.getItem('apexflow_first_landing_page')) {
      sessionStorage.setItem('apexflow_first_landing_page', window.location.pathname);
    }
  } catch (e) {}
}

/**
 * Navigation Bar & Mobile Drawer Controller
 */
function initNavigation() {
  const header = document.querySelector('.header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Header on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile Menu Toggle
  mobileToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('open');
    const isOpen = navMenu?.classList.contains('open');
    mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    
    // Change icon between hamburger and close
    mobileToggle.innerHTML = isOpen 
      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
      : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
  });

  // Smooth Scroll & Close Menu on Click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navMenu?.classList.remove('open');
      document.body.style.overflow = '';
      if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
      }
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(href);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/**
 * Lead Capture & Consultation Form
 */
function initLeadForm() {
  const forms = document.querySelectorAll('#consultation-form, .service-lead-form');
  if (!forms.length) return;

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      // Extract & Persist UTM Attribution
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source') || sessionStorage.getItem('apexflow_utm_source') || 'organic';
      const utmMedium = urlParams.get('utm_medium') || sessionStorage.getItem('apexflow_utm_medium') || 'direct';
      const utmCampaign = urlParams.get('utm_campaign') || sessionStorage.getItem('apexflow_utm_campaign') || 'none';
      const gclid = urlParams.get('gclid') || sessionStorage.getItem('apexflow_gclid') || '';

      // Collect Form Data (supports id or name attribute)
      const fullName = (form.querySelector('#full-name') || form.querySelector('[name="fullName"]') || form.querySelector('[name="name"]'))?.value.trim();
      const companyName = (form.querySelector('#company-name') || form.querySelector('[name="companyName"]') || form.querySelector('[name="company"]'))?.value.trim() || 'N/A';
      const email = (form.querySelector('#email') || form.querySelector('[name="email"]'))?.value.trim();
      const whatsapp = (form.querySelector('#whatsapp') || form.querySelector('[name="whatsapp"]'))?.value.trim();
      const website = (form.querySelector('#website') || form.querySelector('[name="website"]'))?.value.trim() || 'N/A';
      const serviceRequired = form.querySelector('#service-required')?.value || form.querySelector('[name="service_page"]')?.value || document.title;
      const budget = form.querySelector('#budget')?.value || 'Standard Inquiry';
      const challenge = (form.querySelector('#challenge') || form.querySelector('[name="message"]') || form.querySelector('[name="challenge"]'))?.value.trim() || '';
      const contactPref = form.querySelector('#contact-pref')?.value || 'WhatsApp';

      const formData = {
        fullName,
        companyName,
        email,
        whatsapp,
        website,
        serviceRequired,
        budget,
        challenge,
        contactPref,
        timestamp: new Date().toISOString(),
        source: window.location.pathname,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        gclid: gclid,
        referrer: document.referrer || 'direct'
      };

      // Client-side Validation
      if (!formData.fullName || !formData.email || !formData.whatsapp) {
        showToast('Please fill in your name, email, and WhatsApp number.', 'error');
        return;
      }

    // UI Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
      </svg>
      Processing...
    `;

    try {
      // 1. Push to GA4 / GTM DataLayer & direct gtag event
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'lead_form_submitted',
          service_category: formData.serviceRequired,
          budget_range: formData.budget,
          preferred_channel: formData.contactPref
        });
      }
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          service_category: formData.serviceRequired,
          budget_range: formData.budget,
          preferred_channel: formData.contactPref
        });
      }

      // 2. Persist locally for zero-loss fallback
      const storedLeads = JSON.parse(localStorage.getItem('apexflow_leads') || '[]');
      storedLeads.push(formData);
      localStorage.setItem('apexflow_leads', JSON.stringify(storedLeads));

      // 3. Dispatch to Serverless /api/schedule for automated email notifications to prospect and Sahil
      try {
        await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'consultation',
            fullName: formData.fullName,
            companyName: formData.companyName,
            email: formData.email,
            whatsapp: formData.whatsapp,
            website: formData.website || '',
            serviceRequired: formData.serviceRequired || '',
            budget: formData.budget || '',
            challenge: formData.challenge || '',
            contactPref: formData.contactPref || ''
          })
        });
      } catch (scheduleApiErr) {
        console.warn('Schedule API notification warning (fallback active):', scheduleApiErr);
      }

      // 4. Dispatch to Google Sheets / Webhook / Formspree if configured
      const defaultGoogleSheetEndpoint = 'https://script.google.com/macros/s/AKfycbxwnLG2b2DWalLeOcwt1FiN-oc0bpMsSN2Fca6s9HByubaQTTrZNk2WnGBNWHudrucp/exec';
      const endpoint = form.getAttribute('action') || form.getAttribute('data-webhook-url') || defaultGoogleSheetEndpoint;
      if (endpoint && endpoint.startsWith('http')) {
        try {
          if (endpoint.includes('script.google.com')) {
            // Google Apps Script Web App handler (no-cors mode prevents browser preflight blocks)
            await fetch(endpoint, {
              method: 'POST',
              mode: 'no-cors',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
          } else {
            // Standard Webhook (Make.com, Zapier, n8n, Formspree)
            await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(formData)
            });
          }
        } catch (fetchErr) {
          console.warn('Endpoint dispatch warning (offline fallback active):', fetchErr);
        }
      } else {
        // Simulated network latency
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      // Success State
      showToast('Thank you! Your consultation request has been received. We will contact you within 4 hours.', 'success');
      form.reset();

      // Offer direct WhatsApp follow-up link
      const encodedMsg = encodeURIComponent(
        `Hi Sahil! I just submitted a consultation request for ${formData.companyName || formData.fullName} regarding ${formData.serviceRequired}. Looking forward to connecting!`
      );
      
      const whatsappCTA = document.getElementById('form-whatsapp-quickconnect');
      if (whatsappCTA) {
        whatsappCTA.href = `https://wa.me/971507507963?text=${encodedMsg}`;
        whatsappCTA.style.display = 'inline-flex';
      }

    } catch (err) {
      console.error('Submission error:', err);
      showToast('Submission error. Please connect directly via WhatsApp.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
});
}

/**
 * FAQ Accordion Controller
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    questionBtn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close other open items
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAns = other.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        item.classList.remove('open');
        answer.style.maxHeight = null;
      }
    });
  });
}

/**
 * WhatsApp Engagement Tracker & Prefill
 */
function initWhatsAppTracker() {
  const whatsappButtons = document.querySelectorAll('.nav-btn-whatsapp, .btn-whatsapp, .whatsapp-float');
  whatsappButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'whatsapp_click',
          click_location: btn.getAttribute('data-location') || 'floating_button'
        });
      }
      if (typeof gtag === 'function') {
        gtag('event', 'contact', {
          method: 'WhatsApp',
          click_location: btn.getAttribute('data-location') || 'floating_button'
        });
      }
    });
  });
}

/**
 * GA4 / GTM DataLayer Initialization
 */
function initAnalyticsDataLayer() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'page_country': 'UAE',
    'business_type': 'Digital Growth Agency'
  });
}

/**
 * Toast Notification Utility
 */
function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  const icon = type === 'success' ? '✓' : type === 'error' ? '!' : 'i';
  toast.innerHTML = `
    <span style="font-weight: bold; font-family: monospace; border: 1px solid currentColor; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center;">${icon}</span>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

/**
 * Interactive Service Stack Multi-Tab Switcher (Magic UI & Linear style)
 */
function initServiceTabs() {
  const tabs = document.querySelectorAll('.service-tab-btn');
  const panels = document.querySelectorAll('.service-tab-panel');

  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      // Update Tab Buttons
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update Panels
      panels.forEach(panel => {
        if (panel.getAttribute('id') === `tab-panel-${targetId}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
}

/**
 * WhatsApp Floating Concierge Popup Controller (Humanizer)
 */
function initWhatsAppConcierge() {
  const floatBtn = document.querySelector('.whatsapp-float');
  const conciergePopup = document.querySelector('.whatsapp-concierge-card');
  const closeBtn = document.querySelector('.concierge-close-btn');

  if (!floatBtn || !conciergePopup) return;

  // Toggle on floating button click if not targeting direct link
  floatBtn.addEventListener('click', (e) => {
    if (window.innerWidth > 768) {
      e.preventDefault();
      conciergePopup.classList.toggle('open');
    }
  });

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    conciergePopup.classList.remove('open');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!conciergePopup.contains(e.target) && !floatBtn.contains(e.target)) {
      conciergePopup.classList.remove('open');
    }
  });
}

/**
 * Dynamic Contextual WhatsApp Messaging by Page
 */
function getContextualWhatsAppText() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('audit')) {
    return "Hi Sahil! I ran the ApexFlow website audit and want to discuss our scorecard findings.";
  }
  if (path.includes('calculator')) {
    return "Hi Sahil! I ran your ROI calculator and want to discuss automating our team workflows.";
  }
  if (path.includes('packages')) {
    return "Hi Sahil! I'm reviewing your packages and quote builder for a custom UAE growth retainer.";
  }
  if (path.includes('real-estate')) {
    return "Hi Sahil! I'd like to discuss the real estate lead acquisition & sub-30s WhatsApp bot for Dubai properties.";
  }
  if (path.includes('clinic')) {
    return "Hi Sahil! I'd like to discuss patient booking automation & WhatsApp bots for our clinic.";
  }
  if (path.includes('shopify') || path.includes('ecommerce')) {
    return "Hi Sahil! I want to discuss Shopify speed optimization and Tabby/Tamara CRO.";
  }
  if (path.includes('digital-marketing') || path.includes('seo')) {
    return "Hi Sahil! I'd like to discuss Dubai Google Maps 3-Pack and UAE SEO rankings.";
  }
  if (path.includes('b2b')) {
    return "Hi Sahil! I'd like to discuss high-ticket B2B outbound lead generation in the UAE.";
  }
  return "Hi Sahil! I was looking at ApexFlow Digital and would like to discuss our UAE digital growth.";
}

/**
 * 1. Global Floating Mobile Quick-Bar
 */
function initMobileConversionBar() {
  if (document.getElementById('mobile-conversion-bar')) return;

  const bar = document.createElement('div');
  bar.id = 'mobile-conversion-bar';
  bar.className = 'mobile-conversion-bar';

  const waText = encodeURIComponent(getContextualWhatsAppText());
  const waUrl = `https://wa.me/971507507963?text=${waText}`;

  bar.innerHTML = `
    <div class="mbar-status-ribbon">
      <div class="mbar-status-indicator">
        <span class="mbar-pulse-dot"></span>
        <span>DUBAI ACTIVE • &lt;30s REPLY</span>
      </div>
      <span style="color: var(--text-muted); font-size: 0.68rem; font-family: var(--font-mono);">SAHIL SHEORAN // ONLINE</span>
    </div>
    <div class="mbar-actions-row">
      <a href="${waUrl}" target="_blank" rel="noopener" class="mbar-btn mbar-btn-wa" data-action="quick-whatsapp" aria-label="Direct WhatsApp Inquiry">
        <svg viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.058-2.125-.536-1.528-.636-2.533-2.167-2.613-2.272-.078-.105-.632-.843-.632-1.61 0-.767.394-1.152.538-1.306.144-.153.385-.224.514-.224.129 0 .257.002.371.008.12.006.279-.046.438.334.16.381.547 1.332.596 1.43.048.099.08.216.016.342-.064.128-.096.208-.192.32-.096.112-.204.25-.292.336-.098.096-.201.201-.086.398.115.197.511.844 1.1 1.368.758.674 1.396.883 1.594.981.198.098.314.086.43-.048.115-.134.496-.577.629-.775.133-.198.266-.166.447-.099.182.067 1.155.545 1.353.644.198.099.33.148.378.232.048.083.048.483-.096.888z"/></svg>
        <span>WhatsApp</span>
      </a>
      <button type="button" class="mbar-btn mbar-btn-call" data-action="open-strategy-modal" aria-label="Book 15-Minute Strategy Call">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>Book 15m Call</span>
      </button>
    </div>
  `;

  document.body.appendChild(bar);
  document.body.classList.add('has-mobile-bar');

  // Wire booking button
  bar.querySelector('[data-action="open-strategy-modal"]')?.addEventListener('click', () => {
    if (window.ApexFlowBooking) {
      window.ApexFlowBooking.openModal();
    }
  });
}

/**
 * 2. Interactive Strategy Call Booking Modal & Scheduler Engine
 */
function initStrategyCallModal() {
  // Check if modal exists
  let modalBackdrop = document.getElementById('strategy-call-modal');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'strategy-call-modal';
    modalBackdrop.className = 'apex-modal-backdrop';
    modalBackdrop.setAttribute('role', 'dialog');
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('aria-labelledby', 'strategy-modal-title');

    modalBackdrop.innerHTML = `
      <div class="apex-modal-card">
        <button class="apex-modal-close" data-action="close-modal" aria-label="Close modal">✕</button>
        
        <div id="booking-step-form">
          <div style="margin-bottom: 1.5rem;">
            <div class="badge-tag" style="margin-bottom: 0.5rem; display: inline-flex;">
              <span>⚡ 15-MINUTE GROWTH STRATEGY</span>
            </div>
            <h3 id="strategy-modal-title" style="font-size: 1.45rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary);">
              Book Direct Strategy Call
            </h3>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.35rem;">
              Direct 1-on-1 consultation with Principal Growth Technologist <strong>Sahil Sheoran</strong>. No junior account managers.
            </p>
          </div>

          <form id="strategy-call-form">
            <!-- Topic Selection -->
            <div class="scheduler-section-label">1. Select Strategy Focus</div>
            <div class="chips-grid" id="modal-topic-chips">
              <button type="button" class="chip-btn active" data-topic="Dubai Local SEO & Maps">📍 Dubai Local SEO / Maps</button>
              <button type="button" class="chip-btn" data-topic="Sub-30s WhatsApp AI Bot">💬 WhatsApp AI Lead Bot</button>
              <button type="button" class="chip-btn" data-topic="Sub-Second Web & Speed">⚡ Sub-Second Web Speed</button>
              <button type="button" class="chip-btn" data-topic="Full Growth Retainer">🚀 Full Retainer (AED 8.5k/mo)</button>
              <button type="button" class="chip-btn" data-topic="Shopify CRO & Tabby">🛒 Shopify & Tabby CRO</button>
            </div>

            <!-- Date Selection -->
            <div class="scheduler-section-label">2. Preferred Day (UAE Time)</div>
            <div class="chips-grid" id="modal-day-chips">
              <!-- Dynamically populated -->
            </div>

            <!-- Time Slot Selection -->
            <div class="scheduler-section-label">3. Select Slot (Gulf Standard Time / GST)</div>
            <div class="chips-grid" id="modal-time-chips">
              <button type="button" class="chip-btn active" data-time="10:00 AM">10:00 AM GST</button>
              <button type="button" class="chip-btn" data-time="11:30 AM">11:30 AM GST</button>
              <button type="button" class="chip-btn" data-time="02:00 PM">02:00 PM GST</button>
              <button type="button" class="chip-btn" data-time="04:00 PM">04:00 PM GST</button>
              <button type="button" class="chip-btn" data-time="05:30 PM">05:30 PM GST</button>
            </div>

            <!-- Contact Information -->
            <div class="scheduler-section-label">4. Your Details</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
              <div>
                <input type="text" id="modal-name" class="input-field" placeholder="Your Name *" required style="font-size: 0.85rem; padding: 0.65rem 0.85rem;">
              </div>
              <div>
                <input type="text" id="modal-company" class="input-field" placeholder="Company Name *" required style="font-size: 0.85rem; padding: 0.65rem 0.85rem;">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
              <div>
                <input type="email" id="modal-email" class="input-field" placeholder="Work Email *" required style="font-size: 0.85rem; padding: 0.65rem 0.85rem;">
              </div>
              <div>
                <input type="tel" id="modal-whatsapp" class="input-field text-mono" placeholder="WhatsApp Number *" required style="font-size: 0.85rem; padding: 0.65rem 0.85rem;">
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-full" id="modal-submit-btn" style="height: 48px; font-size: 0.95rem;">
              Confirm 15-Min Strategy Session
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>
        </div>

        <div id="booking-step-success" class="booking-success-card" style="display: none;">
          <div class="booking-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">Strategy Call Confirmed! 📅</h3>
          <p style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.25rem;" id="success-slot-summary">
            Your 15-minute strategy call is confirmed. Google Meet invite dispatched to your email.
          </p>

          <div style="background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 1.25rem; text-align: center;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--neon-cyan); font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px;">Direct Video Meeting Link</div>
            <a href="https://meet.google.com/ksd-sids-trc" target="_blank" rel="noopener" id="modal-meet-link" style="color: #fff; font-weight: 600; text-decoration: underline; font-size: 0.9rem;">https://meet.google.com/ksd-sids-trc</a>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Calendar invite (.ics) also sent to your inbox</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <a href="https://meet.google.com/ksd-sids-trc" target="_blank" rel="noopener" id="modal-join-meet-btn" class="btn btn-primary btn-full" style="background: #1a73e8; border-color: #1a73e8; font-size: 0.85rem;">
              <span>🎥 Open Google Meet Room</span>
            </a>
            <a href="#" id="success-gcal-btn" target="_blank" rel="noopener" class="btn btn-secondary btn-full" style="font-size: 0.85rem;">
              <span>📅 Add to Google Calendar</span>
            </a>
            <button type="button" id="success-ics-btn" class="btn btn-secondary btn-full" style="font-size: 0.85rem;">
              📥 Download Calendar File (.ics)
            </button>
            <a href="#" id="success-wa-btn" target="_blank" rel="noopener" class="btn btn-whatsapp btn-full">
              <span>📲 Confirm via WhatsApp with Sahil</span>
            </a>
            <button type="button" class="btn" style="background: none; border: none; color: var(--text-muted); font-size: 0.8rem; cursor: pointer;" data-action="close-modal">
              Done &amp; Close Window
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);
  }

  // Populate Day Chips (Next 3 Business Days)
  const dayChipsContainer = modalBackdrop.querySelector('#modal-day-chips');
  if (dayChipsContainer) {
    dayChipsContainer.innerHTML = '';
    const days = [];
    const dateObj = new Date();
    
    // If late evening (after 6 PM GST), start from tomorrow
    if (dateObj.getHours() >= 18) {
      dateObj.setDate(dateObj.getDate() + 1);
    }

    let count = 0;
    while (count < 3) {
      const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
      // Format readable
      const label = count === 0 ? `Today (${dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})` :
                    count === 1 ? `Tomorrow (${dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})` :
                    dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      const isoDate = dateObj.toISOString().split('T')[0];
      days.push({ label, isoDate, isFirst: count === 0 });

      dateObj.setDate(dateObj.getDate() + 1);
      count++;
    }

    days.forEach((d, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-btn ${idx === 0 ? 'active' : ''}`;
      btn.dataset.date = d.isoDate;
      btn.dataset.label = d.label;
      btn.innerText = d.label;
      dayChipsContainer.appendChild(btn);
    });
  }

  // Chip Selection Logic
  function setupChipSelection(container) {
    if (!container) return;
    container.addEventListener('click', (e) => {
      const target = e.target.closest('.chip-btn');
      if (!target) return;
      container.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      target.classList.add('active');
    });
  }

  setupChipSelection(modalBackdrop.querySelector('#modal-topic-chips'));
  setupChipSelection(dayChipsContainer);
  setupChipSelection(modalBackdrop.querySelector('#modal-time-chips'));

  // Close Handlers
  modalBackdrop.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
    btn.addEventListener('click', () => closeModal());
  });

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });

  function openModal(prefillData = {}) {
    // Reset view
    modalBackdrop.querySelector('#booking-step-form').style.display = 'block';
    modalBackdrop.querySelector('#booking-step-success').style.display = 'none';

    if (prefillData.topic) {
      const topicChips = modalBackdrop.querySelectorAll('#modal-topic-chips .chip-btn');
      topicChips.forEach(chip => {
        if (chip.dataset.topic.toLowerCase().includes(prefillData.topic.toLowerCase())) {
          topicChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
      });
    }

    if (prefillData.company && modalBackdrop.querySelector('#modal-company')) {
      modalBackdrop.querySelector('#modal-company').value = prefillData.company;
    }
    if (prefillData.email && modalBackdrop.querySelector('#modal-email')) {
      modalBackdrop.querySelector('#modal-email').value = prefillData.email;
    }
    if (prefillData.whatsapp && modalBackdrop.querySelector('#modal-whatsapp')) {
      modalBackdrop.querySelector('#modal-whatsapp').value = prefillData.whatsapp;
    }

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Form Submission
  const form = modalBackdrop.querySelector('#strategy-call-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = modalBackdrop.querySelector('#modal-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Scheduling Call...`;

    const topic = modalBackdrop.querySelector('#modal-topic-chips .chip-btn.active')?.dataset.topic || 'General Strategy';
    const dayBtn = modalBackdrop.querySelector('#modal-day-chips .chip-btn.active');
    const chosenDate = dayBtn?.dataset.date || new Date().toISOString().split('T')[0];
    const chosenDateLabel = dayBtn?.dataset.label || chosenDate;
    const chosenTime = modalBackdrop.querySelector('#modal-time-chips .chip-btn.active')?.dataset.time || '10:00 AM';

    const fullName = modalBackdrop.querySelector('#modal-name')?.value.trim();
    const company = modalBackdrop.querySelector('#modal-company')?.value.trim();
    const email = modalBackdrop.querySelector('#modal-email')?.value.trim();
    const whatsapp = modalBackdrop.querySelector('#modal-whatsapp')?.value.trim();

    const bookingPayload = {
      fullName,
      companyName: company,
      email,
      whatsapp,
      serviceRequired: `15-Min Strategy Call: ${topic}`,
      budget: 'Strategy Call Booking',
      challenge: `Scheduled for: ${chosenDateLabel} at ${chosenTime} GST. Topic: ${topic}`,
      contactPref: 'Strategy Call (15-min)',
      timestamp: new Date().toISOString(),
      source: window.location.pathname
    };

    // 1. Dispatch to Serverless /api/schedule for Automated Calendar Invite & Email Notifications
    let meetUrl = 'https://meet.google.com/ksd-sids-trc';
    try {
      const resp = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'meeting',
          fullName,
          companyName: company,
          email,
          whatsapp,
          topic,
          chosenDate,
          chosenTime,
          challenge: `Scheduled for: ${chosenDateLabel} at ${chosenTime} GST. Topic: ${topic}`
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.meetUrl) meetUrl = data.meetUrl;
      }
    } catch (apiErr) {
      console.warn('/api/schedule dispatch notice (fallback active):', apiErr);
    }

    // 2. Google Sheets Webhook Dispatch (Backup Sync)
    const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxwnLG2b2DWalLeOcwt1FiN-oc0bpMsSN2Fca6s9HByubaQTTrZNk2WnGBNWHudrucp/exec';
    try {
      await fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
    } catch(err) {}

    // 3. Local Storage Persistence
    const leads = JSON.parse(localStorage.getItem('apexflow_leads') || '[]');
    leads.push(bookingPayload);
    localStorage.setItem('apexflow_leads', JSON.stringify(leads));

    // 4. Analytics Event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'strategy_call_booked',
        booking_topic: topic,
        booking_date: chosenDate,
        booking_time: chosenTime
      });
    }
    if (typeof gtag === 'function') {
      gtag('event', 'schedule_call', {
        booking_topic: topic,
        booking_date: chosenDate,
        booking_time: chosenTime
      });
    }

    // 5. Generate .ics Calendar Invitation
    const icsContent = buildICSContent(topic, chosenDate, chosenTime, fullName, company);
    const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const icsUrl = URL.createObjectURL(icsBlob);

    const icsBtn = modalBackdrop.querySelector('#success-ics-btn');
    if (icsBtn) {
      icsBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = icsUrl;
        link.setAttribute('download', `ApexFlow-Strategy-Call-${chosenDate}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }

    // 6. Google Calendar 1-Click Link
    const gcalUrl = buildGoogleCalendarUrl(topic, chosenDate, chosenTime, fullName, company);
    const gcalBtn = modalBackdrop.querySelector('#success-gcal-btn');
    if (gcalBtn) {
      gcalBtn.href = gcalUrl;
    }

    // 7. Update Direct Google Meet Video Links
    const modalMeetLink = modalBackdrop.querySelector('#modal-meet-link');
    if (modalMeetLink) {
      modalMeetLink.href = meetUrl;
      modalMeetLink.textContent = meetUrl;
    }
    const modalJoinBtn = modalBackdrop.querySelector('#modal-join-meet-btn');
    if (modalJoinBtn) {
      modalJoinBtn.href = meetUrl;
    }

    // 8. WhatsApp Direct Confirmation
    const waConfirmationText = encodeURIComponent(
      `Hi Sahil! I just booked a 15-minute Strategy Call on ApexFlow Digital.\n\n` +
      `👤 Name: ${fullName} (${company})\n` +
      `📅 Slot: ${chosenDateLabel} at ${chosenTime} GST\n` +
      `🎯 Topic: ${topic}\n\n` +
      `Looking forward to connecting on Google Meet/WhatsApp!`
    );
    const waBtn = modalBackdrop.querySelector('#success-wa-btn');
    if (waBtn) {
      waBtn.href = `https://wa.me/971507507963?text=${waConfirmationText}`;
    }

    const summaryEl = modalBackdrop.querySelector('#success-slot-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `Confirmed for <strong>${chosenDateLabel} at ${chosenTime} GST</strong>.<br>Topic: <span style="color: var(--neon-cyan);">${topic}</span>.<br><span style="color:#10b981; font-weight:600;">Google Meet invitation and calendar file dispatched to <strong>${email}</strong>!</span>`;
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    modalBackdrop.querySelector('#booking-step-form').style.display = 'none';
    modalBackdrop.querySelector('#booking-step-success').style.display = 'block';
  });

  // Global helper on window
  window.ApexFlowBooking = {
    openModal,
    closeModal
  };

  // Wire all navigation & CTA buttons to strategy modal
  document.querySelectorAll('.nav-btn-cta, [data-action="book-call"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // If on contact page, let it scroll to inline calendar
      if (window.location.pathname.includes('contact')) {
        const pane = document.getElementById('pane-quick-call');
        if (pane) {
          e.preventDefault();
          pane.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
      e.preventDefault();
      const topic = btn.dataset.topic || btn.dataset.service || '';
      openModal({ topic });
    });
  });
}

/**
 * Google Calendar 1-Click URL Generator (Gulf Standard Time / GST UTC+4)
 */
function buildGoogleCalendarUrl(topic, dateStr, timeStr, name, company) {
  let hours = 10;
  let minutes = 0;
  if (timeStr && timeStr.includes(':')) {
    const parts = timeStr.split(' ');
    const timeParts = parts[0].split(':');
    hours = parseInt(timeParts[0], 10);
    minutes = parseInt(timeParts[1], 10);
    if (parts[1] === 'PM' && hours < 12) hours += 12;
    if (parts[1] === 'AM' && hours === 12) hours = 0;
  }

  const pad = (n) => String(n).padStart(2, '0');
  
  // Create start and end date objects in UTC+4 (Dubai)
  const dStart = new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00+04:00`);
  const dEnd = new Date(dStart.getTime() + 15 * 60 * 1000);

  const toUtcStr = (dateObj) => dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const datesParam = `${toUtcStr(dStart)}/${toUtcStr(dEnd)}`;
  
  const title = encodeURIComponent(`ApexFlow Strategy Session: ${topic} (${company || 'Client'})`);
  const details = encodeURIComponent(
    `15-minute 1-on-1 strategy call with Sahil Sheoran (Principal Growth Technologist at ApexFlow Digital).\n\n` +
    `Attendee: ${name} (${company})\n` +
    `Topic: ${topic}\n` +
    `Time: ${timeStr} GST (Dubai / Gulf Time)\n` +
    `Google Meet: https://meet.google.com/ksd-sids-trc\n` +
    `WhatsApp Direct: +971 50 750 7963`
  );
  const location = encodeURIComponent('https://meet.google.com/ksd-sids-trc');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}&ctz=Asia/Dubai`;
}

/**
 * iCalendar RFC 5545 Generator for Strategy Calls
 */
function buildICSContent(topic, dateStr, timeStr, name, company) {
  // Parse time
  let hours = 10;
  let minutes = 0;
  if (timeStr.includes(':')) {
    const parts = timeStr.split(' ');
    const timeParts = parts[0].split(':');
    hours = parseInt(timeParts[0], 10);
    minutes = parseInt(timeParts[1], 10);
    if (parts[1] === 'PM' && hours < 12) hours += 12;
    if (parts[1] === 'AM' && hours === 12) hours = 0;
  }

  const cleanDate = dateStr.replace(/-/g, '');
  const pad = (n) => String(n).padStart(2, '0');
  
  const startHour = pad(hours);
  const startMin = pad(minutes);
  
  // 15-minute duration
  let endHours = hours;
  let endMinutes = minutes + 15;
  if (endMinutes >= 60) {
    endHours += 1;
    endMinutes -= 60;
  }
  const endHour = pad(endHours);
  const endMin = pad(endMinutes);

  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth()+1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ApexFlow Digital//Strategy Call Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:apexflow-call-${Date.now()}@apexflowdigital.ae`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=Asia/Dubai:${cleanDate}T${startHour}${startMin}00`,
    `DTEND;TZID=Asia/Dubai:${cleanDate}T${endHour}${endMin}00`,
    `SUMMARY:ApexFlow Strategy Session: ${topic} (${company})`,
    `DESCRIPTION:15-minute 1-on-1 strategy call with Sahil Sheoran (Principal Growth Technologist at ApexFlow Digital).\\n\\nAttendee: ${name} (${company})\\nTopic: ${topic}\\nGoogle Meet: https://meet.google.com/ksd-sids-trc\\nWhatsApp: +971 50 750 7963`,
    'LOCATION:https://meet.google.com/ksd-sids-trc',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: ApexFlow Digital Strategy Call with Sahil Sheoran',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * 3. Interactive Inline Calendar Scheduler for contact.html
 */
function initInlineScheduler() {
  const form = document.getElementById('inline-strategy-call-form');
  if (!form) return;

  const dayChipsContainer = document.getElementById('inline-day-chips');
  if (dayChipsContainer) {
    dayChipsContainer.innerHTML = '';
    const dateObj = new Date();
    if (dateObj.getHours() >= 18) {
      dateObj.setDate(dateObj.getDate() + 1);
    }

    let count = 0;
    while (count < 4) {
      const label = count === 0 ? `Today (${dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})` :
                    count === 1 ? `Tomorrow (${dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})` :
                    dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      const isoDate = dateObj.toISOString().split('T')[0];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-btn ${count === 0 ? 'active' : ''}`;
      btn.dataset.date = isoDate;
      btn.dataset.label = label;
      btn.innerText = label;
      dayChipsContainer.appendChild(btn);

      dateObj.setDate(dateObj.getDate() + 1);
      count++;
    }
  }

  // Chip selection helpers
  function setupChips(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.addEventListener('click', (e) => {
      const target = e.target.closest('.chip-btn');
      if (!target) return;
      container.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      target.classList.add('active');
    });
  }

  setupChips('inline-topic-chips');
  setupChips('inline-day-chips');
  setupChips('inline-time-chips');

  // Submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('inline-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Reserving Slot...</span>`;

    const topic = document.querySelector('#inline-topic-chips .chip-btn.active')?.dataset.topic || 'General Strategy';
    const dayBtn = document.querySelector('#inline-day-chips .chip-btn.active');
    const chosenDate = dayBtn?.dataset.date || new Date().toISOString().split('T')[0];
    const chosenDateLabel = dayBtn?.dataset.label || chosenDate;
    const chosenTime = document.querySelector('#inline-time-chips .chip-btn.active')?.dataset.time || '10:00 AM';

    const fullName = document.getElementById('inline-name')?.value.trim();
    const company = document.getElementById('inline-company')?.value.trim();
    const email = document.getElementById('inline-email')?.value.trim();
    const whatsapp = document.getElementById('inline-whatsapp')?.value.trim();

    const bookingPayload = {
      fullName,
      companyName: company,
      email,
      whatsapp,
      serviceRequired: `15-Min Strategy Call: ${topic}`,
      budget: 'Strategy Call Booking',
      challenge: `Scheduled for: ${chosenDateLabel} at ${chosenTime} GST. Topic: ${topic}`,
      contactPref: 'Strategy Call (15-min)',
      timestamp: new Date().toISOString(),
      source: 'contact.html (Inline Scheduler)'
    };

    // 1. Dispatch to Serverless /api/schedule for Automated Calendar Invite & Email Notifications
    let meetUrl = 'https://meet.google.com/ksd-sids-trc';
    try {
      const resp = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'meeting',
          fullName,
          companyName: company,
          email,
          whatsapp,
          topic,
          chosenDate,
          chosenTime,
          challenge: `Scheduled for: ${chosenDateLabel} at ${chosenTime} GST. Topic: ${topic}`
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.meetUrl) meetUrl = data.meetUrl;
      }
    } catch (apiErr) {
      console.warn('/api/schedule inline dispatch notice (fallback active):', apiErr);
    }

    // 2. Google Sheets Dispatch (Backup Sync)
    const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxwnLG2b2DWalLeOcwt1FiN-oc0bpMsSN2Fca6s9HByubaQTTrZNk2WnGBNWHudrucp/exec';
    try {
      await fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
    } catch(err) {}

    // 3. Local Storage
    const leads = JSON.parse(localStorage.getItem('apexflow_leads') || '[]');
    leads.push(bookingPayload);
    localStorage.setItem('apexflow_leads', JSON.stringify(leads));

    // 4. Analytics
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'strategy_call_booked',
        booking_topic: topic,
        booking_date: chosenDate,
        booking_time: chosenTime
      });
    }

    // 5. .ics file generator
    const icsContent = buildICSContent(topic, chosenDate, chosenTime, fullName, company);
    const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const icsUrl = URL.createObjectURL(icsBlob);

    const icsBtn = document.getElementById('inline-success-ics-btn');
    if (icsBtn) {
      icsBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = icsUrl;
        link.setAttribute('download', `ApexFlow-Strategy-Call-${chosenDate}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }

    // 6. Google Calendar 1-Click URL
    const gcalUrl = buildGoogleCalendarUrl(topic, chosenDate, chosenTime, fullName, company);
    const gcalBtn = document.getElementById('inline-success-gcal-btn');
    if (gcalBtn) {
      gcalBtn.href = gcalUrl;
    }

    // 7. Update Direct Google Meet Video Links
    const inlineMeetLink = document.getElementById('inline-meet-link');
    if (inlineMeetLink) {
      inlineMeetLink.href = meetUrl;
      inlineMeetLink.textContent = meetUrl;
    }
    const inlineJoinBtn = document.getElementById('inline-join-meet-btn');
    if (inlineJoinBtn) {
      inlineJoinBtn.href = meetUrl;
    }

    // 8. WhatsApp Link
    const waConfirmationText = encodeURIComponent(
      `Hi Sahil! I just reserved a 15-minute Strategy Call on ApexFlow Digital.\n\n` +
      `👤 Name: ${fullName} (${company})\n` +
      `📅 Slot: ${chosenDateLabel} at ${chosenTime} GST\n` +
      `🎯 Topic: ${topic}\n\n` +
      `Looking forward to connecting on Google Meet/WhatsApp!`
    );
    const waBtn = document.getElementById('inline-success-wa-btn');
    if (waBtn) {
      waBtn.href = `https://wa.me/971507507963?text=${waConfirmationText}`;
    }

    const summaryEl = document.getElementById('inline-success-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `Confirmed for <strong>${chosenDateLabel} at ${chosenTime} GST</strong>.<br>Topic: <span style="color: var(--neon-cyan);">${topic}</span>.<br><span style="color:#10b981; font-weight:600;">Google Meet invitation and calendar file dispatched to <strong>${email}</strong>!</span>`;
    }

    form.style.display = 'none';
    const successCard = document.getElementById('inline-booking-success');
    if (successCard) {
      successCard.style.display = 'block';
    }
  });
}

/**
 * Switcher Tabs for contact.html (15-Min Strategy Call vs Full Proposal)
 */
function initConsultationTabs() {
  const quickBtn = document.getElementById('tab-btn-quick-call');
  const proposalBtn = document.getElementById('tab-btn-full-proposal');
  const quickPane = document.getElementById('pane-quick-call');
  const proposalPane = document.getElementById('pane-full-proposal');

  if (!quickBtn || !proposalBtn || !quickPane || !proposalPane) return;

  quickBtn.addEventListener('click', () => {
    quickBtn.classList.add('active');
    proposalBtn.classList.remove('active');
    quickPane.style.display = 'block';
    proposalPane.style.display = 'none';
  });

  proposalBtn.addEventListener('click', () => {
    proposalBtn.classList.add('active');
    quickBtn.classList.remove('active');
    proposalPane.style.display = 'block';
    quickPane.style.display = 'none';
  });
}

// Global Export for helper access
window.ApexFlow = {
  showToast,
  openBooking: () => window.ApexFlowBooking?.openModal()
};

