# Free Website Hosting & Deployment Guide

> **Zero Hosting Cost Architecture**: The ApexFlow Digital web platform is built with lightweight, semantic HTML5, modern CSS3, and vanilla ES6+ JavaScript. It requires **zero server runtime dependencies, zero build-step overhead, and $0/month in hosting costs**.

---

## 1. Hosting Provider Comparison (100% Free Tiers)

| Feature | Cloudflare Pages (Recommended) | Vercel | Netlify | GitHub Pages |
| :--- | :--- | :--- | :--- | :--- |
| **Monthly Cost** | **$0 / month** | **$0 / month** | **$0 / month** | **$0 / month** |
| **Bandwidth** | Unlimited | 100 GB / month | 100 GB / month | 100 GB / month |
| **Global CDN Speed** | Top Tier (300+ Edge cities including Dubai) | Excellent | Excellent | Good |
| **Automated SSL** | Free Universal SSL | Free Auto-SSL | Free Let's Encrypt | Free Auto-SSL |
| **Custom Domain** | Yes (`.ae`, `.com`) | Yes | Yes | Yes |
| **DDoS Protection** | Industry Gold Standard | Good | Good | Standard |

---

## 2. Option A: Deploy on Cloudflare Pages (Recommended for UAE)

Cloudflare operates direct edge data centers in **Dubai, Abu Dhabi, and across the Middle East**, guaranteeing sub-30ms latency for UAE visitors.

### Step-by-Step Deployment:
1. **Sign up**: Create a free account at [cloudflare.com](https://cloudflare.com).
2. **Navigate**: Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** (or **Direct Upload**).
3. **Configuration**:
   * **Project Name**: `apexflow-digital`
   * **Framework Preset**: `None` (Static HTML)
   * **Build Command**: Leave blank (no build step needed)
   * **Build Output Directory**: `agency` (or root `/` if deploying from the `agency` folder)
4. **Deploy**: Click **Save and Deploy**. Your site is live in under 15 seconds!

---

## 3. Option B: Deploy on Vercel

1. **Sign up**: Create a free account at [vercel.com](https://vercel.com).
2. **Import**: Click **Add New Project** → Import your GitHub repository.
3. **Configuration**:
   * **Root Directory**: Select `agency`
   * **Framework Preset**: `Other`
   * **Build Command**: None
   * **Output Directory**: `.`
4. Click **Deploy**.

---

## 4. Option C: Deploy on Netlify

1. **Sign up**: Create a free account at [netlify.com](https://netlify.com).
2. **Import**: Drag and drop the `agency/` folder directly into the Netlify dashboard, or link your Git repository.
3. **Publish Directory**: `agency`
4. Click **Deploy Site**.

---

## 5. Option D: Deploy on GitHub Pages

1. In your GitHub repository settings, navigate to **Pages**.
2. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
3. Choose your branch (e.g. `main`) and folder (`/agency` or `/docs`).
4. Click **Save**.

---

## 6. Custom Domain Setup (`.ae` or `.com`)

### Where to Register `.ae` Domains:
* Recommended UAE Accredited Registrars: **Etisalat (e&)**, **AEserver**, **GoDaddy**, **Namecheap**.
* Typical cost for a `.ae` domain: ~AED 120 – AED 150/year.

### DNS Records to Point Your Domain (Example on Cloudflare DNS):

| Type | Name | Content / Value | Proxy Status |
| :--- | :--- | :--- | :--- |
| **CNAME** | `@` (root) | `apexflow-digital.pages.dev` | Proxied (Orange Cloud) |
| **CNAME** | `www` | `apexflow-digital.pages.dev` | Proxied (Orange Cloud) |

*SSL certificates are generated and renewed automatically with zero configuration.*
