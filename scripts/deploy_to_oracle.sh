#!/usr/bin/env bash
# ==============================================================================
# ApexFlow Digital — 1-Command Sync to Oracle Cloud VPS
# Usage: ./scripts/deploy_to_oracle.sh <VPS_IP> [SSH_KEY_PATH]
# Example: ./scripts/deploy_to_oracle.sh 152.67.123.45 ~/.ssh/id_rsa
# ==============================================================================

set -e

VPS_IP="$1"
KEY_PATH="${2:-~/.ssh/id_rsa}"

if [ -z "$VPS_IP" ]; then
    echo "Usage: $0 <ORACLE_VPS_IP> [SSH_KEY_PATH]"
    echo "Example: $0 152.67.123.45 ~/.ssh/id_rsa"
    exit 1
fi

echo "========================================================"
echo "🚀 Deploying ApexFlow WhatsApp Agent to Oracle Cloud ($VPS_IP)"
echo "========================================================"

SSH_CMD="ssh -i $KEY_PATH -o StrictHostKeyChecking=no ubuntu@$VPS_IP"
SCP_CMD="scp -i $KEY_PATH -o StrictHostKeyChecking=no"

# 1. Run remote environment setup if not already prepared
echo "🔧 Setting up Node.js & PM2 on remote server..."
$SSH_CMD "mkdir -p ~/apexflow-bot/cache/wa_auth"
$SCP_CMD scripts/setup_oracle_vps.sh "ubuntu@$VPS_IP:~/setup_oracle_vps.sh"
$SSH_CMD "bash ~/setup_oracle_vps.sh"

# 2. Copy the agent script
echo "📄 Uploading whatsapp_agent.js..."
$SCP_CMD scripts/whatsapp_agent.js "ubuntu@$VPS_IP:~/apexflow-bot/whatsapp_agent.js"

# 3. Copy pre-authenticated session credentials (NO QR RESCAN NEEDED!)
if [ -d "cache/wa_auth" ]; then
    echo "🔑 Syncing pre-authenticated WhatsApp session keys..."
    $SCP_CMD -r cache/wa_auth/* "ubuntu@$VPS_IP:~/apexflow-bot/cache/wa_auth/"
fi

# 4. Start with PM2
echo "⚡ Starting bot with PM2 on Oracle Cloud..."
$SSH_CMD "cd ~/apexflow-bot && pm2 delete apexflow-wa 2>/dev/null || true"
$SSH_CMD "cd ~/apexflow-bot && pm2 start whatsapp_agent.js --name 'apexflow-wa'"
$SSH_CMD "pm2 save"
$SSH_CMD "sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true"

echo ""
echo "========================================================"
echo "🎉 SUCCESS! ApexFlow WhatsApp Bot is running 24/7 on Oracle Cloud!"
echo "Status dashboard: http://$VPS_IP:3000"
echo "To check live logs: ssh -i $KEY_PATH ubuntu@$VPS_IP 'pm2 logs apexflow-wa'"
echo "========================================================"
