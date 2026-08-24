/**
 * ApexFlow Digital — Interactive Custom Quote Configurator
 * Calculates live estimated monthly retainer and one-time setup fee
 * Dispatches completed custom proposal to Google Sheets & WhatsApp
 */

(function() {
  'use strict';

  const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxwnLG2b2DWalLeOcwt1FiN-oc0bpMsSN2Fca6s9HByubaQTTrZNk2WnGBNWHudrucp/exec';
  const FOUNDER_WHATSAPP = '971507507963';

  function initQuoteConfigurator() {
    const container = document.getElementById('custom-quote-configurator');
    if (!container) return;

    const checkboxes = container.querySelectorAll('.module-checkbox');
    const monthlyDisplay = document.getElementById('quote-monthly-total');
    const setupDisplay = document.getElementById('quote-setup-total');
    const form = document.getElementById('quote-submit-form');

    function calculateTotal() {
      let monthly = 0;
      let setup = 0;

      checkboxes.forEach(cb => {
        if (cb.checked) {
          monthly += parseInt(cb.getAttribute('data-monthly') || '0', 10);
          setup += parseInt(cb.getAttribute('data-setup') || '0', 10);
        }
      });

      if (monthlyDisplay) monthlyDisplay.innerText = `AED ${monthly.toLocaleString()}/mo`;
      if (setupDisplay) setupDisplay.innerText = `AED ${setup.toLocaleString()}`;
    }

    checkboxes.forEach(cb => {
      cb.addEventListener('change', calculateTotal);
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const selectedModules = [];
      checkboxes.forEach(cb => {
        if (cb.checked) selectedModules.push(cb.getAttribute('data-name'));
      });

      const clientName = document.getElementById('quote-client-name')?.value.trim();
      const clientCompany = document.getElementById('quote-client-company')?.value.trim();
      const clientEmail = document.getElementById('quote-client-email')?.value.trim();
      const clientPhone = document.getElementById('quote-client-phone')?.value.trim();
      const industry = document.getElementById('quote-client-industry')?.value;

      if (!clientName || !clientPhone || !clientEmail) {
        if (window.ApexFlow) window.ApexFlow.showToast('Please fill in your name, email, and WhatsApp number.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = 'Locking In Quote...';

      const payload = {
        fullName: clientName,
        companyName: clientCompany || 'N/A',
        email: clientEmail,
        whatsapp: clientPhone,
        website: 'N/A',
        serviceRequired: `Custom Stack: ${selectedModules.join(', ')}`,
        budget: `${monthlyDisplay.innerText} + ${setupDisplay.innerText} Setup`,
        challenge: `Industry: ${industry}. Modules: ${selectedModules.join(' | ')}`,
        contactPref: 'WhatsApp Proposal',
        source: 'Quote Configurator (/packages.html)'
      };

      try {
        await fetch(GOOGLE_SHEETS_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (window.ApexFlow) window.ApexFlow.showToast('Custom proposal saved! Opening WhatsApp...', 'success');

        const waMsg = encodeURIComponent(
          `Hi Sahil! I just configured a custom growth stack for ${clientCompany || clientName} (${industry}).\n\nModules: ${selectedModules.join(', ')}\nEstimate: ${monthlyDisplay.innerText} + ${setupDisplay.innerText} setup.\n\nLet's discuss onboarding!`
        );

        setTimeout(() => {
          window.open(`https://wa.me/${FOUNDER_WHATSAPP}?text=${waMsg}`, '_blank');
        }, 600);

      } catch (err) {
        console.error('Quote submission error:', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });

    calculateTotal();
  }

  document.addEventListener('DOMContentLoaded', initQuoteConfigurator);
})();
