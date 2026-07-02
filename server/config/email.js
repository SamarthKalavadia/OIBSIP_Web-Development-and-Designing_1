const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Gracefully handle missing or placeholder credentials
  if (!user || user === 'your_email@example.com' || !pass || pass === 'your_email_password') {
    console.warn('⚠️ Email credentials are not configured or are using placeholders. Email sending will be bypassed.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log(`📧 SMTP ready — sending as ${user}`);
  } catch (err) {
    console.warn('📧 SMTP connection failed. Email sending will be bypassed:', err.message);
    transporter = null;
    return null;
  }

  return transporter;
};

module.exports = createTransporter;

