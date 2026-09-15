# ApexFlow Autonomous WhatsApp Bot - Render Deployment & 24/7 Setup Guide

This guide walks you through deploying the ApexFlow Autonomous WhatsApp Agent to **Render.com** as a cloud Web Service so it runs continuously 24/7 even when your laptop is turned off or asleep.

---

## Architecture Overview

1. **Persistent Cloud Web Service (Render):**
   - Runs `scripts/whatsapp_agent.js` with Baileys WebSocket engine.
   - Binds to `0.0.0.0:${PORT}` and serves an auto-refreshing QR code at `/qr`.
   - Serves system JSON health status at `/health`.

2. **24/7 Keep-Alive Monitor (UptimeRobot):**
   - Free tier Render services idle after 15 minutes if no HTTP traffic is received.
   - UptimeRobot sends an HTTP GET request to `https://<your-service>.onrender.com/health` every 5 minutes.
   - This keeps the Render instance permanently awake 24 hours a day, 7 days a week for zero cost.

---

## Step 1: Deploy on Render.com (2 Minutes)

1. Log into [Render.com](https://dashboard.render.com/) (Sign in with your GitHub account `Sahilsheoran851`).
2. Click **New +** in the top-right navigation and select **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your repository:
   - **Repository:** `Sahilsheoran851/apexflow-digital`
4. Configure the service settings:
   - **Name:** `apexflow-whatsapp-agent` (or any name you prefer)
   - **Region:** `Frankfurt (EU Central)` (optimal low latency to Dubai & GCC)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` ($0/month)
5. Scroll down to **Environment Variables** and add:
   - `NODE_VERSION` = `20`
   - `OPENROUTER_API_KEY` = `your_openrouter_api_key_here`
   - `SAHIL_PHONE` = `918076541146` (your WhatsApp alert number without `+`)
6. Click **Deploy Web Service**.
7. Render will build and launch your service. Once finished, Render will display your live service URL (e.g. `https://apexflow-whatsapp-agent.onrender.com`).

---

## Step 2: Link WhatsApp Web (1-Time Scan)

1. Open your browser and navigate to your Render service QR code URL:
   ```
   https://<your-render-service-name>.onrender.com/qr
   ```
2. On your mobile phone:
   - Open **WhatsApp**
   - Tap **Settings** (or 3 dots on Android) -> **Linked Devices**
   - Tap **Link a Device**
   - Point your camera at the QR code displayed on the screen.
3. Within 3 seconds, the browser page will update to:
   ```
   WhatsApp AI Connected & Autonomous!
   ApexFlow Autonomous OpenRouter AI Assistant is live and listening on your number.
   ```
4. Click the button on screen: **Send Test Message to Founder** to verify your WhatsApp receives the ping.

---

## Step 3: Keep Alive with UptimeRobot (Free 24/7)

1. Go to [UptimeRobot.com](https://uptimerobot.com/) and log in (or create a free account).
2. Click **+ Add New Monitor**:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `ApexFlow WhatsApp Render Keep-Alive`
   - **URL (or IP):** `https://<your-render-service-name>.onrender.com/health`
   - **Monitoring Interval:** `Every 5 minutes`
3. Click **Create Monitor**.

From this moment forward, UptimeRobot pings your Render `/health` endpoint every 5 minutes. Render will **never sleep**, and your WhatsApp agent will qualify leads, execute live speed audits, and send hot lead alerts 24/7 even when your computer is shut down.
