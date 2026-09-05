#!/usr/bin/env node
/**
 * CLI Audit Runner for ApexFlow Digital
 * Usage: node scripts/audit_site.js <url> [reportType] [industry]
 */

const handler = require('../api/audit.js');

const targetUrl = process.argv[2] || 'https://apexflow-digital.vercel.app';
const reportType = process.argv[3] || 'full-stack';
const industry = process.argv[4] || 'b2b';

console.log(`\n🔍 [ApexFlow Live Engine] Auditing: ${targetUrl}`);
console.log(`📊 Report Type: ${reportType} | Industry: ${industry}\n`);

const req = {
  query: { url: targetUrl, type: reportType, industry }
};

const res = {
  setHeader: () => {},
  status: (code) => ({
    json: (data) => {
      if (!data.success && !data.isLive) {
        console.error(`❌ Audit Failed: ${data.error}`);
        process.exit(1);
      }

      console.log(`=======================================================`);
      console.log(`🟢 AUDIT RESULT: ${data.domain.toUpperCase()}`);
      console.log(`   Live Verified: ${data.isLive ? 'YES (Real DOM & Network Scan)' : 'FALLBACK'}`);
      console.log(`   Overall Score: ${data.scores.overall}/100`);
      console.log(`   TTFB Latency:  ${data.metrics.ttfbMs}ms (Status: ${data.metrics.status})`);
      console.log(`   Page Size:     ${data.metrics.pageSizeKb} KB`);
      console.log(`   Server/Edge:   ${data.metrics.serverHeader} (${data.metrics.contentEncoding})`);
      console.log(`   CMS / Stack:   ${data.metrics.cms}`);
      console.log(`   WhatsApp:      ${data.metrics.hasWhatsApp ? '✅ DETECTED' : '❌ NOT FOUND'}`);
      console.log(`   Estimated Loss:${data.estimatedLoss}`);
      console.log(`=======================================================\n`);

      console.log(`📋 REAL FINDINGS:`);
      data.findings.forEach((f, i) => {
        const icon = f.status === 'pass' ? '✅' : f.status === 'warn' ? '⚠️' : '❌';
        console.log(`  ${i + 1}. ${icon} [${f.name}]: ${f.value}`);
        console.log(`     ${f.text}`);
      });

      console.log(`\n🚨 TOP BOTTLENECK:\n   ${data.topBottleneck}`);
      console.log(`\n💡 RECOMMENDATION:\n   ${data.recommendation}\n`);
    }
  })
};

handler(req, res);
