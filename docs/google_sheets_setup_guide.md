# 📊 Connecting ApexFlow Website Forms to Google Sheets (100% Free Forever)

Follow this 2-minute guide to receive every consultation inquiry directly as a new row in your private Google Sheet.

---

### Step 1: Create your Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new sheet named **"ApexFlow Website Leads"**.
2. In **Row 1**, paste these exact column headers:

| A1 | B1 | C1 | D1 | E1 | F1 | G1 | H1 | I1 | J1 | K1 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Timestamp (UAE)** | **Full Name** | **Company Name** | **Work Email** | **WhatsApp Number** | **Website URL** | **Service Required** | **Budget** | **Challenge / Goals** | **Preferred Channel** | **Source Page** |

---

### Step 2: Add the Webhook Script
1. In your Google Sheet, click **Extensions** $\rightarrow$ **Apps Script**.
2. Delete any default code in the editor.
3. Open [`agency/docs/google_apps_script.js`](file:///Users/sahilsheoran/Documents/Untitled/agency/docs/google_apps_script.js), copy the entire code, and paste it into the editor.
4. Click **Save** (Floppy disk icon 💾).

---

### Step 3: Deploy as Web App
1. In the top right of the Apps Script screen, click **Deploy** $\rightarrow$ **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" $\rightarrow$ choose **Web app**.
3. Fill in the fields:
   * **Description**: `ApexFlow Form Webhook`
   * **Execute as**: `Me (your Google email)`
   * **Who has access**: `Anyone` *(IMPORTANT: Must be "Anyone" so visitors can send data)*
4. Click **Deploy**.
5. Google will ask for permission $\rightarrow$ Click **Authorize access** $\rightarrow$ choose your Google account $\rightarrow$ click **Advanced** $\rightarrow$ click **Go to Untitled (unsafe)** $\rightarrow$ click **Allow**.
6. Copy the **Web app URL** provided (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).

---

### Step 4: Link to Your Website
Add your Web App URL to the `<form>` tag in `index.html` and `contact.html`:

```html
<form id="consultation-form" action="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec">
```

Or you can provide your Web App URL here, and I will connect it to your website forms automatically!
