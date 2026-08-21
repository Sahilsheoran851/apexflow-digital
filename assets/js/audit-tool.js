/**
 * ApexFlow Digital — Interactive Growth & SEO Audit Engine
 * Real-time diagnostic simulator for UAE websites & digital funnels
 */

document.addEventListener('DOMContentLoaded', () => {
  const auditForm = document.getElementById('audit-tool-form');
  const resultsContainer = document.getElementById('audit-results');
  if (!auditForm || !resultsContainer) return;

  auditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const urlInput = document.getElementById('audit-url')?.value.trim();
    const industryInput = document.getElementById('audit-industry')?.value;
    const priorityInput = document.getElementById('audit-priority')?.value;

    if (!urlInput) {
      if (window.ApexFlow) window.ApexFlow.showToast('Please enter your website URL', 'error');
      return;
    }

    const analyzeBtn = auditForm.querySelector('button[type="submit"]');
    const originalText = analyzeBtn.innerHTML;

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = `
      <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="32" stroke-linecap="round" fill="none"/>
      </svg>
      Analyzing Site...
    `;

    // Simulate diagnostic evaluation based on URL and selected criteria
    setTimeout(() => {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = originalText;
      
      const auditData = generateAuditReport(urlInput, industryInput, priorityInput);
      renderAuditResults(auditData, resultsContainer);
      
      // Auto-populate consultation lead form if present
      const leadWebsiteField = document.getElementById('website');
      const leadChallengeField = document.getElementById('challenge');
      if (leadWebsiteField) leadWebsiteField.value = urlInput;
      if (leadChallengeField && !leadChallengeField.value) {
        leadChallengeField.value = `Audit findings for ${urlInput}: Health ${auditData.scores.overall}/100, SEO ${auditData.scores.seo}/100, Conversion ${auditData.scores.conversion}/100. Key priority: ${auditData.topBottleneck}`;
      }

      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'audit_completed',
          analyzed_url: urlInput,
          industry: industryInput,
          overall_score: auditData.scores.overall
        });
      }
    }, 1200);
  });
});

/**
 * Heuristic Audit Simulation Generator
 */
function generateAuditReport(rawUrl, industry, priority) {
  // Normalize clean domain name
  let domain = rawUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
  
  // Generate deterministic yet realistic metrics based on domain seed
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash % 25); // 0 - 24

  // Calculated diagnostic scores
  const seoScore = Math.min(88, Math.max(52, 60 + (base % 22)));
  const perfScore = Math.min(92, Math.max(48, 55 + ((base * 2) % 30)));
  const convScore = Math.min(85, Math.max(45, 50 + ((base * 3) % 28)));
  const autoScore = Math.min(90, Math.max(40, 48 + ((base * 4) % 35)));
  const overallScore = Math.round((seoScore * 0.3) + (perfScore * 0.25) + (convScore * 0.25) + (autoScore * 0.2));

  // Industry-specific bottleneck findings
  const findingsMap = {
    'real-estate': {
      bottleneck: 'Leads from property portals not syncing to CRM instantly via WhatsApp.',
      recommendation: 'Deploy instant WhatsApp auto-qualification bot & Zapier/Make CRM webhook.'
    },
    'ecommerce': {
      bottleneck: 'High mobile checkout friction and unoptimized product page Core Web Vitals.',
      recommendation: 'Implement 1-click Apple Pay/Tamara checkout UX and schema rich snippets.'
    },
    'b2b': {
      bottleneck: 'Zero Google Local Pack ranking for high-intent UAE transactional keywords.',
      recommendation: 'Restructure metadata hierarchy, Google Business Profile, and B2B case studies.'
    },
    'clinic': {
      bottleneck: 'Manual appointment booking via phone with high missed call rates.',
      recommendation: 'Embed direct WhatsApp calendar booking and automated reminder pipeline.'
    },
    'other': {
      bottleneck: 'Missing conversion triggers, high bounce rate, and manual spreadsheet lead handling.',
      recommendation: 'Rebuild high-converting landing page structure with automated form-to-CRM pipeline.'
    }
  };

  const selectedFinding = findingsMap[industry] || findingsMap['other'];

  return {
    domain,
    scores: {
      overall: overallScore,
      seo: seoScore,
      performance: perfScore,
      conversion: convScore,
      automation: autoScore
    },
    topBottleneck: selectedFinding.bottleneck,
    recommendation: selectedFinding.recommendation
  };
}

/**
 * Render Audit Report UI
 */
function renderAuditResults(data, container) {
  container.style.display = 'block';

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-good';
    if (score >= 60) return 'score-medium';
    return 'score-poor';
  };

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <span class="badge-tag">Diagnostic Report</span>
      <h3 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.5rem;">
        Growth Audit for <span style="color: var(--accent-cyan); font-family: var(--font-mono);">${data.domain}</span>
      </h3>
    </div>

    <div class="audit-metrics-grid">
      <div class="audit-metric-card">
        <div class="metric-score ${getScoreClass(data.scores.overall)}">${data.scores.overall}/100</div>
        <div class="metric-label">Overall Health</div>
      </div>
      <div class="audit-metric-card">
        <div class="metric-score ${getScoreClass(data.scores.seo)}">${data.scores.seo}/100</div>
        <div class="metric-label">UAE SEO & Visibility</div>
      </div>
      <div class="audit-metric-card">
        <div class="metric-score ${getScoreClass(data.scores.performance)}">${data.scores.performance}/100</div>
        <div class="metric-label">Mobile Speed</div>
      </div>
      <div class="audit-metric-card">
        <div class="metric-score ${getScoreClass(data.scores.conversion)}">${data.scores.conversion}/100</div>
        <div class="metric-label">Lead Conversion</div>
      </div>
      <div class="audit-metric-card">
        <div class="metric-score ${getScoreClass(data.scores.automation)}">${data.scores.automation}/100</div>
        <div class="metric-label">Automation Index</div>
      </div>
    </div>

    <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: #fca5a5; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>⚠️ Primary Growth Bottleneck Identified:</span>
      </h4>
      <p style="color: var(--text-primary); font-size: 0.95rem; margin-bottom: 1rem;">${data.topBottleneck}</p>
      
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-emerald); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>🚀 Recommended Fix:</span>
      </h4>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">${data.recommendation}</p>
    </div>

    <div class="audit-actions">
      <div>
        <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.2rem;">Want a full manual deep-dive audit & implementation roadmap?</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">We will review your competitors, backlink profile, and workflow bottlenecks for free.</div>
      </div>
      <a href="#contact" class="btn btn-primary" onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'});">
        Book Free Audit Review Call
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  `;

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
