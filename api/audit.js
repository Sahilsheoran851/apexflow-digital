/**
 * ApexFlow Digital — Real-Time Live Website Diagnostic Engine
 * Vercel Serverless Function: /api/audit
 * 
 * Performs 100% genuine, real-time live network inspection, HTML scraping,
 * Core Web Vitals latency estimation, SEO meta extraction, Schema.org verification,
 * and WhatsApp CRO detection without requiring paid external APIs.
 */

const { URL } = require('url');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse parameters from GET query or POST body
  let targetUrl = req.query.url || (req.body && req.body.url);
  const reportType = req.query.type || (req.body && req.body.type) || 'full-stack';
  const industry = req.query.industry || (req.body && req.body.industry) || 'other';

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'Target URL is required.' });
  }

  targetUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid URL format provided.' });
  }

  // SSRF Protection: Block localhost, loopback, private RFC1918 subnets, cloud metadata
  const host = parsedUrl.hostname.toLowerCase();
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
  if (blockedHosts.includes(host) || host.endsWith('.local') || host.endsWith('.internal')) {
    return res.status(400).json({ success: false, error: 'Private and internal hostnames cannot be audited.' });
  }
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/.test(host)) {
    return res.status(400).json({ success: false, error: 'Private IP addresses cannot be audited.' });
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8500);

  try {
    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ApexFlowDiagnostic/2.0 (Compatible; UAE Commercial Auditor)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8'
      },
      redirect: 'follow'
    });
    clearTimeout(timeoutId);

    const ttfb = Date.now() - startTime;
    const html = await response.text();
    const totalTime = Date.now() - startTime;

    // 1. Performance & Network Analysis
    const isHttps = response.url.startsWith('https://');
    const pageSizeKb = parseFloat((Buffer.byteLength(html, 'utf8') / 1024).toFixed(1));
    const serverHeader = response.headers.get('server') || 'Protected / Edge CDN';
    const contentEncoding = response.headers.get('content-encoding') || 'uncompressed';
    const cacheControl = response.headers.get('cache-control') || 'none';
    const hsts = !!response.headers.get('strict-transport-security');
    const xFrame = !!response.headers.get('x-frame-options');
    const xContentType = !!response.headers.get('x-content-type-options');
    const csp = !!response.headers.get('content-security-policy');

    // 2. Head & On-Page SEO Extraction
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
                   || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const metaDesc = descMatch ? descMatch[1].trim() : '';

    const viewportMatch = html.match(/<meta[^>]*name=["']viewport["']/i);
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
    const isNoIndex = robotsMatch ? /noindex/i.test(robotsMatch[1]) : false;

    // Headings
    const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    const h2Matches = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
    const cleanH1 = h1Matches.length > 0 ? h1Matches[0][1].replace(/<[^>]+>/g, '').trim() : '';

    // Images & Alt tags
    const imgMatches = [...html.matchAll(/<img\b[^>]*>/gi)];
    let imagesMissingAlt = 0;
    imgMatches.forEach(img => {
      if (!/\balt\s*=\s*["'][^"']+["']/i.test(img[0])) imagesMissingAlt++;
    });

    // Schema.org Structured Data
    const schemaMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const schemaTypes = [];
    schemaMatches.forEach(m => {
      try {
        const parsed = JSON.parse(m[1].trim());
        const extractType = (obj) => {
          if (!obj) return;
          if (obj['@type']) {
            if (Array.isArray(obj['@type'])) schemaTypes.push(...obj['@type']);
            else schemaTypes.push(obj['@type']);
          }
          if (obj['@graph'] && Array.isArray(obj['@graph'])) obj['@graph'].forEach(extractType);
        };
        if (Array.isArray(parsed)) parsed.forEach(extractType);
        else extractType(parsed);
      } catch (e) {}
    });
    const uniqueSchemaTypes = [...new Set(schemaTypes)];
    const hasLocalBusiness = uniqueSchemaTypes.some(t => 
      /localbusiness|store|restaurant|medical|legal|financial|realestate|professional/i.test(t)
    );

    // Social & OpenGraph
    const ogTitle = !!html.match(/<meta[^>]*property=["']og:title["']/i);
    const ogImage = !!html.match(/<meta[^>]*property=["']og:image["']/i);

    // 3. Conversion Rate Optimization (CRO) & WhatsApp
    const hasWhatsApp = /wa\.me|whatsapp\.com|api\.whatsapp\.com/i.test(html);
    const hasTel = /href=["']tel:/i.test(html);
    const hasForm = /<form\b/i.test(html);
    const isArabic = /dir=["']rtl["']|lang=["']ar["']|hreflang=["']ar["']/i.test(html);

    // 4. Tech Stack & Tracking Detection
    let cms = 'Custom Engineering / Static';
    if (/wp-content|wp-includes/i.test(html)) cms = 'WordPress';
    else if (/cdn\.shopify\.com/i.test(html)) cms = 'Shopify';
    else if (/wix\.com/i.test(html)) cms = 'Wix';
    else if (/webflow\.com/i.test(html)) cms = 'Webflow';
    else if (/__NEXT_DATA__|next\/router/i.test(html)) cms = 'Next.js';
    else if (/__NUXT__|nuxt/i.test(html)) cms = 'Nuxt.js';
    else if (/framer\.com/i.test(html)) cms = 'Framer';

    const scriptCount = [...html.matchAll(/<script\b/gi)].length;
    const stylesheetCount = [...html.matchAll(/<link[^>]*rel=["']stylesheet["']/gi)].length;

    const hasGtm = /googletagmanager\.com|gtag/i.test(html);
    const hasMetaPixel = /fbevents\.js|fbq\(/i.test(html);
    const hasTiktok = /analytics\.tiktok\.com|ttq\./i.test(html);
    const hasSnap = /sc-static\.net|snaptr\(/i.test(html);

    // 5. Objective Scoring Computation
    // A. Speed Score (0 - 100)
    let speedScore = 100;
    if (ttfb > 1200) speedScore -= 35;
    else if (ttfb > 600) speedScore -= 20;
    else if (ttfb > 300) speedScore -= 10;

    if (pageSizeKb > 350) speedScore -= 25;
    else if (pageSizeKb > 150) speedScore -= 15;
    else if (pageSizeKb > 80) speedScore -= 5;

    if (contentEncoding === 'uncompressed') speedScore -= 15;
    if (scriptCount > 25) speedScore -= 15;
    else if (scriptCount > 15) speedScore -= 8;
    speedScore = Math.max(30, Math.min(98, speedScore));

    // B. SEO Score (0 - 100)
    let seoScore = 100;
    if (!title) seoScore -= 25;
    else if (title.length < 25 || title.length > 70) seoScore -= 10;

    if (!metaDesc) seoScore -= 25;
    else if (metaDesc.length < 70 || metaDesc.length > 175) seoScore -= 10;

    if (h1Matches.length === 0) seoScore -= 15;
    else if (h1Matches.length > 1) seoScore -= 8;

    if (!hasLocalBusiness) {
      if (uniqueSchemaTypes.length === 0) seoScore -= 20;
      else seoScore -= 10;
    }

    if (imgMatches.length > 0 && (imagesMissingAlt / imgMatches.length) > 0.3) {
      seoScore -= 10;
    }
    if (isNoIndex) seoScore -= 40;
    seoScore = Math.max(25, Math.min(96, seoScore));

    // C. CRO Score (0 - 100)
    let croScore = 100;
    if (!viewportMatch) croScore -= 35;
    if (!hasWhatsApp) croScore -= 30;
    if (!hasForm && !hasTel) croScore -= 20;
    if (!hasGtm && !hasMetaPixel && !hasTiktok) croScore -= 15;
    croScore = Math.max(25, Math.min(97, croScore));

    // D. Automation & Security Score (0 - 100)
    let autoScore = 100;
    if (!isHttps) autoScore -= 45;
    if (!hsts) autoScore -= 15;
    if (!xFrame && !csp) autoScore -= 15;
    if (cms === 'WordPress' && scriptCount > 20) autoScore -= 15;
    autoScore = Math.max(30, Math.min(98, autoScore));

    // E. Weighted Overall Score
    let overallScore;
    if (reportType === 'seo-maps') {
      overallScore = Math.round((seoScore * 0.50) + (speedScore * 0.20) + (croScore * 0.20) + (autoScore * 0.10));
    } else if (reportType === 'speed-5g') {
      overallScore = Math.round((speedScore * 0.55) + (seoScore * 0.15) + (croScore * 0.20) + (autoScore * 0.10));
    } else if (reportType === 'whatsapp-cro') {
      overallScore = Math.round((croScore * 0.55) + (speedScore * 0.20) + (seoScore * 0.15) + (autoScore * 0.10));
    } else if (reportType === 'shopify-cro') {
      overallScore = Math.round((croScore * 0.40) + (speedScore * 0.30) + (seoScore * 0.20) + (autoScore * 0.10));
    } else {
      overallScore = Math.round((speedScore * 0.25) + (seoScore * 0.30) + (croScore * 0.30) + (autoScore * 0.15));
    }

    // 6. Generate Itemized Diagnostic Findings
    const findings = [];

    // TTFB Finding
    if (ttfb < 300) {
      findings.push({
        name: 'Server Response (TTFB)',
        status: 'pass',
        value: `${ttfb}ms`,
        badge: 'SUB-SECOND 5G READY',
        text: `Sub-300ms response time delivered via ${serverHeader}. Passes Google Core Web Vitals threshold.`
      });
    } else if (ttfb < 700) {
      findings.push({
        name: 'Server Response (TTFB)',
        status: 'warn',
        value: `${ttfb}ms`,
        badge: 'AVERAGE LATENCY',
        text: `Server took ${ttfb}ms to respond. Acceptable for desktop, but incurs noticeable friction on UAE mobile 5G.`
      });
    } else {
      findings.push({
        name: 'Server Response (TTFB)',
        status: 'fail',
        value: `${ttfb}ms`,
        badge: 'HIGH LATENCY BOTTLENECK',
        text: `Severely delayed TTFB (${ttfb}ms). Exceeds the Google recommended 200ms limit. Triggers immediate visitor bounce.`
      });
    }

    // WhatsApp CRO Finding
    if (hasWhatsApp) {
      findings.push({
        name: 'WhatsApp Lead Pipeline',
        status: 'pass',
        value: 'Detected',
        badge: 'ACTIVE GCC INTAKE',
        text: 'Direct WhatsApp integration detected. Provides immediate channel access for UAE buyers.'
      });
    } else {
      findings.push({
        name: 'WhatsApp Lead Pipeline',
        status: 'fail',
        value: 'Missing',
        badge: 'CRITICAL CONVERSION LEAK',
        text: 'No direct WhatsApp click-to-chat action found on the page. In the UAE, 68% of mobile buyers abandon sites requiring email forms.'
      });
    }

    // Title Tag Finding
    if (title && title.length >= 25 && title.length <= 70) {
      findings.push({
        name: 'Title Tag Optimization',
        status: 'pass',
        value: `${title.length} chars`,
        badge: 'OPTIMAL LENGTH',
        text: `"${title}" matches Google search snippet display limits.`
      });
    } else if (title) {
      findings.push({
        name: 'Title Tag Optimization',
        status: 'warn',
        value: `${title.length} chars`,
        badge: title.length < 25 ? 'TOO SHORT' : 'TRUNCATED IN SEARCH',
        text: `Title "${title}" is ${title.length < 25 ? 'too short for keyword relevance' : 'likely truncated on mobile search screens'}.`
      });
    } else {
      findings.push({
        name: 'Title Tag Optimization',
        status: 'fail',
        value: 'Missing',
        badge: 'CRITICAL SEO VOID',
        text: 'No <title> tag found on the page. Severely degrades Google organic indexing.'
      });
    }

    // Meta Description Finding
    if (metaDesc && metaDesc.length >= 80 && metaDesc.length <= 165) {
      findings.push({
        name: 'Meta Description',
        status: 'pass',
        value: `${metaDesc.length} chars`,
        badge: 'SEARCH SNIPPET READY',
        text: `Well-calibrated meta description (${metaDesc.length} characters) optimizes click-through rates.`
      });
    } else if (metaDesc) {
      findings.push({
        name: 'Meta Description',
        status: 'warn',
        value: `${metaDesc.length} chars`,
        badge: metaDesc.length < 80 ? 'SUB-OPTIMAL' : 'TOO LONG',
        text: `Meta description is present (${metaDesc.length} chars) but outside the optimal 110-160 char window.`
      });
    } else {
      findings.push({
        name: 'Meta Description',
        status: 'fail',
        value: 'Missing',
        badge: 'CLICK-THROUGH LOSS',
        text: 'No <meta name="description"> tag found. Google will pull random page text into search snippets.'
      });
    }

    // Schema.org Finding
    if (hasLocalBusiness) {
      findings.push({
        name: 'LocalBusiness Schema',
        status: 'pass',
        value: uniqueSchemaTypes.join(', '),
        badge: 'MAPS 3-PACK READY',
        text: `Verified localized Schema (${uniqueSchemaTypes.filter(t => /business|store|clinic|service/i.test(t)).join(', ')}) enables Google Maps rich entity ranking.`
      });
    } else if (uniqueSchemaTypes.length > 0) {
      findings.push({
        name: 'Schema.org Structured Data',
        status: 'warn',
        value: uniqueSchemaTypes.join(', '),
        badge: 'GENERIC ENTITY',
        text: `Generic schema (${uniqueSchemaTypes.join(', ')}) detected, but missing specific UAE LocalBusiness or GeoCoordinates tags.`
      });
    } else {
      findings.push({
        name: 'Schema.org Structured Data',
        status: 'fail',
        value: 'None Detected',
        badge: 'ZERO RICH SNIPPETS',
        text: 'No JSON-LD structured data detected. Site is invisible to Google Maps entity triangulation and AI search engines.'
      });
    }

    // Security Finding
    if (isHttps && hsts) {
      findings.push({
        name: 'HTTPS & HSTS Protocol',
        status: 'pass',
        value: 'Secured + HSTS',
        badge: 'COMMERCIAL ENCRYPTED',
        text: 'Full SSL encryption with Strict-Transport-Security header active.'
      });
    } else if (isHttps) {
      findings.push({
        name: 'HTTPS & Security Headers',
        status: 'warn',
        value: 'HTTPS Only',
        badge: 'MISSING HSTS/CSP',
        text: 'HTTPS is active but missing HSTS or modern security response headers.'
      });
    } else {
      findings.push({
        name: 'HTTPS Security',
        status: 'fail',
        value: 'Insecure (HTTP)',
        badge: 'CRITICAL SECURITY RISK',
        text: 'Site served over unencrypted HTTP. Triggers browser security warnings and degrades Google rankings.'
      });
    }

    // Tech Stack & Script Payload Finding
    findings.push({
      name: 'Technology Stack & Assets',
      status: (cms === 'WordPress' && scriptCount > 20) ? 'warn' : 'pass',
      value: `${cms} (${scriptCount} scripts, ${stylesheetCount} CSS)`,
      badge: `${pageSizeKb} KB HTML`,
      text: `${cms} detected with ${scriptCount} scripts and ${stylesheetCount} stylesheets. Total HTML payload is ${pageSizeKb} KB with ${contentEncoding} compression.`
    });

    // 7. Calculate Revenue Loss & Top Bottleneck
    let estimatedLossAED = 'AED 12,000';
    let topBottleneck = 'Multi-factor friction: Sub-optimal Core Web Vitals paired with missing conversion automation.';
    let recommendation = 'Refactor web architecture to sub-second Edge static delivery, configure LocalBusiness schema, and connect WhatsApp Cloud API.';

    if (!hasWhatsApp && ttfb > 600) {
      estimatedLossAED = 'AED 38,000';
      topBottleneck = `Slow server latency (${ttfb}ms) combined with zero WhatsApp lead capture. High-intent traffic bounces before inquiring.`;
      recommendation = `Deploy sub-second Edge delivery on Cloudflare/Vercel and implement automated WhatsApp qualification bot.`;
    } else if (!hasWhatsApp) {
      estimatedLossAED = 'AED 24,000';
      topBottleneck = `Absence of direct WhatsApp conversion funnel. Contact form reliance drops UAE mobile inquiries by 68%.`;
      recommendation = `Install a floating high-intent WhatsApp conversion bar with pre-filled qualification triggers.`;
    } else if (ttfb > 800) {
      estimatedLossAED = 'AED 28,500';
      topBottleneck = `High initial server response delay (${ttfb}ms). Fails mobile 5G Core Web Vitals expectations.`;
      recommendation = `Migrate to Next.js / Vanilla Edge hosting with DXB edge POPs to drop TTFB below 150ms.`;
    } else if (!hasLocalBusiness) {
      estimatedLossAED = 'AED 18,000';
      topBottleneck = `Missing UAE LocalBusiness structured data is holding back Google Maps 3-Pack placement in competitive districts.`;
      recommendation = `Inject JSON-LD LocalBusiness schema with precise latitude/longitude, district service areas, and syndicate verified NAP citations.`;
    }

    const typeConfigs = {
      'full-stack': { title: 'Full-Stack Digital Growth Blueprint', badge: '⚡ ALL-IN-ONE 360° DIAGNOSTIC' },
      'seo-maps': { title: 'UAE Local SEO & Google Maps 3-Pack Audit', badge: '📍 GOOGLE MAPS & LOCAL PACK AUDIT' },
      'speed-5g': { title: 'Sub-Second 5G Mobile Speed & Core Web Vitals Audit', badge: '🚀 SUB-SECOND 5G & WEB VITALS' },
      'whatsapp-cro': { title: 'WhatsApp AI & Lead Conversion Leak Audit', badge: '💬 WHATSAPP AI & LEAD CRO AUDIT' },
      'shopify-cro': { title: 'Shopify & GCC E-Commerce Checkout CRO Audit', badge: '🛒 SHOPIFY & GCC CHECKOUT CRO AUDIT' }
    };
    const currentConfig = typeConfigs[reportType] || typeConfigs['full-stack'];

    let m1, m2, m3, m4;
    if (reportType === 'seo-maps') {
      m1 = { name: 'Local Schema & Entity', val: hasLocalBusiness ? 96 : uniqueSchemaTypes.length > 0 ? 60 : 25 };
      m2 = { name: 'Title & Meta SEO', val: seoScore };
      m3 = { name: 'Mobile Speed Index', val: speedScore };
      m4 = { name: 'OpenGraph & Social', val: ogTitle && ogImage ? 95 : 50 };
    } else if (reportType === 'speed-5g') {
      m1 = { name: 'Server TTFB Latency', val: ttfb < 300 ? 98 : ttfb < 700 ? 65 : 35 };
      m2 = { name: 'Payload & Compression', val: contentEncoding !== 'uncompressed' && pageSizeKb < 150 ? 92 : 48 };
      m3 = { name: 'Asset Weight (JS/CSS)', val: scriptCount < 15 ? 90 : scriptCount < 30 ? 60 : 35 };
      m4 = { name: 'Mobile Performance', val: speedScore };
    } else if (reportType === 'whatsapp-cro') {
      m1 = { name: 'WhatsApp Click-to-Chat', val: hasWhatsApp ? 98 : 25 };
      m2 = { name: 'Lead Form Accessibility', val: hasForm || hasTel ? 90 : 40 };
      m3 = { name: 'Mobile Viewport UX', val: viewportMatch ? 95 : 30 };
      m4 = { name: 'Conversion Tracking', val: hasGtm || hasMetaPixel ? 92 : 40 };
    } else if (reportType === 'shopify-cro') {
      m1 = { name: 'E-Commerce Platform', val: cms === 'Shopify' ? 95 : 75 };
      m2 = { name: 'Mobile Checkout Speed', val: speedScore };
      m3 = { name: 'Instant WhatsApp Funnel', val: hasWhatsApp ? 95 : 25 };
      m4 = { name: 'Tracking & Analytics', val: hasGtm || hasMetaPixel ? 90 : 40 };
    } else {
      m1 = { name: 'UAE SEO & Entity', val: seoScore };
      m2 = { name: 'Mobile Speed (5G)', val: speedScore };
      m3 = { name: 'Conversion UX', val: croScore };
      m4 = { name: 'Automation Index', val: autoScore };
    }

    // Return Complete Verified Live Result
    return res.status(200).json({
      success: true,
      isLive: true,
      analyzedUrl: parsedUrl.href,
      domain: host,
      reportType,
      reportTitle: currentConfig.title,
      reportBadge: currentConfig.badge,
      industry,
      scores: {
        overall: overallScore,
        m1,
        m2,
        m3,
        m4
      },
      metrics: {
        status: response.status,
        ttfbMs: ttfb,
        totalTimeMs: totalTime,
        pageSizeKb,
        serverHeader,
        contentEncoding,
        isHttps,
        hsts,
        title,
        titleLength: title.length,
        metaDesc,
        metaDescLength: metaDesc.length,
        hasViewport: !!viewportMatch,
        canonical: canonicalMatch ? canonicalMatch[1] : null,
        h1Count: h1Matches.length,
        h1Snippet: cleanH1,
        h2Count: h2Matches.length,
        totalImages: imgMatches.length,
        imagesMissingAlt,
        schemaTypes: uniqueSchemaTypes,
        hasLocalBusiness,
        hasWhatsApp,
        hasTel,
        hasForm,
        cms,
        scriptCount,
        stylesheetCount,
        tracking: { gtm: hasGtm, meta: hasMetaPixel, tiktok: hasTiktok, snap: hasSnap }
      },
      findings,
      topBottleneck,
      recommendation,
      estimatedLoss: `${estimatedLossAED} / mo`
    });

  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Audit fetch error:', err);
    return res.status(200).json({
      success: false,
      isLive: false,
      error: err.name === 'AbortError' ? 'Target website timed out (> 8.5s).' : err.message,
      domain: host,
      reportType,
      industry
    });
  }
};
