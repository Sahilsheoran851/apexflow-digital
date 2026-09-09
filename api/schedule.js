/**
 * ApexFlow Digital — Autonomous Calendar Scheduling & Lead Notification API
 * Vercel Serverless Function: /api/schedule
 * 
 * - Dispatches Google Meet calendar invitation (.ics) to the prospect
 * - Dispatches immediate lead notification email to Sahil Sheoran
 * - Handles both Strategy Call bookings and Consultation requests
 * - Syncs automatically to Google Sheets
 */

const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER || 'sahilsheoran851@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'vhcoickatiaybaih';
const GOOGLE_MEET_URL = process.env.GOOGLE_MEET_URL || 'https://meet.google.com/ksd-sids-trc';
const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxwnLG2b2DWalLeOcwt1FiN-oc0bpMsSN2Fca6s9HByubaQTTrZNk2WnGBNWHudrucp/exec';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

// Build RFC-compliant ICS calendar content
function buildICS({ uid, summary, description, location, startTime, endTime, attendeeEmail, attendeeName }) {
  const formatTime = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const now = formatTime(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ApexFlow Digital//Strategy Call Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatTime(startTime)}`,
    `DTEND:${formatTime(endTime)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'ORGANIZER;CN=Sahil Sheoran:mailto:sahilsheoran851@gmail.com',
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${attendeeName}:mailto:${attendeeEmail}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: ApexFlow Strategy Call with Sahil Sheoran',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

// Parse Date and Time (GST is UTC+4)
function parseMeetingTimes(dateStr, timeStr) {
  let d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    d = new Date();
    d.setDate(d.getDate() + 1);
  }

  let hours = 10;
  let minutes = 0;
  if (timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = (match[3] || 'AM').toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  // GST is UTC+4. To get UTC time, subtract 4 hours
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  const startUtc = new Date(Date.UTC(year, month, day, hours - 4, minutes, 0));
  const endUtc = new Date(startUtc.getTime() + 15 * 60 * 1000); // 15-minute call

  return { startUtc, endUtc };
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const {
      action = 'meeting',
      fullName = 'Valued Guest',
      companyName = 'Your Business',
      email,
      whatsapp = '',
      topic = 'General Growth Strategy',
      chosenDate = new Date().toISOString().split('T')[0],
      chosenTime = '10:00 AM',
      challenge = '',
      serviceRequired = '',
      budget = '',
      website = '',
      contactPref = ''
    } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const cleanWa = (whatsapp || '').replace(/[^0-9+]/g, '');
    const waChatUrl = `https://wa.me/${cleanWa.replace('+', '')}?text=${encodeURIComponent(`Hi ${fullName}, Sahil here from ApexFlow Digital.`)}`;

    // BRANCH 1: General Consultation Request
    if (action === 'consultation') {
      const prospectMailOptions = {
        from: `"Sahil Sheoran | ApexFlow Digital" <${GMAIL_USER}>`,
        to: `${fullName} <${email}>`,
        replyTo: GMAIL_USER,
        subject: `Consultation Request Received — ApexFlow Digital`,
        html: `<!DOCTYPE html>
<html>
<body style="margin:0; padding:24px 12px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color:#f8fafc; color:#1e293b; line-height:1.65;">
  <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; padding:28px 24px; box-shadow:0 4px 16px rgba(15,23,42,0.04);">
    <div style="font-size:13px; font-weight:700; color:#0f172a; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:16px;">
      APEXFLOW DIGITAL <span style="color:#94a3b8; font-weight:400; margin:0 6px;">|</span> <span style="color:#2563eb; font-weight:600;">Request Received</span>
    </div>
    <p style="margin:0 0 14px 0; font-size:15px; color:#334155;">
      Hi <strong>${fullName}</strong>,
    </p>
    <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">
      Thank you for submitting your project inquiry for <strong>${companyName}</strong> regarding <strong>${serviceRequired || 'Digital Growth Services'}</strong>.
    </p>
    <p style="margin:0 0 20px 0; font-size:15px; color:#334155;">
      I have personally received your details and will review your requirements. If you would like to fast-track our discussion and jump straight onto a video call, feel free to lock in a 15-minute slot on my live calendar:
    </p>
    <div style="text-align:center; margin:24px 0;">
      <a href="https://apexflow-digital.vercel.app/contact.html" style="background:#0f172a; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block;">
        📅 Book 15-Min Strategy Session
      </a>
    </div>
    <p style="font-size:14px; color:#334155; margin:0 0 8px 0;">
      Or reach out directly on WhatsApp for an immediate response:
      <br><a href="https://wa.me/971507507963?text=Hi%20Sahil,%20following%20up%20on%20my%20consultation%20request" style="color:#2563eb; font-weight:600; text-decoration:underline;">+971 50 750 7963</a>
    </p>
    <div style="margin-top:24px; padding-top:16px; border-top:1px solid #f1f5f9; font-size:13px; color:#64748b;">
      <strong style="color:#0f172a; font-size:14px;">Sahil Sheoran</strong><br>
      Founder, ApexFlow Digital<br>
      Dubai, UAE &bull; <a href="https://apexflow-digital.vercel.app" style="color:#2563eb; text-decoration:none;">apexflow-digital.vercel.app</a>
    </div>
  </div>
</body>
</html>`
      };

      const sahilMailOptions = {
        from: `"ApexFlow Leads" <${GMAIL_USER}>`,
        to: GMAIL_USER,
        subject: `🔥 New Consultation Request: ${fullName} (${companyName})`,
        html: `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system, sans-serif; padding:20px; color:#0f172a;">
  <div style="max-width:540px; margin:0 auto; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:24px;">
    <h2 style="color:#2563eb; margin:0 0 12px 0;">🔥 New Consultation Inquiry!</h2>
    <p>A prospect has submitted a proposal request on the website.</p>
    <table style="width:100%; border-collapse:collapse; margin:18px 0; font-size:14px;">
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Name:</td><td style="padding:8px 0; font-weight:700;">${fullName}</td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Company:</td><td style="padding:8px 0; font-weight:700;">${companyName}</td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Email:</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">WhatsApp:</td><td style="padding:8px 0;"><a href="${waChatUrl}">${whatsapp}</a></td></tr>
      ${website ? `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Website:</td><td style="padding:8px 0;"><a href="${website}">${website}</a></td></tr>` : ''}
      ${serviceRequired ? `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Service:</td><td style="padding:8px 0; font-weight:600; color:#0f172a;">${serviceRequired}</td></tr>` : ''}
      ${budget ? `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Budget:</td><td style="padding:8px 0;">${budget}</td></tr>` : ''}
      ${challenge ? `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Challenge/Notes:</td><td style="padding:8px 0;">${challenge}</td></tr>` : ''}
    </table>
    <div style="margin-top:20px;">
      <a href="${waChatUrl}" style="background:#25D366; color:#fff; text-decoration:none; padding:10px 18px; border-radius:6px; font-weight:600; font-size:14px; display:inline-block;">
        Chat on WhatsApp
      </a>
      <a href="mailto:${email}?subject=Re:%20ApexFlow%20Digital%20Consultation" style="background:#0f172a; color:#fff; text-decoration:none; padding:10px 18px; border-radius:6px; font-weight:600; font-size:14px; display:inline-block; margin-left:10px;">
        Reply via Email
      </a>
    </div>
  </div>
</body>
</html>`
      };

      await Promise.all([
        transporter.sendMail(prospectMailOptions),
        transporter.sendMail(sahilMailOptions)
      ]);

      // Forward to Google Sheets
      try {
        fetch(GOOGLE_SHEETS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).catch(() => {});
      } catch (_) {}

      return res.status(200).json({
        success: true,
        message: 'Consultation request received and confirmed.'
      });
    }

    // BRANCH 2: Strategy Call Calendar Meeting Booking (Default)
    const meetUrl = GOOGLE_MEET_URL;
    const { startUtc, endUtc } = parseMeetingTimes(chosenDate, chosenTime);
    const uid = `apexflow-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@apexflow-digital.vercel.app`;

    const icsString = buildICS({
      uid,
      summary: `ApexFlow Strategy Call: ${fullName} & Sahil Sheoran`,
      description: `15-Min Strategy Session with Sahil Sheoran (Founder, ApexFlow Digital).\nTopic: ${topic}\nCompany: ${companyName}\nGoogle Meet Link: ${meetUrl}`,
      location: meetUrl,
      startTime: startUtc,
      endTime: endUtc,
      attendeeEmail: email,
      attendeeName: fullName
    });

    // 1. Send Confirmation to Prospect
    const prospectMailOptions = {
      from: `"Sahil Sheoran | ApexFlow Digital" <${GMAIL_USER}>`,
      to: `${fullName} <${email}>`,
      replyTo: GMAIL_USER,
      subject: `Confirmed: 15-Minute Strategy Session with Sahil Sheoran`,
      headers: {
        'Content-Type': 'multipart/mixed'
      },
      text: `Hi ${fullName},

Your 15-minute strategy session is confirmed.

Meeting Details:
- Date: ${chosenDate}
- Time: ${chosenTime} UAE Time (GST / UTC+4)
- Topic: ${topic}
- Google Meet Video Link: ${meetUrl}

I have attached the calendar invite (.ics) to this email so it syncs directly to your calendar. You can join at the scheduled time using the Google Meet link above.

If you have any questions or need to reschedule, feel free to message me directly on WhatsApp at +971 50 750 7963.

Best regards,

Sahil Sheoran
Founder, ApexFlow Digital
Dubai, UAE | +971 50 750 7963
apexflow-digital.vercel.app`,
      html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:24px 12px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color:#f8fafc; color:#1e293b; line-height:1.65;">

  <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; padding:28px 24px; box-shadow:0 4px 16px rgba(15,23,42,0.04);">
    <div style="font-size:13px; font-weight:700; color:#0f172a; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:16px;">
      APEXFLOW DIGITAL <span style="color:#94a3b8; font-weight:400; margin:0 6px;">|</span> <span style="color:#059669; font-weight:600;">Meeting Confirmed</span>
    </div>

    <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">
      Hi <strong>${fullName}</strong>,
    </p>

    <p style="margin:0 0 18px 0; font-size:15px; color:#334155; line-height:1.6;">
      Your 15-minute strategy session for <strong>${companyName}</strong> is confirmed. Below are your session details:
    </p>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:18px 20px; margin:20px 0;">
      <table style="width:100%; font-size:14px; color:#334155;">
        <tr>
          <td style="padding-bottom:8px; width:35%; color:#64748b; font-weight:500;">Date:</td>
          <td style="padding-bottom:8px; font-weight:700; color:#0f172a;">${chosenDate}</td>
        </tr>
        <tr>
          <td style="padding-bottom:8px; color:#64748b; font-weight:500;">Time:</td>
          <td style="padding-bottom:8px; font-weight:700; color:#0f172a;">${chosenTime} GST (UAE Time)</td>
        </tr>
        <tr>
          <td style="padding-bottom:8px; color:#64748b; font-weight:500;">Focus Topic:</td>
          <td style="padding-bottom:8px; color:#2563eb; font-weight:600;">${topic}</td>
        </tr>
        <tr>
          <td style="color:#64748b; font-weight:500;">Video Room:</td>
          <td><a href="${meetUrl}" style="color:#2563eb; font-weight:600; text-decoration:underline;">Google Meet (${meetUrl})</a></td>
        </tr>
      </table>
    </div>

    <div style="text-align:center; margin:26px 0;">
      <a href="${meetUrl}" style="background-color:#1a73e8; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px; display:inline-block;">
        🎥 Join Google Meet Video Call
      </a>
    </div>

    <p style="font-size:13px; color:#64748b; line-height:1.5; margin:0 0 16px 0;">
      * I have attached the calendar invitation (.ics) to this email so it syncs directly with your Google Calendar, Apple Calendar, or Outlook.
    </p>

    <p style="font-size:14px; color:#334155; margin:0 0 8px 0;">
      Need to reschedule or share notes before our call? Message me directly on WhatsApp:
      <br><a href="https://wa.me/971507507963?text=Hi%20Sahil,%20following%20up%20on%20our%20strategy%20session" style="color:#2563eb; font-weight:600; text-decoration:underline;">+971 50 750 7963</a>
    </p>

    <div style="margin-top:24px; padding-top:16px; border-top:1px solid #f1f5f9; font-size:13px; color:#64748b;">
      <strong style="color:#0f172a; font-size:14px;">Sahil Sheoran</strong><br>
      Founder, ApexFlow Digital<br>
      Dubai, UAE &bull; <a href="https://apexflow-digital.vercel.app" style="color:#2563eb; text-decoration:none;">apexflow-digital.vercel.app</a>
    </div>
  </div>

</body>
</html>`,
      attachments: [
        {
          filename: 'invite.ics',
          content: icsString,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        }
      ]
    };

    // 2. Send Alert Email to Sahil
    const sahilMailOptions = {
      from: `"ApexFlow Scheduler" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: `⚡ New Meeting Booked: ${fullName} (${companyName}) on ${chosenDate} at ${chosenTime} GST`,
      html: `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system, sans-serif; padding:20px; color:#0f172a;">
  <div style="max-width:540px; margin:0 auto; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:24px;">
    <h2 style="color:#059669; margin:0 0 12px 0;">⚡ New Strategy Call Booked!</h2>
    <p>A prospect has confirmed a 15-minute strategy call on the website.</p>

    <table style="width:100%; border-collapse:collapse; margin:18px 0; font-size:14px;">
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Name:</td><td style="padding:8px 0; font-weight:700;">${fullName}</td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Company:</td><td style="padding:8px 0; font-weight:700;">${companyName}</td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Email:</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">WhatsApp:</td><td style="padding:8px 0;"><a href="${waChatUrl}">${whatsapp}</a></td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Topic:</td><td style="padding:8px 0; font-weight:600; color:#2563eb;">${topic}</td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Slot:</td><td style="padding:8px 0; font-weight:700; color:#059669;">${chosenDate} at ${chosenTime} GST</td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; color:#64748b;">Google Meet:</td><td style="padding:8px 0;"><a href="${meetUrl}">${meetUrl}</a></td></tr>
      ${challenge ? `<tr><td style="padding:8px 0; color:#64748b;">Notes:</td><td style="padding:8px 0;">${challenge}</td></tr>` : ''}
    </table>

    <div style="margin-top:20px;">
      <a href="${waChatUrl}" style="background:#25D366; color:#fff; text-decoration:none; padding:10px 18px; border-radius:6px; font-weight:600; font-size:14px; display:inline-block;">
        Chat on WhatsApp
      </a>
      <a href="${meetUrl}" style="background:#1a73e8; color:#fff; text-decoration:none; padding:10px 18px; border-radius:6px; font-weight:600; font-size:14px; display:inline-block; margin-left:10px;">
        Open Google Meet
      </a>
    </div>
  </div>
</body>
</html>`,
      attachments: [
        {
          filename: 'invite.ics',
          content: icsString,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        }
      ]
    };

    // Dispatch both emails in parallel
    await Promise.all([
      transporter.sendMail(prospectMailOptions),
      transporter.sendMail(sahilMailOptions)
    ]);

    // Asynchronously forward to Google Sheets as well
    try {
      fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          companyName,
          email,
          whatsapp,
          serviceRequired: `15-Min Strategy Call: ${topic}`,
          budget: 'Strategy Call Booking',
          challenge: `Slot: ${chosenDate} at ${chosenTime} GST. Meet: ${meetUrl}`,
          contactPref: 'Strategy Call (15-min)',
          timestamp: new Date().toISOString(),
          source: 'Website Scheduler (/api/schedule)'
        })
      }).catch(() => {});
    } catch (_) {}

    return res.status(200).json({
      success: true,
      meetUrl,
      chosenDate,
      chosenTime,
      message: 'Meeting booked successfully! Google Meet invite dispatched to both prospect and host.'
    });

  } catch (err) {
    console.error('Error in /api/schedule:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete calendar booking: ' + err.message
    });
  }
};
