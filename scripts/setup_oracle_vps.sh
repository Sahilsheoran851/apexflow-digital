#!/usr/bin/env bash
# ==============================================================================
# ApexFlow Digital — Turnkey Oracle Cloud VPS 24/7 Deployment Script
# Automatically configures Ubuntu, installs Node 20+, PM2, and launches WhatsApp Bot
# ==============================================================================

set -e

echo "========================================================"
echo "🚀 ApexFlow Digital — 24/7 WhatsApp Cloud Setup"
echo "========================================================"

# 1. Update system packages
echo "📦 [1/5] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git ufw

# 2. Install Node.js 20 LTS
echo "⚡ [2/5] Installing Node.js LTS (v20)..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 3. Install PM2 process manager
echo "🔄 [3/5] Installing PM2 process manager..."
sudo npm install -g pm2

# 4. Setup directory and install dependencies
echo "📂 [4/5] Preparing application directory..."
mkdir -p ~/apexflow-bot/cache/wa_auth
cd ~/apexflow-bot

# Install required npm packages
echo "📥 Installing WhatsApp Baileys & OpenRouter dependencies..."
npm init -y > /dev/null 2>&1
npm install @whiskeysockets/baileys@^7.0.0-rc14 qrcode qrcode-terminal pino@^10.3.1 --save

# 5. Open firewall port 3000 for web status dashboard
echo "🛡️ [5/5] Configuring firewall for port 3000..."
sudo ufw allow 3000/tcp || true

echo ""
echo "========================================================"
echo "✅ Oracle VPS Environment is Ready!"
echo "Next step: copy your 'scripts/whatsapp_agent.js' and 'cache/wa_auth/'"
echo "Then start with: pm2 start whatsapp_agent.js --name 'apexflow-wa'"
echo "========================================================"
