const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');
const fs = require('fs');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 8000;
const PUBLIC_DIR = process.env.STATIC_DIR || __dirname;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mcm50445@gmail.com';
const EMAIL_FROM = process.env.EMAIL_FROM || '"Eagle GFS Notifications" <no-reply@eaglegroupsindia.com>';

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Rate limiter: max 10 submissions per 10 minutes per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const MAX_REQUESTS = 10;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW);
  if (timestamps.length >= MAX_REQUESTS) {
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

// Escape HTML for security in email templates
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Build professional HTML email template
function buildEnquiryEmailHtml({ name, company, email, phone, interest, message, timestamp }) {
  const safeName = escapeHtml(name);
  const safeCompany = escapeHtml(company || 'Not provided');
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || 'Not provided');
  const safeInterest = escapeHtml(interest);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeTimestamp = escapeHtml(timestamp);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Website Enquiry – Eagle GFS</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#182536;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6f9;padding:30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(16,31,50,0.08);border:1px solid #e5e9ee;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color:#101f32;padding:32px 36px;text-align:left;border-bottom:4px solid #d7ad62;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.08em;margin-bottom:4px;">
                      EAGLE <span style="color:#d7ad62;">GFS</span>
                    </div>
                    <div style="font-size:11px;font-weight:600;color:#a8b9cc;letter-spacing:0.16em;">
                      GLOBAL FACILITY SOLUTIONS
                    </div>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:6px 14px;background-color:#1c3350;color:#d7ad62;font-size:11px;font-weight:700;border-radius:20px;letter-spacing:0.08em;border:1px solid rgba(215,173,98,0.3);">
                      NEW ENQUIRY
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notification Title -->
          <tr>
            <td style="padding:32px 36px 16px 36px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;color:#101f32;font-weight:700;line-height:1.3;">
                New Website Enquiry Received
              </h1>
              <p style="margin:0;font-size:14px;color:#647181;line-height:1.5;">
                A new enquiry has been submitted through the Eagle Global Facility Solutions contact form.
              </p>
            </td>
          </tr>

          <!-- Summary Table -->
          <tr>
            <td style="padding:16px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #e9edf1;border-radius:8px;overflow:hidden;">
                
                <tr style="background-color:#fafbfc;">
                  <td width="36%" style="padding:12px 16px;font-size:12px;font-weight:700;color:#506173;border-bottom:1px solid #e9edf1;text-transform:uppercase;letter-spacing:0.05em;">
                    Full Name
                  </td>
                  <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#101f32;border-bottom:1px solid #e9edf1;">
                    ${safeName}
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#506173;border-bottom:1px solid #e9edf1;text-transform:uppercase;letter-spacing:0.05em;">
                    Company Name
                  </td>
                  <td style="padding:12px 16px;font-size:14px;color:#101f32;border-bottom:1px solid #e9edf1;">
                    ${safeCompany}
                  </td>
                </tr>

                <tr style="background-color:#fafbfc;">
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#506173;border-bottom:1px solid #e9edf1;text-transform:uppercase;letter-spacing:0.05em;">
                    Work Email
                  </td>
                  <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #e9edf1;">
                    <a href="mailto:${safeEmail}" style="color:#b48c4a;font-weight:600;text-decoration:none;">${safeEmail}</a>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#506173;border-bottom:1px solid #e9edf1;text-transform:uppercase;letter-spacing:0.05em;">
                    Phone Number
                  </td>
                  <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #e9edf1;">
                    ${phone ? `<a href="tel:${safePhone}" style="color:#101f32;text-decoration:none;font-weight:500;">${safePhone}</a>` : '<span style="color:#8a99a8;font-style:italic;">Not provided</span>'}
                  </td>
                </tr>

                <tr style="background-color:#fafbfc;">
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#506173;border-bottom:1px solid #e9edf1;text-transform:uppercase;letter-spacing:0.05em;">
                    Interested Service
                  </td>
                  <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#101f32;border-bottom:1px solid #e9edf1;">
                    <span style="display:inline-block;padding:3px 10px;background-color:#edf2f7;border-radius:4px;color:#101f32;">
                      ${safeInterest}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#506173;text-transform:uppercase;letter-spacing:0.05em;">
                    Submission Date & Time
                  </td>
                  <td style="padding:12px 16px;font-size:13px;color:#506173;">
                    ${safeTimestamp}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Requirement Description Section -->
          <tr>
            <td style="padding:16px 36px 28px 36px;">
              <div style="font-size:12px;font-weight:700;color:#506173;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">
                Requirement Description
              </div>
              <div style="padding:18px 20px;background-color:#f9fafb;border-left:4px solid #d7ad62;border-radius:4px;font-size:14px;line-height:1.65;color:#182536;border-top:1px solid #eef2f5;border-right:1px solid #eef2f5;border-bottom:1px solid #eef2f5;">
                ${safeMessage}
              </div>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding:0 36px 36px 36px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius:6px;background-color:#101f32;">
                    <a href="mailto:${safeEmail}?subject=Re:%20Eagle%20GFS%20Enquiry%20-%20${encodeURIComponent(interest)}" target="_blank" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;padding:14px 28px;display:inline-block;border-radius:6px;background-color:#101f32;letter-spacing:0.04em;">
                      Reply to ${safeName} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafbfc;padding:22px 36px;border-top:1px solid #e9edf1;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:#718294;">
                This message was automatically generated by the <strong>Eagle Global Facility Solutions</strong> website enquiry system.
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b3;">
                Recipient: ${escapeHtml(ADMIN_EMAIL)} &bull; Bengaluru, Karnataka, India
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Plain-text alternative email body
function buildEnquiryEmailText({ name, company, email, phone, interest, message, timestamp }) {
  return `
NEW WEBSITE ENQUIRY – EAGLE GFS
=========================================

Full Name:              ${name}
Company Name:           ${company || 'Not provided'}
Work Email:             ${email}
Phone Number:           ${phone || 'Not provided'}
Interested Service:     ${interest}
Submission Date & Time: ${timestamp}

REQUIREMENT DESCRIPTION:
-----------------------------------------
${message}

-----------------------------------------
You can reply directly to this email to contact the visitor (${email}).
Generated by Eagle Global Facility Solutions Contact Form.
  `.trim();
}

// Helper to send email via Resend API
async function sendViaResend({ name, email, interest, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Resend API key missing');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [ADMIN_EMAIL],
      reply_to: email,
      subject: 'New Website Enquiry – Eagle GFS',
      html,
      text
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Resend API returned status ${res.status}`);
  }
  return { provider: 'resend', id: data.id };
}

// Helper to send email via Nodemailer SMTP
async function sendViaNodemailer({ name, email, html, text }) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });

  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    replyTo: `"${name}" <${email}>`,
    subject: 'New Website Enquiry – Eagle GFS',
    html,
    text
  });

  return { provider: 'smtp', messageId: info.messageId };
}

// Primary email dispatch function
async function dispatchEmail(enquiryData) {
  const html = buildEnquiryEmailHtml(enquiryData);
  const text = buildEnquiryEmailText(enquiryData);

  // 1. Try Resend if API key is provided
  if (process.env.RESEND_API_KEY) {
    return await sendViaResend({ ...enquiryData, html, text });
  }

  // 2. Try Nodemailer with SMTP credentials
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return await sendViaNodemailer({ ...enquiryData, html, text });
  }

  // 3. Fallback: Check if test mode is enabled
  if (process.env.ALLOW_TEST_ACCOUNT === 'true') {
    console.log('[MAIL] Creating temporary Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    const info = await testTransporter.sendMail({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      replyTo: `"${enquiryData.name}" <${enquiryData.email}>`,
      subject: 'New Website Enquiry – Eagle GFS',
      html,
      text
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[MAIL] Ethereal preview link:', previewUrl);
    return { provider: 'ethereal', messageId: info.messageId, previewUrl };
  }

  // If no credentials configured, throw clear actionable error
  throw new Error('Email service credentials are not configured in .env. Please configure SMTP_USER and SMTP_PASS (or RESEND_API_KEY).');
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS & Preflight handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // API Endpoint: Health check
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'ok',
      adminEmail: ADMIN_EMAIL,
      smtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
      resendConfigured: Boolean(process.env.RESEND_API_KEY)
    }));
    return;
  }

  // API Endpoint: Contact Form Submission
  if (req.method === 'POST' && req.url === '/api/contact') {
    // Rate Limiting
    if (isRateLimited(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: false,
        message: 'Too many enquiry requests from this network. Please wait a few moments before trying again.'
      }));
      return;
    }

    // Read request body with size cap (max 64KB)
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 64 * 1024) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      let data = {};
      try {
        data = JSON.parse(body);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON payload received.' }));
        return;
      }

      // Spam Protection: Honeypot check
      if (data._gotcha || data.honeypot) {
        console.warn(`[SPAM] Honeypot triggered from ${clientIp}`);
        // Pretend success so bot departs without retrying
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: 'Enquiry received successfully.' }));
        return;
      }

      // Input Extraction and Sanitization
      const name = (data.name || '').trim();
      const company = (data.company || '').trim();
      const email = (data.email || '').trim().toLowerCase();
      const phone = (data.phone || '').trim();
      const interest = (data.interest || '').trim();
      const message = (data.message || '').trim();

      // Server-Side Validation
      const errors = [];
      if (!name || name.length < 2) {
        errors.push('Full Name is required (at least 2 characters).');
      }
      if (name.length > 100) {
        errors.push('Full Name cannot exceed 100 characters.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        errors.push('A valid work email address is required.');
      }
      if (!interest) {
        errors.push('Please select a service of interest.');
      }
      if (!message || message.length < 10) {
        errors.push('Requirement description must be at least 10 characters.');
      }
      if (message.length > 3000) {
        errors.push('Requirement description cannot exceed 3000 characters.');
      }

      if (errors.length > 0) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          message: errors[0],
          errors
        }));
        return;
      }

      // Timestamp formatted in readable local time
      const dateObj = new Date();
      const timestamp = dateObj.toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'medium',
        timeZone: 'Asia/Kolkata'
      }) + ' (IST)';

      const enquiryPayload = {
        name,
        company,
        email,
        phone,
        interest,
        message,
        timestamp
      };

      try {
        console.log(`[CONTACT] Dispatching enquiry from "${name}" <${email}> for service "${interest}" to ${ADMIN_EMAIL}...`);
        const result = await dispatchEmail(enquiryPayload);
        console.log(`[CONTACT] Email dispatched successfully! Provider: ${result.provider}`);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          message: 'Your enquiry has been successfully submitted.',
          details: {
            adminEmail: ADMIN_EMAIL,
            provider: result.provider,
            previewUrl: result.previewUrl
          }
        }));
      } catch (sendError) {
        console.error('[CONTACT ERROR]', sendError.message);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          message: sendError.message || 'The email notification service is currently unavailable. Please try again shortly or contact us directly.'
        }));
      }
    });

    return;
  }

  // Static File Serving
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let filePath = path.join(PUBLIC_DIR, reqPath);

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      const notFoundPath = path.join(PUBLIC_DIR, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(notFoundPath).pipe(res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`Eagle FMS Redesign Server running on http://localhost:${PORT}`);
  console.log(`Serving directory: ${PUBLIC_DIR}`);
  console.log(`Admin Email Notifications: ${ADMIN_EMAIL}`);
  console.log(`SMTP Configured: ${Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)}`);
  console.log(`Resend Configured: ${Boolean(process.env.RESEND_API_KEY)}`);
  console.log(`===================================================`);
});
