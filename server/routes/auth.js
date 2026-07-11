const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Generate verification token using email hash and random bytes for robustness
    const tokenPart = crypto.randomBytes(16).toString('hex');
    const emailPart = Buffer.from(email).toString('hex');
    const verificationToken = `${emailPart}_${tokenPart}`;
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (unverified by default)
    await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationToken,
      verificationExpires,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://pizza-8raef2je6-samarths-projects-d716b84a.vercel.app';
    const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 16px; overflow: hidden; padding: 24px; border: 1px solid #2a2a4e;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">🍕</span>
          <h1 style="color: #ff6b35; margin: 8px 0 0 0; font-size: 28px;">Welcome to PizzaGo!</h1>
        </div>
        <div style="background: #16213e; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Verify Your Email Address</h2>
          <p style="line-height: 1.6;">Hi ${name},</p>
          <p style="line-height: 1.6;">Thank you for signing up with PizzaGo! To get started on ordering your favorite customized pizzas, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: linear-gradient(135deg, #ff6b35, #ff8c42); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(255,107,53,0.2);">Verify Email Address</a>
          </div>
          <p style="color: #888; font-size: 14px; line-height: 1.6;">This link is valid for 24 hours. If you did not sign up for a PizzaGo account, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} PizzaGo. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Verify your email - PizzaGo',
        html,
      });
    } catch (emailErr) {
      console.error('📧 Verification email sending failed:', emailErr.message);
    }

    // Proactively log verification link to server console for developer testing
    console.log(`\n🔑 [DEVELOPER TEST] Email Verification Link:\n🔗 ${verificationLink}\n`);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      });
    }

    // Create session
    req.session.userId = user._id;

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Login failed due to session error.' });
      }

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user & destroy session
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out. Please try again.' });
      }
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out successfully.' });
    });
  } else {
    res.json({ message: 'No active session.' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification link
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether account exists
      return res.json({ message: 'If an unverified account exists, a new verification email has been sent.' });
    }

    if (user.isVerified) {
      return res.json({ message: 'Your email is already verified. Please log in.' });
    }

    // Generate fresh token
    const tokenPart = crypto.randomBytes(16).toString('hex');
    const emailPart = Buffer.from(email).toString('hex');
    const verificationToken = `${emailPart}_${tokenPart}`;
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'https://pizza-8raef2je6-samarths-projects-d716b84a.vercel.app';
    const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 16px; overflow: hidden; padding: 24px; border: 1px solid #2a2a4e;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">🍕</span>
          <h1 style="color: #ff6b35; margin: 8px 0 0 0; font-size: 28px;">Verify Your Email</h1>
        </div>
        <div style="background: #16213e; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">New Verification Link</h2>
          <p style="line-height: 1.6;">Hi ${user.name},</p>
          <p style="line-height: 1.6;">Here is your new verification link. Click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: linear-gradient(135deg, #ff6b35, #ff8c42); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #888; font-size: 14px;">This link is valid for 24 hours.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({ to: email, subject: 'Resend: Verify your email - PizzaGo', html });
    } catch (emailErr) {
      console.error('📧 Resend verification email failed:', emailErr.message);
    }

    console.log(`\n🔑 [DEVELOPER TEST] Resend Verification Link for ${email}:\n🔗 ${verificationLink}\n`);

    res.json({ message: 'If an unverified account exists, a new verification email has been sent.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Robust token decoding
    const parts = token.split('_');
    if (parts.length < 2) {
      return res.status(400).json({ message: 'Verification link expired.' });
    }

    const emailHex = parts[0];
    let email;
    try {
      email = Buffer.from(emailHex, 'hex').toString();
    } catch (err) {
      return res.status(400).json({ message: 'Verification link expired.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Verification link expired.' });
    }

    if (user.isVerified) {
      return res.json({ message: 'Email already verified.' });
    }

    if (user.verificationToken !== token || !user.verificationExpires || user.verificationExpires < new Date()) {
      return res.status(400).json({ message: 'Verification link expired.' });
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error during verification.' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide email.' });
    }

    const user = await User.findOne({ email });
    const successMsg = { message: 'Reset link sent if account exists' };
    if (!user) {
      return res.json(successMsg);
    }

    const tokenPart = crypto.randomBytes(16).toString('hex');
    const emailPart = Buffer.from(email).toString('hex');
    const resetToken = `${emailPart}_${tokenPart}`;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'https://pizza-8raef2je6-samarths-projects-d716b84a.vercel.app';
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 16px; overflow: hidden; padding: 24px; border: 1px solid #2a2a4e;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">🍕</span>
          <h1 style="color: #ff6b35; margin: 8px 0 0 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        <div style="background: #16213e; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Reset Your Password</h2>
          <p style="line-height: 1.6;">Hi ${user.name},</p>
          <p style="line-height: 1.6;">You are receiving this email because you (or someone else) requested a password reset for your PizzaGo account. Please click the button below to complete the process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #ff6b35, #ff8c42); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(255,107,53,0.2);">Reset Password</a>
          </div>
          <p style="color: #888; font-size: 14px; line-height: 1.6;">This link is valid for 1 hour. If you did not request this, you can ignore this email and your password will remain unchanged.</p>
        </div>
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} PizzaGo. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Reset Password - PizzaGo',
        html,
      });
    } catch (emailErr) {
      console.error('📧 Password reset email sending failed:', emailErr.message);
    }

    // Proactively log reset link to server console for developer testing
    console.log(`\n🔑 [DEVELOPER TEST] Password Reset Link:\n🔗 ${resetLink}\n`);

    res.json(successMsg);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Robust token decoding
    const parts = token.split('_');
    if (parts.length < 2) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const emailHex = parts[0];
    let email;
    try {
      email = Buffer.from(emailHex, 'hex').toString();
    } catch (err) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const user = await User.findOne({ email });
    if (!user || user.resetPasswordToken !== token || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;

