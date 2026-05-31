const nodemailer = require("nodemailer");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[0-9\s().-]{7,24}$/;

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const inquiry = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const errors = validateInquiry(inquiry);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ ok: false, errors });
    }

    await sendInquiryEmail(normalizeInquiry(inquiry), req);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Inquiry email failed:", error);
    return res.status(500).json({ ok: false, error: "Inquiry submission failed" });
  }
};

function setCorsHeaders(req, res) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestOrigin = req.headers.origin;
  const allowOrigin =
    allowedOrigins.length === 0 || allowedOrigins.includes(requestOrigin) ? requestOrigin || "*" : allowedOrigins[0];

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function validateInquiry(inquiry) {
  const errors = {};

  if (inquiry.website) errors.website = "Spam submission blocked.";
  if (!String(inquiry.name || "").trim()) errors.name = "Name is required.";
  if (!String(inquiry.email || "").trim()) errors.email = "Email is required.";
  else if (!emailPattern.test(String(inquiry.email).trim())) errors.email = "Email format is invalid.";
  if (!String(inquiry.phone || "").trim()) errors.phone = "Phone is required.";
  else if (!phonePattern.test(String(inquiry.phone).trim())) errors.phone = "Phone format is invalid.";
  if (!inquiry.captchaCheck) errors.captchaCheck = "Business inquiry confirmation is required.";

  return errors;
}

function normalizeInquiry(inquiry) {
  return {
    name: clean(inquiry.name),
    email: clean(inquiry.email),
    phone: clean(inquiry.phone),
    company: clean(inquiry.company),
    country: clean(inquiry.country),
    product: clean(inquiry.product),
    message: clean(inquiry.message, 3000),
    sourcePage: clean(inquiry.sourcePage, 600),
    language: clean(inquiry.language),
    market: clean(inquiry.market),
    submittedAt: clean(inquiry.submittedAt),
    userAgent: clean(inquiry.userAgent, 600),
  };
}

function clean(value, maxLength = 240) {
  return String(value || "")
    .replace(/\r/g, "")
    .trim()
    .slice(0, maxLength);
}

async function sendInquiryEmail(inquiry, req) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.exmail.qq.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `New ZAIHAI Inquiry - ${inquiry.product || inquiry.country || "Website Quote"}`;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "Not available";

  await transporter.sendMail({
    from: `"ZAIHAI Website Inquiry" <${process.env.INQUIRY_FROM || process.env.SMTP_USER}>`,
    to: process.env.INQUIRY_TO || "davidsha@zaihaisurfing.com",
    replyTo: inquiry.email,
    subject,
    text: buildTextEmail(inquiry, ip),
    html: buildHtmlEmail(inquiry, ip),
  });
}

function buildTextEmail(inquiry, ip) {
  return [
    "New inquiry from ZAIHAI website",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone}`,
    `Company: ${inquiry.company || "-"}`,
    `Country / Region: ${inquiry.country || "-"}`,
    `Product Requirement: ${inquiry.product || "-"}`,
    `Message: ${inquiry.message || "-"}`,
    "",
    `Source Page: ${inquiry.sourcePage || "-"}`,
    `Language: ${inquiry.language || "-"}`,
    `Market: ${inquiry.market || "-"}`,
    `Submitted At: ${inquiry.submittedAt || new Date().toISOString()}`,
    `IP: ${ip}`,
    `User Agent: ${inquiry.userAgent || "-"}`,
  ].join("\n");
}

function buildHtmlEmail(inquiry, ip) {
  const rows = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Company", inquiry.company || "-"],
    ["Country / Region", inquiry.country || "-"],
    ["Product Requirement", inquiry.product || "-"],
    ["Message", inquiry.message || "-"],
    ["Source Page", inquiry.sourcePage || "-"],
    ["Language", inquiry.language || "-"],
    ["Market", inquiry.market || "-"],
    ["Submitted At", inquiry.submittedAt || new Date().toISOString()],
    ["IP", ip],
    ["User Agent", inquiry.userAgent || "-"],
  ];

  return `
    <div style="font-family:Arial,sans-serif;max-width:720px;color:#111318">
      <h2 style="margin:0 0 16px">New ZAIHAI Website Inquiry</h2>
      <table style="width:100%;border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="width:180px;padding:10px;border:1px solid #e2e5e9;background:#f6f7f4;font-weight:700">${escapeHtml(label)}</td>
                <td style="padding:10px;border:1px solid #e2e5e9;white-space:pre-wrap">${escapeHtml(value)}</td>
              </tr>
            `,
          )
          .join("")}
      </table>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
