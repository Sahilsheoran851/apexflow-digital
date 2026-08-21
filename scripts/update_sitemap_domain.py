#!/usr/bin/env python3
"""
ApexFlow Digital — Sitemap Domain Configurator
Updates sitemap.xml and robots.txt with your active deployment domain.
Usage:
  python3 scripts/update_sitemap_domain.py https://apexflow-digital.vercel.app
  python3 scripts/update_sitemap_domain.py https://apexflow-digital.vercel.app
  python3 scripts/update_sitemap_domain.py https://apexflow-digital.vercel.app
"""

import sys
import os

PAGES = [
    ("", "daily", "1.0"),
    ("services.html", "weekly", "0.9"),
    ("services/digital-marketing-uae.html", "weekly", "0.9"),
    ("services/web-development-uae.html", "weekly", "0.9"),
    ("services/ai-automation-uae.html", "weekly", "0.9"),
    ("audit.html", "weekly", "0.85"),
    ("calculator.html", "weekly", "0.85"),
    ("packages.html", "weekly", "0.85"),
    ("case-studies.html", "weekly", "0.85"),
    ("about.html", "monthly", "0.8"),
    ("contact.html", "weekly", "0.9"),
    ("blog.html", "daily", "0.95"),
    ("blog/how-uae-businesses-automate-whatsapp-lead-generation.html", "monthly", "0.8"),
    ("blog/dubai-local-seo-guide-rank-top-3-google-maps.html", "monthly", "0.8"),
    ("blog/why-uae-startups-need-sub-second-website-speed.html", "monthly", "0.8"),
    ("locations/dubai.html", "monthly", "0.8"),
    ("sitemap.html", "weekly", "0.7"),
]

def generate_sitemap(base_url):
    base_url = base_url.rstrip("/")
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    
    for path, freq, prio in PAGES:
        full_url = f"{base_url}/{path}" if path else f"{base_url}/"
        lines.append("  <url>")
        lines.append(f"    <loc>{full_url}</loc>")
        lines.append("    <lastmod>2026-08-22</lastmod>")
        lines.append(f"    <changefreq>{freq}</changefreq>")
        lines.append(f"    <priority>{prio}</priority>")
        lines.append("  </url>")
    
    lines.append("</urlset>\n")
    
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sitemap_path = os.path.join(root_dir, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as fp:
        fp.write("\n".join(lines))
    
    # Also update robots.txt
    robots_path = os.path.join(root_dir, "robots.txt")
    robots_content = f"User-agent: *\nAllow: /\n\nSitemap: {base_url}/sitemap.xml\n"
    with open(robots_path, "w", encoding="utf-8") as fp:
        fp.write(robots_content)
    
    print(f"✅ Updated sitemap.xml and robots.txt for domain: {base_url}")

if __name__ == "__main__":
    domain = sys.argv[1] if len(sys.argv) > 1 else "https://apexflow-digital.vercel.app"
    generate_sitemap(domain)
