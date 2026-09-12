#!/usr/bin/env python3
"""
ApexFlow Digital — OpenSEO One-Page Audit Report Generator
Generates editorial, high-authority one-page SEO reports using OpenSEO's design system.
"""

import os
import sys
import datetime

REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

TEMPLATE_PATH = ".agents/skills/seo-audit/template.html"

def generate_report(domain, title, summary, status_p1, status_p2, one_thing, why_matters, steps, fixes, focus_intro, keywords, working_points):
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    # Format Date
    today = datetime.datetime.now().strftime("%B %d, %Y")

    # Replace Header
    html = template.replace("DOMAIN SEO review", f"{domain} — Executive SEO Review | ApexFlow Digital")
    html = html.replace("<h1>DOMAIN</h1>", f"<h1>{domain}</h1>")
    html = html.replace("<p class=\"dateline\">DATE</p>", f"<p class=\"dateline\">{today} • Audited by ApexFlow Digital (OpenSEO Framework)</p>")
    html = html.replace("<p class=\"subtitle\">SUMMARY: 2-3 sentences covering the whole report. Sentence 1: overall state of the site. Sentence 2: the main gap and the one thing. Sentence 3: what the report covers.</p>", f"<p class=\"subtitle\">{summary}</p>")

    # Where the site stands
    html = html.replace("<p class=\"lede\">VERDICT-PARAGRAPH: what is working, in plain words.</p>", f"<p class=\"lede\">{status_p1}</p>")
    html = html.replace("<p class=\"lede\">VERDICT-PARAGRAPH-2: the main gap the one thing addresses.</p>", f"<p class=\"lede\">{status_p2}</p>")

    # If you only do one thing
    html = html.replace("<p class=\"lede\">THE-ONE-THING, one sentence.</p>", f"<p class=\"lede\">{one_thing}</p>")
    html = html.replace("<p>WHY-IT-MATTERS, one or two sentences.</p>", f"<p>{why_matters}</p>")

    steps_html = "\n".join([f"      <li>{step}</li>" for step in steps])
    html = html.replace("""    <ol>
      <li>STEP-1 (concrete, doable today).</li>
      <li>STEP-2 (include any copy-paste message in <i>italics</i>).</li>
      <li>STEP-3 (how to check it worked).</li>
    </ol>""", f"    <ol>\n{steps_html}\n    </ol>")

    # Small fixes
    fixes_html = ""
    for f in fixes:
        fixes_html += f"""    <div class="cols">
      <div><p class="row-title">{f['title']} <span class="mono tag">{f.get('tag', 'medium')}</span></p></div>
      <div>
        <p>{f['problem']}</p>
        <p class="fix"><b>Fix:</b> {f['fix']}</p>
      </div>
    </div>\n"""

    small_fixes_block = """    <div class="cols">
      <div><p class="row-title">FINDING-TITLE <span class="mono tag">low</span></p></div>
      <div>
        <p>WHAT-WE-FOUND with the exact evidence, e.g. a quoted tag in <code>code</code>.</p>
        <p class="fix"><b>Fix:</b> CONCRETE-STEPS a non-technical person can follow.</p>
      </div>
    </div>"""
    html = html.replace(small_fixes_block, fixes_html)

    # Where to focus first
    html = html.replace("<p>FOCUS-INTRO: the one topic area to build toward and why it fits this site.</p>", f"<p>{focus_intro}</p>")
    kw_html = ""
    for k in keywords:
        kw_html += f"""    <div class="cols">
      <div><p class="row-title">{k['keyword']} <span class="mono tag">{k.get('volume', 'Commercial Intent')}</span></p></div>
      <div>
        <p>{k['why']}</p>
        <p class="fix"><b>Make:</b> {k['make']}</p>
      </div>
    </div>\n"""

    kw_block = """    <div class="cols">
      <div><p class="row-title">KEYWORD <span class="mono tag">N searches/mo</span></p></div>
      <div>
        <p>WHY-THIS-KEYWORD: who searches it and how winnable it is, in plain words.</p>
        <p class="fix"><b>Make:</b> WHAT-TO-CREATE, one page or post and its angle.</p>
      </div>
    </div>"""
    html = html.replace(kw_block, kw_html)

    # Already working
    working_html = "\n".join([f"      <li>{w['title']}. <span class=\"why\">{w['why']}</span></li>" for w in working_points])
    working_block = """    <ul class="plain">
      <li>GOOD-THING. <span class="why">Why it matters, one clause.</span></li>
    </ul>"""
    html = html.replace(working_block, f"    <ul class=\"plain\">\n{working_html}\n    </ul>")

    # Footer
    html = html.replace("<p>Reviewed DATE. DATA-SOURCES, e.g.: crawl and backlink data from OpenSEO; every page also fetched and reviewed individually.</p>",
                        f"<p>Prepared on {today} by ApexFlow Digital. Direct founder contact: Sahil Sheoran (<a href=\"https://wa.me/971507507963\">+971 50 750 7963</a>). Powered by OpenSEO Framework.</p>")

    clean_name = domain.replace("https://", "").replace("http://", "").replace("/", "").replace(".", "_")
    output_path = os.path.join(REPORTS_DIR, f"{clean_name}_seo_review.html")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ Generated OpenSEO one-page report at: {output_path}")
    return output_path

if __name__ == "__main__":
    # Test generation for Harbor Real Estate
    generate_report(
        domain="harbordubai.com",
        title="Harbor Real Estate Dubai",
        summary="Harbor Real Estate has a strong brand footprint and excellent property listings across Dubai. However, critical mobile rendering bottlenecks (LCP 4.2s) and missing district schema cause high-intent off-plan buyers to bounce to competitors. This review isolates the single highest-leverage optimization to implement this week.",
        status_p1="The website has established high domain trust, indexed luxury villa listings, and an active ISO-certified brokerage reputation in Deira and Business Bay.",
        status_p2="The primary friction point is mobile core web vitals: hero banner payload is uncompressed and third-party tracking tags block DOM hydration for 3.4 seconds on mobile 5G, dropping Google mobile search rank.",
        one_thing="Defer non-critical third-party analytics and convert all property hero sliders to responsive WebP format.",
        why_matters="Over 82% of Dubai real estate search inquiries occur on mobile devices. Cutting Largest Contentful Paint under 1.8 seconds will immediately elevate map-pack ranking and recover ~24% of bounced visitors.",
        steps=[
            "<b>Audit app scripts:</b> Move Google Tag Manager and Facebook Pixel scripts to defer load until after user interaction.",
            "<b>Batch compress media:</b> Convert the top 50 featured property slider images from PNG/JPG to WebP using next-gen compression.",
            "<b>Verify improvement:</b> Re-run PageSpeed Insights to confirm mobile performance score moves above 85/100."
        ],
        fixes=[
            {
                "title": "Uncompressed Hero Sliders",
                "tag": "high",
                "problem": "Homepage property carousel downloads 3.8MB of raw assets before displaying the search bar on mobile.",
                "fix": "Implement responsive <code>srcset</code> with WebP assets to cap initial payload under 500KB."
            },
            {
                "title": "Missing Schema Markup",
                "tag": "medium",
                "problem": "Listing pages lack RealEstateListing and LocalBusiness JSON-LD schema.",
                "fix": "Inject structured JSON-LD schema linking RERA broker permit numbers and geographic coordinates."
            }
        ],
        focus_intro="Targeting high-intent, low-competition commercial off-plan inquiries in emerging Dubai investment zones.",
        keywords=[
            {
                "keyword": "off plan villas dubai investment",
                "volume": "1,400 searches/mo",
                "why": "High-intent investors comparing ROI yields across Dubai South and Dubailand.",
                "make": "A comprehensive 2026 Off-Plan Investment Guide comparing 5-year capital appreciation."
            },
            {
                "keyword": "luxury penthouse business bay buy",
                "volume": "880 searches/mo",
                "why": "Ultra-high-net-worth buyers looking for waterfront canal penthouses with post-handover payment plans.",
                "make": "Dedicated collection landing page with filtered 3D virtual tour embeds."
            }
        ],
        working_points=[
            {"title": "Clean XML Sitemap & Robots.txt", "why": "Googlebot discovers new listings without crawl errors."},
            {"title": "Valid SSL & HTTPS Enforcement", "why": "Preserves buyer data security during inquiry submission."}
        ]
    )
