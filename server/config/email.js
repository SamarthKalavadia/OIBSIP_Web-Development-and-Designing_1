const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Ensure email credentials exist
  if (!user || !pass) {
    throw new Error('Email configuration error: EMAIL_USER or EMAIL_PASS environment variables are missing.');
  }

  const config = {
    auth: {
      user,
      pass,
    },
  };

  // If EMAIL_SERVICE is set (e.g., 'gmail'), use Nodemailer's service shortcut
  if (process.env.EMAIL_SERVICE) {
    config.service = process.env.EMAIL_SERVICE;
  } else {
    config.host = host;
    config.port = port;
    config.secure = secure;
    // Force IPv4 resolution to avoid ENETUNREACH on IPv6‑only environments
    config.dns = { family: 4 };
  };

  return nodemailer.createTransport(config);
};

module.exports = createTransporter;
