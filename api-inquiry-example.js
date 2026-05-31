/*
  Example backend endpoint for the inquiry form.

  Use this as a template in Express, Vercel Functions, Netlify Functions, or your own server.
  Required environment variables:
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_USER
  - SMTP_PASS
  - INQUIRY_TO_EMAIL=davidsha@zaihaisurfing.com

  Optional database storage:
  - Replace the saveInquiryToDatabase function with Prisma, Supabase, MySQL, PostgreSQL, etc.
*/

import nodemailer from "nodemailer";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[0-9\s().-]{7,24}$/;

export default async function inquiryHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const inquiry = req.body || {};
  const errors = validateInquiry(inquiry);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  await sendInquiryEmail(inquiry);
  await saveInquiryToDatabase(inquiry);

  return res.status(200).json({ ok: true });
}

function validateInquiry(inquiry) {
  const errors = {};

  if (!inquiry.name?.trim()) errors.name = "Name is required.";
  if (!inquiry.email?.trim()) errors.email = "Email is required.";
  else if (!emailPattern.test(inquiry.email.trim())) errors.email = "Email format is invalid.";
  if (!inquiry.phone?.trim()) errors.phone = "Phone is required.";
  else if (!phonePattern.test(inquiry.phone.trim())) errors.phone = "Phone format is invalid.";
  if (inquiry.website) errors.website = "Spam submission blocked.";

  return errors;
}

async function sendInquiryEmail(inquiry) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.INQUIRY_TO_EMAIL || "davidsha@zaihaisurfing.com",
    replyTo: inquiry.email,
    subject: `New ZAIHAI Inquiry - ${inquiry.product || "General"}`,
    text: [
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone}`,
      `Company: ${inquiry.company || "-"}`,
      `Country / Region: ${inquiry.country || "-"}`,
      `Product Requirement: ${inquiry.product || "-"}`,
      `Message: ${inquiry.message || "-"}`,
    ].join("\n"),
  });
}

async function saveInquiryToDatabase(inquiry) {
  // Example:
  // await prisma.inquiry.create({ data: inquiry });
  // await supabase.from("inquiries").insert(inquiry);
  return inquiry;
}
