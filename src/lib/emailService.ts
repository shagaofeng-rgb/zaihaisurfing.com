import tls from 'node:tls';
import {appendEmailLog, hasSentEmail, type StoreOrder} from '@/lib/commerceStore';

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function smtpConfig() {
  return {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 465),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || 'davidsha@zaihaisurfing.com'
  };
}

function b64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function escapeHtml(value: unknown) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char] || char);
}

async function sendSmtpMail(message: MailPayload) {
  const config = smtpConfig();
  if (!config.host || !config.user || !config.pass) {
    return {ok: false, skipped: true, message: 'SMTP is not configured'};
  }

  const socket = tls.connect({host: config.host, port: config.port, servername: config.host});
  let buffer = '';

  function readLine() {
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('SMTP timeout')), 15000);
      const onData = (chunk: Buffer) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split(/\r?\n/).filter(Boolean);
        const last = lines[lines.length - 1] || '';
        if (/^\d{3} /.test(last)) {
          socket.off('data', onData);
          clearTimeout(timeout);
          const response = buffer;
          buffer = '';
          resolve(response);
        }
      };
      socket.on('data', onData);
      socket.once('error', reject);
    });
  }

  async function command(value: string, expected = /^[23]/) {
    socket.write(`${value}\r\n`);
    const response = await readLine();
    if (!expected.test(response)) throw new Error(response.trim());
    return response;
  }

  await new Promise<void>((resolve, reject) => {
    socket.once('secureConnect', resolve);
    socket.once('error', reject);
  });
  await readLine();
  await command(`EHLO ${config.host}`);
  await command('AUTH LOGIN', /^334/);
  await command(b64(config.user), /^334/);
  await command(b64(config.pass), /^235/);
  await command(`MAIL FROM:<${config.from}>`);
  await command(`RCPT TO:<${message.to}>`);
  await command('DATA', /^354/);

  const boundary = `zaihai-${Date.now()}`;
  const raw = [
    `From: ZAIHAI SURFING <${config.from}>`,
    `To: ${message.to}`,
    `Subject: =?UTF-8?B?${b64(message.subject)}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    message.text,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    message.html,
    '',
    `--${boundary}--`,
    '.'
  ].join('\r\n');

  socket.write(`${raw}\r\n`);
  const dataResponse = await readLine();
  await command('QUIT', /^[23]/).catch(() => undefined);
  socket.end();
  return {ok: true, skipped: false, message: dataResponse.trim()};
}

export async function sendOrderSuccessEmailOnce(order: StoreOrder) {
  if (await hasSentEmail(order.id, 'order_success')) return;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zaihaisurfing.com').replace(/\/$/, '');
  const customerName = order.customer.name || `${order.checkout.firstName} ${order.checkout.lastName}`.trim() || 'Customer';
  const subject = `ZAIHAI order confirmed: ${order.id}`;
  const text = [
    `Hello ${customerName},`,
    '',
    'Your ZAIHAI SURFING payment has been confirmed.',
    `Order number: ${order.id}`,
    `Amount: ${order.currency} ${order.total.toLocaleString()}`,
    `Payment method: ${order.paymentMethod}`,
    `Product: ${order.productName} x ${order.quantity}`,
    `Order time: ${order.createdAt}`,
    `Website: ${siteUrl}`,
    '',
    'Our team will prepare the delivery and update logistics information after shipment.'
  ].join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;color:#111318;line-height:1.6">
      <h2>ZAIHAI order confirmed</h2>
      <p>Hello ${escapeHtml(customerName)}, your payment has been confirmed.</p>
      <table style="border-collapse:collapse;width:100%;max-width:620px">
        <tr><td><b>Order number</b></td><td>${escapeHtml(order.id)}</td></tr>
        <tr><td><b>Amount</b></td><td>${order.currency} ${order.total.toLocaleString()}</td></tr>
        <tr><td><b>Payment method</b></td><td>${escapeHtml(order.paymentMethod)}</td></tr>
        <tr><td><b>Product</b></td><td>${escapeHtml(order.productName)} x ${order.quantity}</td></tr>
        <tr><td><b>Order time</b></td><td>${escapeHtml(order.createdAt)}</td></tr>
      </table>
      <p><a href="${siteUrl}" style="color:#ee2f2f">Visit ZAIHAI SURFING</a></p>
    </div>
  `;

  try {
    const result = await sendSmtpMail({to: order.customer.email, subject, text, html});
    await appendEmailLog({
      orderId: order.id,
      customerEmail: order.customer.email,
      templateType: 'order_success',
      status: result.skipped ? 'skipped' : 'sent',
      providerMessageId: result.message,
      errorMessage: '',
      sentAt: result.skipped ? '' : new Date().toISOString()
    });
  } catch (error) {
    await appendEmailLog({
      orderId: order.id,
      customerEmail: order.customer.email,
      templateType: 'order_success',
      status: 'failed',
      providerMessageId: '',
      errorMessage: error instanceof Error ? error.message.slice(0, 500) : 'Unknown SMTP error',
      sentAt: ''
    });
  }
}

export async function sendAccountActivationEmail(order: StoreOrder, setupUrl: string) {
  const alreadySent = await hasSentEmail(order.id, 'account_activation');
  if (alreadySent) return;
  const subject = `Set up your ZAIHAI account for order ${order.id}`;
  const text = `Your ZAIHAI account is ready. Set your password here: ${setupUrl}`;
  const html = `<p>Your ZAIHAI account is ready.</p><p><a href="${escapeHtml(setupUrl)}">Set your password</a></p>`;
  try {
    const result = await sendSmtpMail({to: order.customer.email, subject, text, html});
    await appendEmailLog({
      orderId: order.id,
      customerEmail: order.customer.email,
      templateType: 'account_activation',
      status: result.skipped ? 'skipped' : 'sent',
      providerMessageId: result.message,
      errorMessage: '',
      sentAt: result.skipped ? '' : new Date().toISOString()
    });
  } catch (error) {
    await appendEmailLog({
      orderId: order.id,
      customerEmail: order.customer.email,
      templateType: 'account_activation',
      status: 'failed',
      providerMessageId: '',
      errorMessage: error instanceof Error ? error.message.slice(0, 500) : 'Unknown SMTP error',
      sentAt: ''
    });
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = 'Reset your ZAIHAI account password';
  const text = `Reset your ZAIHAI account password here: ${resetUrl}`;
  const html = `<p>Reset your ZAIHAI account password.</p><p><a href="${escapeHtml(resetUrl)}">Set a new password</a></p>`;
  try {
    const result = await sendSmtpMail({to: email, subject, text, html});
    await appendEmailLog({
      orderId: 'account',
      customerEmail: email,
      templateType: 'password_reset',
      status: result.skipped ? 'skipped' : 'sent',
      providerMessageId: result.message,
      errorMessage: '',
      sentAt: result.skipped ? '' : new Date().toISOString()
    });
  } catch (error) {
    await appendEmailLog({
      orderId: 'account',
      customerEmail: email,
      templateType: 'password_reset',
      status: 'failed',
      providerMessageId: '',
      errorMessage: error instanceof Error ? error.message.slice(0, 500) : 'Unknown SMTP error',
      sentAt: ''
    });
  }
}
