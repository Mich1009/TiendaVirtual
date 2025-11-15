const nodemailer = require('nodemailer');

function smtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = port === 465; // Gmail 465
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

async function sendMail({ to, subject, text, html }) {
  if (!smtpConfigured()) throw new Error('SMTP no configurado');
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = createTransport();
  return transporter.sendMail({ from, to, subject, text, html });
}

module.exports = { sendMail, smtpConfigured };