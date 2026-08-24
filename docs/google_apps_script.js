/**
 * ApexFlow Digital — Google Sheets Lead Capture Webhook Script
 * 100% Free Forever · No Third-Party Limits · Instant Real-Time Sync
 *
 * HOW TO SET UP IN 2 MINUTES:
 * 1. Open Google Sheets (https://sheets.new) and name it "ApexFlow Website Leads".
 * 2. In Row 1, add these headers:
 *    A1: Timestamp | B1: Full Name | C1: Company | D1: Email | E1: WhatsApp | F1: Website | G1: Service Required | H1: Budget | I1: Challenge | J1: Contact Preference | K1: Source Page
 * 3. Click Extensions > Apps Script in the top menu.
 * 4. Delete any code in the editor, paste THIS ENTIRE FILE, and click Save (Floppy disk icon).
 * 5. Click Deploy > New deployment > Select type "Web app".
 * 6. Configuration:
 *    - Description: "ApexFlow Form Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so website visitors can submit)
 * 7. Click Deploy > Authorize Access > Choose your Google account > Advanced > Go to (unsafe) > Allow.
 * 8. Copy the "Web app URL" (looks like: https://script.google.com/macros/s/AKfycb.../exec).
 * 9. Paste this URL into your website form: action="https://script.google.com/macros/s/.../exec"
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // Append new row to Google Sheet
    sheet.appendRow([
      new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" }) + " (UAE Time)",
      data.fullName || "N/A",
      data.companyName || "N/A",
      data.email || "N/A",
      data.whatsapp || "N/A",
      data.website || "N/A",
      data.serviceRequired || "N/A",
      data.budget || "N/A",
      data.challenge || "N/A",
      data.contactPref || "WhatsApp",
      data.source || "Website Form"
    ]);

    // Format latest row styling
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 11).setVerticalAlignment("middle");

    return ContentService
      .createTextOutput(JSON.stringify({ "status": "success", "row": lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("ApexFlow Digital Google Sheets Webhook is Active & Ready.");
}
