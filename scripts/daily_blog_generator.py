#!/usr/bin/env python3
"""
ApexFlow Digital — Automated Daily Blog Publisher Engine
Generates fresh UAE SEO, Web Engineering, and AI Automation articles,
updates blog.html and sitemap.xml, and runs autonomously via GitHub Actions.
"""

import os
import re
import json
import random
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG_DIR = os.path.join(BASE_DIR, "blog")
BLOG_INDEX_FILE = os.path.join(BASE_DIR, "blog.html")
SITEMAP_XML_FILE = os.path.join(BASE_DIR, "sitemap.xml")
SITEMAP_HTML_FILE = os.path.join(BASE_DIR, "sitemap.html")

DOMAIN = "https://apexflow-digital.vercel.app"

TOPICS = [
    {
        "slug": "how-to-scale-dubai-sme-with-make-zapier-automation",
        "title": "How Dubai SMEs Save AED 12,000/Month Using Make.com and Zapier Automations",
        "category": "AI AUTOMATION",
        "read_time": "6 min read",
        "excerpt": "A step-by-step breakdown of how high-growth UAE businesses connect webhooks, lead forms, and accounting software without manual data entry.",
        "content_paragraphs": [
            "Manual data entry is one of the most expensive hidden operational costs for UAE small and medium enterprises. When sales teams manually copy lead details from web forms, WhatsApp messages, and PropertyFinder emails into CRM systems, costly delays and data entry errors are inevitable.",
            "By implementing automated webhook pipelines using Make.com (Integromat) or Zapier, Dubai businesses can instantly sync customer records, trigger automated invoice generation, and alert sales representatives within seconds.",
            "Key workflows automated by top-performing UAE businesses include: (1) Instant WhatsApp message triage, (2) Auto-sync between web forms and Zoho/HubSpot CRM, (3) Automated customer proposal generation using AI document templates, and (4) Real-time Slack/Telegram notifications for high-priority commercial leads.",
            "The return on investment is immediate: a typical 5-person UAE operations team saves over 80 hours per month, translating to over AED 12,000 in reclaimed productive capacity."
        ]
    },
    {
        "slug": "google-business-profile-optimization-uae-guide",
        "title": "Mastering Google Business Profile in the UAE: How to Win Local Map Pack Searches",
        "category": "LOCAL SEO UAE",
        "read_time": "7 min read",
        "excerpt": "Proven techniques for Dubai and Abu Dhabi businesses to optimize their Google Business Profile, gather 5-star reviews, and outrank local competitors.",
        "content_paragraphs": [
            "In competitive commercial hubs like Dubai, Abu Dhabi, and Sharjah, winning the top 3 spots on Google Maps is often the difference between a thriving inbound lead pipeline and paying exorbitant Google Ads costs.",
            "To dominate local search results, UAE businesses must ensure strict NAP (Name, Address, Phone) consistency across all regional directories such as YellowPages.ae, Etisalat Business Directory, and local chamber records.",
            "Adding geo-tagged photos of your UAE office, specifying targeted sub-districts (e.g. Downtown Dubai, Business Bay, DIFC, Dubai Marina), and responding to customer reviews within 24 hours send strong algorithmic trust signals to Google's ranking engine.",
            "Coupled with structured LocalBusiness schema markup on your main website, your business can capture ready-to-buy decision makers at the exact moment they search for your services."
        ]
    },
    {
        "slug": "shopify-speed-optimization-uae-ecommerce",
        "title": "How UAE E-Commerce Brands Boost Mobile Checkout Conversions by 38%",
        "category": "WEB ENGINEERING",
        "read_time": "5 min read",
        "excerpt": "Why sub-second page loads, Tabby/Tamara buy-now-pay-later integrations, and streamlined mobile checkouts are essential for UAE online stores.",
        "content_paragraphs": [
            "E-commerce in the UAE is fiercely competitive, with over 80% of shopping sessions occurring on mobile devices over 5G networks. If a product page takes longer than 2 seconds to load, shoppers abandon their carts and switch to competing stores.",
            "Optimizing Shopify theme code, removing unused JavaScript apps, and converting product imagery to next-gen WebP formats significantly reduces page load times and bounce rates.",
            "Furthermore, integrating popular UAE buy-now-pay-later (BNPL) options like Tabby and Tamara directly on product pages and at checkout increases average order value (AOV) and conversion rates by up to 38%.",
            "Pairing lightning-fast Shopify storefronts with automated inventory sync pipelines ensures seamless fulfillment across UAE couriers without stock discrepancies."
        ]
    },
    {
        "slug": "ai-chatbots-for-uae-customer-service",
        "title": "Deploying 24/7 Bilingual AI Customer Agents for UAE Businesses",
        "category": "AI AUTOMATION",
        "read_time": "6 min read",
        "excerpt": "How modern UAE companies deploy intelligent AI customer agents that answer client queries in English and Arabic around the clock.",
        "content_paragraphs": [
            "UAE customers expect instantaneous answers at all hours of the day. Relying solely on human customer service agents during standard business hours leads to lost opportunities in the evening and over weekends.",
            "Modern AI knowledge agents trained specifically on your company's service offerings, pricing structures, and FAQs can handle customer inquiries in both English and Arabic with natural conversational fluency.",
            "These agents qualify incoming prospect intent, answer complex technical questions, and seamlessly hand off high-value opportunities to human sales brokers with complete conversation summaries.",
            "This 24/7 responsiveness ensures no customer inquiry goes unanswered, doubling conversion rates on night and weekend web traffic."
        ]
    },
    {
        "slug": "uae-real-estate-lead-automation-pipeline",
        "title": "How Dubai Real Estate Brokerages Automate 100% of Inbound Inquiries",
        "category": "B2B LEAD GEN",
        "read_time": "7 min read",
        "excerpt": "Why top Dubai property agencies use automated WhatsApp qualification and CRM routing to close high-ticket luxury deals in under 30 seconds.",
        "content_paragraphs": [
            "Dubai's real estate market moves at lightning speed. High-net-worth buyers and international investors submitting property inquiries will contact 3 to 5 agencies simultaneously. The brokerage that responds first with verified floor plans and pricing closes the deal.",
            "Traditional agencies suffer from 3-to-6-hour response delays when leads sit unattended in shared Gmail inboxes. By the time a broker calls back, the buyer is already speaking with a competitor.",
            "ApexFlow's automated property lead pipeline captures leads instantly from Google Ads, Meta Ads, and portal webhooks, triggering an immediate bilingual WhatsApp bot within 15 seconds.",
            "The bot qualifies budget (e.g. AED 5M+), preferred communities (Palm Jumeirah, Downtown, Dubai Hills), and investment timeline before instantly placing the qualified lead onto the senior broker's calendar."
        ]
    },
    {
        "slug": "bilingual-arabic-english-seo-strategy-dubai",
        "title": "Bilingual UAE SEO: Unlocking High-Intent Arabic & English Commercial Search Volume",
        "category": "LOCAL SEO UAE",
        "read_time": "8 min read",
        "excerpt": "How targeting Arabic commercial keywords along with English search queries doubles your addressable organic market across the GCC.",
        "content_paragraphs": [
            "While English dominates expatriate searches in Dubai, high-value corporate decision-makers, government procurement teams, and local Emirati investors frequently search in Arabic.",
            "Websites that only publish English content forfeit over 45% of potential organic search demand across the UAE, Saudi Arabia, Qatar, and Kuwait.",
            "Effective bilingual SEO requires distinct URL structures (e.g. /ar/ subfolders), hreflang alternate tags, localized schema markup, and authentic Arabic keyword intent mapping rather than machine-translated gibberish.",
            "When implemented correctly, bilingual technical SEO provides an impenetrable competitive moat that traditional single-language agencies cannot match."
        ]
    }
]

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-7VCJHWBCB8"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());

    gtag('config', 'G-7VCJHWBCB8');
  </script>

  <meta charset="UTF-8">
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">
  <link rel="alternate icon" href="../favicon.svg">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google-site-verification" content="googlee07284f6493ce888">
  <title>{title} | ApexFlow Digital UAE</title>
  <meta name="description" content="{excerpt}">
  <link rel="canonical" href="{domain}/blog/{slug}.html">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css">

  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "{title}",
    "description": "{excerpt}",
    "author": {{
      "@type": "Person",
      "name": "Sahil Sheoran",
      "jobTitle": "Founder & Principal Growth Technologist",
      "url": "https://www.linkedin.com/in/sahilsheoran1/"
    }},
    "publisher": {{
      "@type": "Organization",
      "name": "ApexFlow Digital",
      "url": "{domain}"
    }},
    "datePublished": "{date_iso}",
    "mainEntityOfPage": "{domain}/blog/{slug}.html"
  }}
  </script>
</head>
<body>

  <!-- Navigation Header -->
  <header class="header">
    <div class="container header-content">
      <a href="../index.html" class="logo">
        <div class="logo-icon">⚡</div>
        <span class="logo-text">APEXFLOW<span class="logo-text-accent">DIGITAL</span></span>
        <span class="logo-tag">UAE</span>
      </a>

      <nav class="nav-menu">
        <a href="../index.html" class="nav-link">Home</a>
        <a href="../services.html" class="nav-link">Services</a>
        <a href="../case-studies.html" class="nav-link">Case Studies</a>
        <a href="../packages.html" class="nav-link">Packages</a>
        <a href="../about.html" class="nav-link">About</a>
        <a href="../calculator.html" class="nav-link">ROI Calculator</a>
        <a href="../audit.html" class="nav-link">Cyber Audit</a>
        <a href="../blog.html" class="nav-link active">Blog</a>
        <a href="../contact.html" class="nav-link">Contact</a>
        <div class="nav-cta-group">
          <a href="../contact.html" class="btn btn-primary btn-sm">Get Free Consultation</a>
        </div>
      </nav>

      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <a href="https://wa.me/971507507963" target="_blank" rel="noopener" class="nav-btn-whatsapp" aria-label="Chat on WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.058-2.125-.536-1.528-.636-2.533-2.167-2.613-2.272-.078-.105-.632-.843-.632-1.61 0-.767.394-1.152.538-1.306.144-.153.385-.224.514-.224.129 0 .257.002.371.008.12.006.279-.046.438.334.16.381.547 1.332.596 1.43.048.099.08.216.016.342-.064.128-.096.208-.192.32-.096.112-.204.25-.292.336-.098.096-.201.201-.086.398.115.197.511.844 1.1 1.368.758.674 1.396.883 1.594.981.198.098.314.086.43-.048.115-.134.496-.577.629-.775.133-.198.266-.166.447-.099.182.067 1.155.545 1.353.644.198.099.33.148.378.232.048.083.048.483-.096.888z"/>
          </svg>
          <span>WhatsApp</span>
        </a>
        <button class="mobile-toggle" aria-label="Toggle Navigation Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Article Hero -->
  <article class="section" style="padding-top: 3rem;">
    <div class="container" style="max-width: 820px;">
      <div style="margin-bottom: 1.5rem;">
        <span class="preview-tag">{category}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 0.75rem;">Published: {date_formatted} · {read_time}</span>
      </div>

      <h1 class="hero-title" style="font-size: 2.6rem; text-align: left; margin-bottom: 1.5rem; line-height: 1.25;">
        {title}
      </h1>

      <!-- Author Bio Chip -->
      <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(10, 18, 38, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); margin-bottom: 2.5rem;">
        <img src="../assets/images/sahil-sheoran.svg" alt="Sahil Sheoran" style="width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--neon-cyan);">
        <div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">Sahil Sheoran</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Founder & Principal Growth Technologist | <a href="https://www.linkedin.com/in/sahilsheoran1/" target="_blank" rel="noopener" style="color: var(--neon-cyan);">LinkedIn</a></div>
        </div>
      </div>

      <!-- Article Body -->
      <div class="article-content" style="color: var(--text-secondary); font-size: 1.1rem; line-height: 1.85;">
        {body_html}
      </div>

      <!-- Call to Action Card -->
      <div class="bento-card" style="margin-top: 3.5rem; padding: 2.5rem; border-color: var(--neon-cyan); background: rgba(10, 18, 38, 0.85); text-align: center;">
        <span class="badge-tag">Turn Insight Into Revenue</span>
        <h3 style="font-size: 1.8rem; font-weight: 800; margin: 1rem 0;">Ready to Implement This in Your UAE Business?</h3>
        <p style="color: var(--text-secondary); font-size: 1rem; max-width: 600px; margin: 0 auto 1.75rem auto;">
          Book a free 30-minute technical consultation with Sahil Sheoran. We will audit your current setup and provide a custom growth roadmap.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="../contact.html" class="btn btn-primary">Book Free Strategy Consultation →</a>
          <a href="https://wa.me/971507507963?text=Hi%20Sahil!%20I%20read%20your%20article%20on%20{slug_encoded}%20and%20want%20to%20discuss%20it." target="_blank" rel="noopener" class="btn btn-secondary">Direct WhatsApp Chat</a>
        </div>
      </div>
    </div>
  </article>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-bottom">
        <div>© 2026 ApexFlow Digital. All Rights Reserved. Built for the UAE Market.</div>
        <div style="display: flex; gap: 1.5rem;">
          <a href="../sitemap.html" class="footer-link">HTML Sitemap</a>
          <a href="../sitemap.xml" class="footer-link">XML Sitemap</a>
        </div>
      </div>
    </div>
  </footer>

  <script src="../assets/js/main.js"></script>
</body>
</html>
"""

def generate_new_post():
    os.makedirs(BLOG_DIR, exist_ok=True)
    existing_slugs = {f[:-5] for f in os.listdir(BLOG_DIR) if f.endswith(".html")}

    available_topics = [t for t in TOPICS if t["slug"] not in existing_slugs]
    
    if not available_topics:
        print("All static topics already published. Ready for dynamic AI topics.")
        return None

    chosen = available_topics[0]
    now = datetime.now(timezone.utc)
    date_iso = now.isoformat()
    date_formatted = now.strftime("%B %d, %Y")

    body_html = "".join([f"<p style='margin-bottom: 1.5rem;'>{p}</p>" for p in chosen["content_paragraphs"]])

    rendered_html = HTML_TEMPLATE.format(
        title=chosen["title"],
        excerpt=chosen["excerpt"],
        slug=chosen["slug"],
        slug_encoded=chosen["slug"].replace("-", "%20"),
        category=chosen["category"],
        read_time=chosen["read_time"],
        date_iso=date_iso,
        date_formatted=date_formatted,
        domain=DOMAIN,
        body_html=body_html
    )

    out_path = os.path.join(BLOG_DIR, f"{chosen['slug']}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(rendered_html)
    
    print(f"✓ Created new blog post: {out_path}")
    update_sitemaps(chosen["slug"])
    update_blog_html(chosen, date_formatted)
    update_sitemap_html(chosen)
    return chosen

def update_blog_html(chosen, date_formatted):
    if not os.path.exists(BLOG_INDEX_FILE):
        return
    with open(BLOG_INDEX_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    new_article_card = f"""        <!-- Article: {chosen['title']} -->
        <article class="bento-card bento-col-4" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <span class="preview-tag" style="margin-bottom: 0;">{chosen['category']}</span>
              <span class="text-mono" style="font-size: 0.75rem; color: var(--text-muted);">{date_formatted}</span>
            </div>
            <h3 class="bento-title" style="font-size: 1.25rem; line-height: 1.4; margin-bottom: 0.75rem;">
              <a href="blog/{chosen['slug']}.html" style="color: inherit; text-decoration: none;">{chosen['title']}</a>
            </h3>
            <p class="bento-text" style="font-size: 0.9rem; line-height: 1.6;">
              {chosen['excerpt']}
            </p>
          </div>
          <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--neon-emerald);">{chosen['read_time']}</span>
            <a href="blog/{chosen['slug']}.html" class="nav-link" style="font-weight: 600; color: var(--neon-cyan);">Read Article →</a>
          </div>
        </article>
"""

    if f"blog/{chosen['slug']}.html" not in content:
        container_tag = '<div class="bento-grid" id="blog-posts-container">'
        if container_tag in content:
            content = content.replace(container_tag, f"{container_tag}\n{new_article_card}")
            with open(BLOG_INDEX_FILE, "w", encoding="utf-8") as f:
                f.write(content)
            print("✓ Updated blog.html with new article card")

def update_sitemap_html(chosen):
    if not os.path.exists(SITEMAP_HTML_FILE):
        return
    with open(SITEMAP_HTML_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    new_link = f'<li><a href="blog/{chosen["slug"]}.html">{chosen["title"]}</a></li>'
    if f'blog/{chosen["slug"]}.html' not in content:
        target_marker = '<ul style="list-style: none; padding-left: 0;'
        if target_marker in content:
            content = content.replace(target_marker, f'{target_marker}\n                {new_link}')
            with open(SITEMAP_HTML_FILE, "w", encoding="utf-8") as f:
                f.write(content)
            print("✓ Updated sitemap.html with new link")

def update_sitemaps(new_slug):
    # Update sitemap.xml
    if os.path.exists(SITEMAP_XML_FILE):
        with open(SITEMAP_XML_FILE, "r", encoding="utf-8") as f:
            content = f.read()
        
        new_url_entry = f"""  <url>
    <loc>{DOMAIN}/blog/{new_slug}.html</loc>
    <lastmod>{datetime.now(timezone.utc).strftime('%Y-%m-%d')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>"""
        if f"/blog/{new_slug}.html" not in content:
            content = content.replace("</urlset>", new_url_entry)
            with open(SITEMAP_XML_FILE, "w", encoding="utf-8") as f:
                f.write(content)
            print("✓ Updated sitemap.xml with new post URL")

if __name__ == "__main__":
    generate_new_post()

