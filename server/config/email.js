const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify connection
  try {
    await transporter.verify();
    console.log(`📧 SMTP ready — sending as ${process.env.EMAIL_USER}`);
  } catch (err) {
    console.error('📧 SMTP connection failed:', err.message);
    transporter = null;
    throw err;
  }

  return transporter;
};

module.exports = createTransporter;
