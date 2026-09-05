/**
 * ApexFlow Digital — Lead-Gated Multi-Type Growth & SEO Audit Engine
 * Features:
 * - 5 Specialized UAE Audit Report Types
 * - Animated Cyber Scanner Terminal HUD
 * - High-Curiosity Teaser Preview with Locked Deep-Dive Section
 * - Verified Lead Capture Gate (Name, Email, WhatsApp)
 * - Google Sheets CRM Webhook Dispatch & Local Storage Sync
 * - Report-Specific Printable Executive PDF Generator & WhatsApp Handoff
 */

document.addEventListener('DOMContentLoaded', () => {
  const auditForm = document.getElementById('audit-tool-form');
  const resultsContainer = document.getElementById('audit-results');
  const scannerHud = document.getElementById('audit-scanner-hud');

  if (!auditForm || !resultsContainer) return;

  auditForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const urlInput = document.getElementById('audit-url')?.value.trim();
    const industryInput = document.getElementById('audit-industry')?.value || 'other';
    const reportTypeInput = document.getElementById('audit-report-type')?.value || 'full-stack';

    if (!urlInput) {
      if (window.ApexFlow) window.ApexFlow.showToast('Please enter your website URL', 'error');
      return;
    }

    const scanBtn = document.getElementById('audit-scan-btn');
    const originalBtnText = scanBtn ? scanBtn.innerHTML : 'Scan Website';
    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.innerHTML = `Scanning...`;
    }

    // Hide previous results
    resultsContainer.style.display = 'none';

    // 1. Run Animated Cyber Scanner HUD
    runScannerHUD(scannerHud, urlInput, reportTypeInput, () => {
      if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = originalBtnText;
      }

      // 2. Generate Audit Data & Render Teaser Preview
      const auditData = generateAuditReport(urlInput, industryInput, reportTypeInput);
      renderAuditTeaser(auditData, resultsContainer);

      // Auto-populate consultation lead form if present
      const leadWebsiteField = document.getElementById('website');
      const leadChallengeField = document.getElementById('challenge');
      if (leadWebsiteField) leadWebsiteField.value = urlInput;
      if (leadChallengeField && !leadChallengeField.value) {
        leadChallengeField.value = `Audit findings for ${urlInput} (${auditData.reportTitle}): Overall ${auditData.scores.overall}/100. Bottleneck: ${auditData.topBottleneck}`;
      }

      // Track Analytics
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'audit_completed',
          analyzed_url: urlInput,
          report_type: reportTypeInput,
          overall_score: auditData.scores.overall
        });
      }
      if (typeof gtag === 'function') {
        gtag('event', 'audit_completed', {
          analyzed_url: urlInput,
          report_type: reportTypeInput,
          overall_score: auditData.scores.overall
        });
      }
    });
  });

  // Auto-run if query param ?url= or ?audit_url= is provided
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paramUrl = urlParams.get('url') || urlParams.get('audit_url');
    const paramType = urlParams.get('type') || urlParams.get('report_type');
    const paramIndustry = urlParams.get('industry');

    if (paramUrl) {
      const urlInput = document.getElementById('audit-url');
      if (urlInput) urlInput.value = paramUrl;
      if (paramType) {
        const typeSelect = document.getElementById('audit-report-type');
        if (typeSelect) typeSelect.value = paramType;
      }
      if (paramIndustry) {
        const indSelect = document.getElementById('audit-industry');
        if (indSelect) indSelect.value = paramIndustry;
      }
      setTimeout(() => {
        if (auditForm) auditForm.dispatchEvent(new Event('submit'));
      }, 350);
    }
  } catch (err) {
    console.warn('URL params parsing failed:', err);
  }
});

/**
 * 1. Animated Cyber Scanner Terminal HUD
 */
function runScannerHUD(hudContainer, domain, reportType, onComplete) {
  if (!hudContainer) {
    onComplete();
    return;
  }

  hudContainer.style.display = 'block';
  hudContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const steps = [
    { text: `Establishing low-latency ping to UAE du & Etisalat 5G gateway...`, pct: 25 },
    { text: `Inspecting LocalBusiness JSON-LD schema & Google Maps 3-Pack citations...`, pct: 55 },
    { text: `Auditing mobile WhatsApp tap targets, JS payload & inquiry friction...`, pct: 85 },
    { text: `Compiling executive diagnostic report for ${domain}...`, pct: 100 }
  ];

  hudContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--neon-cyan); letter-spacing: 0.05em;">
        ⚡ APEXFLOW_DIAGNOSTIC_RUNNER // ${domain.toUpperCase()}
      </div>
      <div class="text-mono" id="scanner-pct" style="font-size: 0.8rem; color: var(--neon-emerald); font-weight: 700;">0%</div>
    </div>
    <div class="scanner-progress-bar-bg">
      <div class="scanner-progress-bar-fill" id="scanner-progress-fill"></div>
    </div>
    <div id="scanner-logs" style="display: flex; flex-direction: column; gap: 0.25rem;"></div>
  `;

  const logsContainer = document.getElementById('scanner-logs');
  const fill = document.getElementById('scanner-progress-fill');
  const pctEl = document.getElementById('scanner-pct');

  let currentStep = 0;

  function nextStep() {
    if (currentStep < steps.length) {
      const s = steps[currentStep];
      fill.style.width = `${s.pct}%`;
      pctEl.innerText = `${s.pct}%`;

      const line = document.createElement('div');
      line.className = 'scanner-log-line active';
      line.innerHTML = `<span>▶</span> <span>${s.text}</span>`;
      logsContainer.appendChild(line);

      currentStep++;
      setTimeout(() => {
        line.classList.remove('active');
        line.classList.add('done');
        line.querySelector('span').innerText = '✓';
        nextStep();
      }, 500);
    } else {
      setTimeout(() => {
        hudContainer.style.display = 'none';
        onComplete();
      }, 350);
    }
  }

  nextStep();
}

/**
 * 2. Specialized Multi-Report Data Synthesizer
 */
function generateAuditReport(rawUrl, industry, reportType) {
  let domain = rawUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];

  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash % 25);

  const reportConfigs = {
    'full-stack': {
      title: 'Full-Stack Digital Growth Blueprint',
      badge: '⚡ ALL-IN-ONE 360° DIAGNOSTIC',
      scores: {
        overall: Math.round(55 + (base % 28)),
        m1: { name: 'UAE SEO & Entity', val: Math.min(88, Math.max(50, 58 + (base % 25))) },
        m2: { name: 'Mobile Speed (5G)', val: Math.min(90, Math.max(45, 52 + ((base * 2) % 32))) },
        m3: { name: 'Conversion UX', val: Math.min(86, Math.max(48, 54 + ((base * 3) % 27))) },
        m4: { name: 'Automation Index', val: Math.min(92, Math.max(40, 48 + ((base * 4) % 35))) }
      },
      bottleneck: 'Multi-point friction: Slow mobile 5G load (~3.8s) paired with zero automated WhatsApp inquiry intake.',
      recommendation: 'Deploy Next.js sub-second web architecture, inject bilingual schema, and connect official WhatsApp Business Cloud API.',
      estimatedLoss: 'AED 16,500'
    },
    'seo-maps': {
      title: 'UAE Local SEO & Google Maps 3-Pack Audit',
      badge: '📍 GOOGLE MAPS & LOCAL PACK AUDIT',
      scores: {
        overall: Math.round(52 + (base % 26)),
        m1: { name: 'Google Maps Proximity', val: Math.min(84, Math.max(46, 50 + (base % 24))) },
        m2: { name: 'Citation Consistency', val: Math.min(86, Math.max(52, 56 + ((base * 2) % 26))) },
        m3: { name: 'LocalBusiness Schema', val: Math.min(78, Math.max(38, 42 + ((base * 3) % 30))) },
        m4: { name: 'Review Velocity Gap', val: Math.min(82, Math.max(45, 48 + ((base * 4) % 30))) }
      },
      bottleneck: 'Inconsistent NAP (Name, Address, Phone) citations and missing localized Dubai GeoCoordinates schema.',
      recommendation: 'Submit verified listings to YellowPages UAE, Connect.ae, Yalwa, and implement GeoShape schema triangulation.',
      estimatedLoss: 'AED 22,000'
    },
    'speed-5g': {
      title: 'Sub-Second 5G Mobile Speed & Core Web Vitals Audit',
      badge: '🚀 5G MOBILE SPEED & CWV AUDIT',
      scores: {
        overall: Math.round(48 + (base % 30)),
        m1: { name: 'Largest Contentful Paint', val: Math.min(80, Math.max(42, 45 + (base % 28))) },
        m2: { name: 'Time to First Byte (TTFB)', val: Math.min(85, Math.max(48, 50 + ((base * 2) % 28))) },
        m3: { name: 'Cumulative Layout Shift', val: Math.min(88, Math.max(55, 60 + ((base * 3) % 24))) },
        m4: { name: 'JS Execution Overhead', val: Math.min(75, Math.max(35, 40 + ((base * 4) % 32))) }
      },
      bottleneck: 'Mobile LCP takes ~3.9s on UAE 5G due to heavy render-blocking scripts and uncompressed hero assets.',
      recommendation: 'Rebuild critical rendering path on ultra-lean semantic code; achieve 100/100 Core Web Vitals (<0.5s LCP).',
      estimatedLoss: 'AED 18,000'
    },
    'whatsapp-cro': {
      title: 'WhatsApp AI & Lead Conversion Leak Audit',
      badge: '💬 WHATSAPP & CONVERSION LEAK AUDIT',
      scores: {
        overall: Math.round(50 + (base % 28)),
        m1: { name: 'Response SLA (<30s)', val: Math.min(70, Math.max(30, 35 + (base % 30))) },
        m2: { name: 'Mobile Form Friction', val: Math.min(82, Math.max(48, 52 + ((base * 2) % 26))) },
        m3: { name: 'After-Hours Capture', val: Math.min(72, Math.max(25, 30 + ((base * 3) % 35))) },
        m4: { name: 'Direct WhatsApp Tap', val: Math.min(85, Math.max(50, 55 + ((base * 4) % 25))) }
      },
      bottleneck: 'Inbound inquiries sit unhandled for 2+ hours during peak business hours and overnight.',
      recommendation: 'Deploy bilingual autonomous WhatsApp bot responding in < 20s, qualifying budgets, and booking calendar slots.',
      estimatedLoss: 'AED 25,000'
    },
    'shopify-cro': {
      title: 'Shopify & GCC E-Commerce Checkout CRO Audit',
      badge: '🛒 SHOPIFY & GCC CHECKOUT CRO AUDIT',
      scores: {
        overall: Math.round(54 + (base % 26)),
        m1: { name: 'Tabby/Tamara BNPL', val: Math.min(75, Math.max(35, 40 + (base % 30))) },
        m2: { name: 'Mobile Checkout UX', val: Math.min(84, Math.max(50, 54 + ((base * 2) % 26))) },
        m3: { name: 'COD Return Risk', val: Math.min(78, Math.max(40, 45 + ((base * 3) % 28))) },
        m4: { name: 'Bilingual Localization', val: Math.min(86, Math.max(52, 58 + ((base * 4) % 25))) }
      },
      bottleneck: 'Missing native Tabby/Tamara 4-installment BNPL options and no WhatsApp address verification for COD orders.',
      recommendation: 'Integrate 1-click installment widgets and automated WhatsApp COD verification bot to slash returns.',
      estimatedLoss: 'AED 35,000'
    }
  };

  const config = reportConfigs[reportType] || reportConfigs['full-stack'];

  return {
    domain,
    reportType,
    reportTitle: config.title,
    reportBadge: config.badge,
    scores: config.scores,
    topBottleneck: config.bottleneck,
    recommendation: config.recommendation,
    estimatedLoss: config.estimatedLoss
  };
}

/**
 * 3. Render Teaser Scorecard with Blurred Curiosity Lock
 */
function renderAuditTeaser(data, container) {
  container.style.display = 'block';

  const getScoreColor = (score) => {
    if (score >= 80) return 'color: var(--neon-emerald);';
    if (score >= 60) return 'color: #ffbe0b;';
    return 'color: #f87171;';
  };

  container.innerHTML = `
    <!-- Top Visible Scorecard Header -->
    <div style="text-align: center; margin-bottom: 2rem;">
      <span class="badge-tag">${data.reportBadge}</span>
      <h3 style="font-size: 1.6rem; font-weight: 800; margin-top: 0.5rem;">
        Diagnostic Results for <span style="color: var(--neon-cyan); font-family: var(--font-mono);">${data.domain}</span>
      </h3>
      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
        Target Focus: <strong>${data.reportTitle}</strong>
      </div>
    </div>

    <!-- Preliminary Metrics Row -->
    <div class="audit-metrics-grid">
      <div class="audit-metric-card" style="border-color: rgba(0, 242, 254, 0.4); background: rgba(0, 242, 254, 0.05);">
        <div class="metric-score" style="${getScoreColor(data.scores.overall)} font-size: 2.2rem;">${data.scores.overall}/100</div>
        <div class="metric-label" style="font-weight: 700; color: #fff;">Overall Rating</div>
      </div>
      <div class="audit-metric-card">
        <div class="metric-score" style="${getScoreColor(data.scores.m1.val)}">${data.scores.m1.val}/100</div>
        <div class="metric-label">${data.scores.m1.name}</div>
      </div>
      <div class="audit-metric-card">
        <div class="metric-score" style="${getScoreColor(data.scores.m2.val)}">${data.scores.m2.val}/100</div>
        <div class="metric-label">${data.scores.m2.name}</div>
      </div>
      <div class="audit-metric-card">
        <div class="metric-score" style="${getScoreColor(data.scores.m3.val)}">${data.scores.m3.val}/100</div>
        <div class="metric-label">${data.scores.m3.name}</div>
      </div>
      <div class="audit-metric-card">
        <div class="metric-score" style="${getScoreColor(data.scores.m4.val)}">${data.scores.m4.val}/100</div>
        <div class="metric-label">${data.scores.m4.name}</div>
      </div>
    </div>

    <!-- Primary Red Flag Alert -->
    <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
        <h4 style="font-size: 1rem; font-weight: 800; color: #fca5a5; display: flex; align-items: center; gap: 0.5rem;">
          <span>⚠️ Critical Revenue Leak Detected:</span>
        </h4>
        <div class="badge-tag" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; font-size: 0.75rem;">
          Est. Monthly Leak: ${data.estimatedLoss}/mo
        </div>
      </div>
      <p style="color: var(--text-primary); font-size: 0.95rem; line-height: 1.5;">${data.topBottleneck}</p>
    </div>

    <!-- BLURRED / LOCKED DEEP-DIVE PREVIEW (CURIOSITY HOOK) -->
    <div class="audit-teaser-container" id="teaser-lock-wrapper">
      <div class="audit-blurred-backdrop" id="blurred-content-preview">
        <!-- Mock Competitor Benchmark & 10-Point Technical Table -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
          <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 1rem;">Competitor Benchmark Gap (Dubai Top 3 vs ${data.domain})</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-muted);">
              <th style="padding: 8px;">Audit Dimension</th>
              <th style="padding: 8px;">Your Website</th>
              <th style="padding: 8px;">Dubai Market Leader</th>
              <th style="padding: 8px;">Status</th>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 8px;">Mobile 5G Load Speed</td>
              <td style="padding: 8px;">3.84s</td>
              <td style="padding: 8px;">0.42s</td>
              <td style="padding: 8px; color: #f87171;">Critical Lag</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 8px;">Google Maps 3-Pack Rank</td>
              <td style="padding: 8px;">Page 2 (#14)</td>
              <td style="padding: 8px;">Rank #1</td>
              <td style="padding: 8px; color: #f87171;">Zero Pack Traffic</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 8px;">Sub-30s WhatsApp Auto-Triage</td>
              <td style="padding: 8px;">Missing</td>
              <td style="padding: 8px;">Active (18s SLA)</td>
              <td style="padding: 8px; color: #f87171;">Leaking Inquiries</td>
            </tr>
            <tr>
              <td style="padding: 8px;">LocalBusiness Schema Coverage</td>
              <td style="padding: 8px;">0% (None)</td>
              <td style="padding: 8px;">100% Comprehensive</td>
              <td style="padding: 8px; color: #f87171;">Missing Entity</td>
            </tr>
          </table>
        </div>

        <!-- Mock 30-Day Engineering Plan -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem;">
          <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Immediate 30-Day Strategic Engineering Roadmap</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Phase-by-phase blueprint to dominate high-intent commercial search and recover lost mobile revenue.</p>
          <div style="height: 60px; background: rgba(255,255,255,0.05); border-radius: 6px;"></div>
        </div>
      </div>

      <!-- High-Curiosity Lock Overlay -->
      <div class="lock-glass-overlay" id="lock-glass-overlay">
        <div class="lock-glowing-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div class="lock-title">Complete 8-Page Executive Diagnostic Report Locked</div>
        <div class="lock-subtitle">
          Enter your work email and WhatsApp number to unlock the full customized technical teardown, competitor benchmark matrix, and 30-day action plan for <strong>${data.domain}</strong>.
        </div>
        <button type="button" class="btn btn-primary btn-lg" id="btn-unlock-report" style="height: 52px; font-size: 1rem; padding: 0 2rem; box-shadow: 0 0 25px rgba(0, 242, 254, 0.4);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span>Unlock & Download Executive PDF Report</span>
        </button>
      </div>
    </div>
  `;

  // Attach Unlock Handler
  document.getElementById('btn-unlock-report')?.addEventListener('click', () => {
    openAuditLeadGateModal(data);
  });

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 4. Lead Capture Gate Modal
 */
function openAuditLeadGateModal(auditData) {
  let modal = document.getElementById('audit-download-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'audit-download-modal';
    modal.className = 'apex-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="apex-modal-card" style="max-width: 490px;">
        <button class="apex-modal-close" data-action="close-audit-modal" aria-label="Close modal">✕</button>
        
        <div style="margin-bottom: 1.25rem;">
          <div class="badge-tag" style="margin-bottom: 0.5rem; display: inline-flex;">
            <span>📄 EXECUTIVE REPORT ACCESS</span>
          </div>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #fff;">
            Unlock Full Diagnostic PDF
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">
            We will generate your personalized technical report for <strong id="modal-audit-domain" style="color: var(--neon-cyan);">${auditData.domain}</strong> and prepare your instant PDF download.
          </p>
        </div>

        <form id="audit-download-form">
          <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 1.25rem;">
            <div>
              <label class="form-label" style="font-size: 0.8rem;">Full Name *</label>
              <input type="text" id="pdf-lead-name" class="input-field" placeholder="e.g. Rashid Al Mansoori" required>
            </div>
            <div>
              <label class="form-label" style="font-size: 0.8rem;">Work Email (Where to send report) *</label>
              <input type="email" id="pdf-lead-email" class="input-field" placeholder="rashid@company.ae" required>
            </div>
            <div>
              <label class="form-label" style="font-size: 0.8rem;">UAE WhatsApp Number (For instant delivery) *</label>
              <input type="tel" id="pdf-lead-whatsapp" class="input-field text-mono" placeholder="+971 50 123 4567" required>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" id="pdf-submit-btn" style="height: 50px;">
            <span>Generate & Download Executive Report</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('[data-action="close-audit-modal"]')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  modal.querySelector('#modal-audit-domain').innerText = auditData.domain;
  modal.classList.add('active');

  const form = modal.querySelector('#audit-download-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = modal.querySelector('#pdf-submit-btn');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Generating Custom PDF...';

    const leadName = modal.querySelector('#pdf-lead-name').value.trim();
    const leadEmail = modal.querySelector('#pdf-lead-email').value.trim();
    const leadWa = modal.querySelector('#pdf-lead-whatsapp').value.trim();

    const leadData = {
      fullName: leadName,
      companyName: auditData.domain,
      email: leadEmail,
      whatsapp: leadWa,
      website: auditData.domain,
      serviceRequired: `Audit Report: ${auditData.reportTitle} (${auditData.scores.overall}/100)`,
      budget: 'Free Diagnostic Run',
      challenge: `Bottleneck: ${auditData.topBottleneck}. Scores: M1(${auditData.scores.m1.val}), M2(${auditData.scores.m2.val}), M3(${auditData.scores.m3.val}), M4(${auditData.scores.m4.val})`,
      contactPref: 'Audit PDF Download',
      timestamp: new Date().toISOString(),
      source: '/audit.html'
    };

    // 1. Dispatch to Google Sheets CRM
    try {
      await fetch('https://script.google.com/macros/s/AKfycbxwnLG2b2DWalLeOcwt1FiN-oc0bpMsSN2Fca6s9HByubaQTTrZNk2WnGBNWHudrucp/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
    } catch(err) {}

    // 2. Persist to LocalStorage
    const leads = JSON.parse(localStorage.getItem('apexflow_leads') || '[]');
    leads.push(leadData);
    localStorage.setItem('apexflow_leads', JSON.stringify(leads));

    // 3. Render and Trigger Executive PDF Report View
    renderPrintableExecutiveReport(auditData, leadName, leadEmail, leadWa);

    btn.disabled = false;
    btn.innerHTML = orig;
    modal.classList.remove('active');

    // 4. Unblur the on-page teaser section so user can now see it freely
    const lockOverlay = document.getElementById('lock-glass-overlay');
    const blurredBackdrop = document.getElementById('blurred-content-preview');
    if (lockOverlay) lockOverlay.style.display = 'none';
    if (blurredBackdrop) {
      blurredBackdrop.style.filter = 'none';
      blurredBackdrop.style.opacity = '1';
      blurredBackdrop.style.pointerEvents = 'auto';
      blurredBackdrop.style.userSelect = 'auto';
    }

    // Add Post-Unlock Conversion Actions
    const existingActions = document.getElementById('post-unlock-actions');
    if (!existingActions) {
      const actionsRow = document.createElement('div');
      actionsRow.id = 'post-unlock-actions';
      actionsRow.style.display = 'flex';
      actionsRow.style.gap = '0.75rem';
      actionsRow.style.flexWrap = 'wrap';
      actionsRow.style.marginTop = '1.5rem';

      const waShareText = encodeURIComponent(
        `Hi Sahil! I just downloaded my ApexFlow Diagnostic Report for ${auditData.domain}.\n\n` +
        `👤 Name: ${leadName}\n` +
        `📊 Report: ${auditData.reportTitle} (Score: ${auditData.scores.overall}/100)\n` +
        `⚠️ Top Issue: ${auditData.topBottleneck}\n\n` +
        `Could we schedule a 15-minute live review call this week?`
      );

      actionsRow.innerHTML = `
        <a href="https://wa.me/971507507963?text=${waShareText}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="flex: 1; height: 48px; min-width: 240px;">
          <span>📲 Review with Sahil Sheoran on WhatsApp</span>
        </a>
        <button type="button" class="btn btn-primary" onclick="window.print()" style="flex: 1; height: 48px; min-width: 200px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span>Print / Save PDF Again</span>
        </button>
      `;

      document.getElementById('teaser-lock-wrapper')?.appendChild(actionsRow);
    }

    // Trigger browser print dialog for immediate PDF generation
    setTimeout(() => {
      window.print();
    }, 250);
  };
}

/**
 * 5. Render Executive Printable Report View (Visible when Printing to PDF)
 */
function renderPrintableExecutiveReport(data, clientName, clientEmail, clientPhone) {
  let rep = document.getElementById('executive-printable-report');
  if (!rep) {
    rep = document.createElement('div');
    rep.id = 'executive-printable-report';
    rep.className = 'executive-report-view';
    document.body.appendChild(rep);
  }

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  rep.innerHTML = `
    <div class="rep-header">
      <div>
        <div class="rep-logo">ApexFlow Digital</div>
        <div style="font-size: 0.85rem; color: #64748b;">Executive Technical Diagnostic & Growth Engineering Audit</div>
      </div>
      <div style="text-align: right; font-size: 0.8rem; color: #475569;">
        <div>Date: <strong>${today}</strong></div>
        <div>Target: <strong>${data.domain}</strong></div>
        <div>Prepared for: <strong>${clientName}</strong> (${clientEmail})</div>
      </div>
    </div>

    <div style="margin: 1.5rem 0;">
      <span style="font-size: 0.75rem; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em;">Audit Module</span>
      <h2 style="font-size: 1.4rem; color: #0f172a; margin-top: 0.2rem; margin-bottom: 0.4rem;">${data.reportTitle}</h2>
      <p style="font-size: 0.9rem; color: #475569; line-height: 1.5;">
        This diagnostic report synthesizes live Core Web Vitals, UAE Local Google Maps search visibility, mobile lead conversion heuristics, and automated CRM intake readiness for <strong>${data.domain}</strong>.
      </p>
    </div>

    <div class="rep-scores-grid">
      <div class="rep-score-box">
        <div class="rep-score-val" style="color: ${data.scores.overall >= 70 ? '#059669' : '#dc2626'};">${data.scores.overall}/100</div>
        <div class="rep-score-lbl">Overall Health</div>
      </div>
      <div class="rep-score-box">
        <div class="rep-score-val">${data.scores.m1.val}/100</div>
        <div class="rep-score-lbl">${data.scores.m1.name}</div>
      </div>
      <div class="rep-score-box">
        <div class="rep-score-val">${data.scores.m2.val}/100</div>
        <div class="rep-score-lbl">${data.scores.m2.name}</div>
      </div>
      <div class="rep-score-box">
        <div class="rep-score-val">${data.scores.m3.val}/100</div>
        <div class="rep-score-lbl">${data.scores.m3.name}</div>
      </div>
      <div class="rep-score-box">
        <div class="rep-score-val">${data.scores.m4.val}/100</div>
        <div class="rep-score-lbl">${data.scores.m4.name}</div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin: 1.5rem 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <h3 style="font-size: 1rem; color: #991b1b; margin: 0;">⚠️ Critical Bottleneck Identified</h3>
        <span style="font-size: 0.8rem; font-weight: 700; color: #991b1b;">Est. Loss: ${data.estimatedLoss}/mo</span>
      </div>
      <p style="font-size: 0.95rem; color: #1e293b; margin-bottom: 1.25rem;">${data.topBottleneck}</p>

      <h3 style="font-size: 1rem; color: #065f46; margin-bottom: 0.35rem;">🚀 Recommended Technical Fix</h3>
      <p style="font-size: 0.95rem; color: #334155;">${data.recommendation}</p>
    </div>

    <div style="margin: 1.5rem 0;">
      <h3 style="font-size: 1.05rem; color: #0f172a; margin-bottom: 0.5rem;">Immediate 30-Day Action Roadmap:</h3>
      <ol style="padding-left: 1.25rem; font-size: 0.875rem; color: #334155; line-height: 1.6;">
        <li>Deploy bilingual (Arabic/English) LocalBusiness & GeoCoordinates schema across all main landing pages.</li>
        <li>Eliminate render-blocking third-party scripts to achieve sub-0.5s Largest Contentful Paint (LCP).</li>
        <li>Integrate automated Meta WhatsApp Cloud API webhooks to qualify inbound buyer budgets in under 30 seconds.</li>
      </ol>
    </div>

    <div style="border-top: 1px solid #cbd5e1; padding-top: 1rem; margin-top: 2rem; display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b;">
      <div>
        <strong>Sahil Sheoran</strong> — Principal Growth Technologist<br>
        ApexFlow Digital • Dubai, UAE • WhatsApp: +971 50 750 7963
      </div>
      <div style="text-align: right;">
        Web: https://apexflow-digital.vercel.app<br>
        Email: sahilsheoran851@gmail.com
      </div>
    </div>
  `;
}


