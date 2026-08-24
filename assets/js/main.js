/**
 * ApexFlow Digital — Main Client-Side Application Script
 * Performance-first, zero-dependency, analytics-ready
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLeadForm();
  initFAQ();
  initWhatsAppTracker();
  initAnalyticsDataLayer();
  initServiceTabs();
  initWhatsAppConcierge();
});

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
  const form = document.getElementById('consultation-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Collect Form Data
    const formData = {
      fullName: form.querySelector('#full-name')?.value.trim(),
      companyName: form.querySelector('#company-name')?.value.trim(),
      email: form.querySelector('#email')?.value.trim(),
      whatsapp: form.querySelector('#whatsapp')?.value.trim(),
      website: form.querySelector('#website')?.value.trim() || 'N/A',
      serviceRequired: form.querySelector('#service-required')?.value,
      budget: form.querySelector('#budget')?.value,
      challenge: form.querySelector('#challenge')?.value.trim(),
      contactPref: form.querySelector('#contact-pref')?.value,
      timestamp: new Date().toISOString(),
      source: window.location.pathname
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

      // 3. Dispatch to Webhook / Formspree / Make.com if configured
      const endpoint = form.getAttribute('action') || form.getAttribute('data-webhook-url');
      if (endpoint && endpoint.startsWith('http')) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
          });
        } catch (fetchErr) {
          console.warn('Webhook dispatch warning (offline fallback active):', fetchErr);
        }
      } else {
        // Simulated local network latency
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

// Global Export for helper access
window.ApexFlow = {
  showToast
};

