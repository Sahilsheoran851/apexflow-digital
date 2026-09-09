# ☁️ Setting Up Oracle Cloud Always Free VPS (24/7 WhatsApp Bot)

Oracle Cloud provides an **"Always Free"** tier with **$0 cost forever** and no expiration date. You get a full Linux Ubuntu cloud virtual machine with persistent storage and a static public IP.

---

## 📋 Step 1: Create Your Free Oracle Cloud Account (2 Minutes)

1. Go to: **[https://www.oracle.com/cloud/free/](https://www.oracle.com/cloud/free/)**
2. Click **Start for free**.
3. Enter your Country (e.g. United Arab Emirates), Name, and Email.
4. **Home Region:** Choose your closest region (e.g., `Dubai` or `Abu Dhabi` or `Frankfurt`).
5. Complete payment verification: Oracle charges a temporary refundable $1 verification hold to verify identity, which is refunded immediately. **Your card is never charged.**

---

## 🖥️ Step 2: Create Your Free Compute Instance (1 Minute)

1. In the Oracle Cloud Console, click **Create a VM instance** (or go to **Compute &rarr; Instances &rarr; Create Instance**).
2. Configure settings:
   - **Name:** `apexflow-whatsapp-bot`
   - **Image and shape:**
     - Image: **Canonical Ubuntu 22.04 or 24.04** (Always Free Eligible)
     - Shape: **VM.Standard.E2.1.Micro** (Always Free) or **Ampere ARM** (Always Free)
   - **Add SSH keys:**
     - Select **Generate a key pair for me** and click **Save Private Key** (saves `ssh-key-...key` to your Downloads).
     - *Or* paste your existing public SSH key (`cat ~/.ssh/id_rsa.pub`).
3. Click **Create**.
4. Within 30 seconds, your instance status changes to **RUNNING** and displays a **Public IP Address** (e.g., `152.67.x.x`).

---

## 🚀 Step 3: Deploy in 1 Single Command

Once your instance is created and you have the **Public IP** and **Private Key**:

Run this command from your Mac terminal inside `/Users/sahilsheoranpersonal/Desktop/agency copy`:

```bash
./scripts/deploy_to_oracle.sh <YOUR_ORACLE_IP> <PATH_TO_DOWNLOADED_PRIVATE_KEY>
```

*Example:*
```bash
./scripts/deploy_to_oracle.sh 152.67.89.123 ~/Downloads/ssh-key-2026-09-09.key
```

### What the script automates:
1. Installs Node.js v20, npm, and PM2 on Oracle Cloud.
2. Copies `scripts/whatsapp_agent.js` and installs dependencies.
3. Copies your pre-authenticated session credentials (`cache/wa_auth`) directly to the cloud server: **you don't even need to scan the QR code again!**
4. Starts the bot with `pm2` and configures `systemd` auto-startup, so the bot runs **24/7/365 permanently even when your laptop is turned off!**

---

## 📊 Monitoring & Logs
- **Live Status in Browser:** `http://<YOUR_ORACLE_IP>:3000`
- **Live Logs:** `ssh -i <KEY> ubuntu@<YOUR_ORACLE_IP> 'pm2 logs apexflow-wa'`
- **Restart Bot:** `ssh -i <KEY> ubuntu@<YOUR_ORACLE_IP> 'pm2 restart apexflow-wa'`
