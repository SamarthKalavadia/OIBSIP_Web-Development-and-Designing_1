const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const auth = require('../middleware/auth');
const checkStockAndAlert = require('../utils/stockAlert');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/payment/create-order
// @desc    Create a Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ message: 'Error creating payment order.' });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify payment and create order
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      pizza,
      totalPrice,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    // Create order in database
    const order = await Order.create({
      user: req.user._id,
      pizza,
      totalPrice,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: 'Paid',
      status: 'Order Received',
    });

    // Decrement inventory
    const { base, sauce, cheese, veggies } = pizza;

    await Inventory.findOneAndUpdate(
      { category: 'base', name: base },
      { $inc: { quantity: -1 } }
    );
    await Inventory.findOneAndUpdate(
      { category: 'sauce', name: sauce },
      { $inc: { quantity: -1 } }
    );
    await Inventory.findOneAndUpdate(
      { category: 'cheese', name: cheese },
      { $inc: { quantity: -1 } }
    );

    if (veggies && veggies.length > 0) {
      for (const veggie of veggies) {
        await Inventory.findOneAndUpdate(
          { name: veggie, category: { $in: ['veggie', 'meat'] } },
          { $inc: { quantity: -1 } }
        );
      }
    }

    // Check stock levels and send alert if needed
    await checkStockAndAlert();

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    // Send Order Confirmation Email
    const emailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 16px; overflow: hidden; padding: 24px; border: 1px solid #2a2a4e;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #2a2a4e; padding-bottom: 16px;">
          <span style="font-size: 48px;">🍕</span>
          <h1 style="color: #ff6b35; margin: 8px 0 0 0; font-size: 28px;">Order Confirmed!</h1>
          <p style="color: #888; margin: 4px 0 0 0;">Thank you for your order, ${populatedOrder.user.name}!</p>
        </div>
        <div style="background: #16213e; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h3 style="color: #ffffff; margin-top: 0; border-bottom: 1px solid #2a2a4e; padding-bottom: 8px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Order ID:</td>
              <td style="padding: 6px 0; color: #fff; text-align: right; font-family: monospace; font-size: 14px;">${populatedOrder._id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Order Date:</td>
              <td style="padding: 6px 0; color: #fff; text-align: right; font-size: 14px;">${new Date(populatedOrder.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Order Status:</td>
              <td style="padding: 6px 0; text-align: right; font-size: 14px;"><span style="background: #ff6b35; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${populatedOrder.status}</span></td>
            </tr>
          </table>
        </div>
        <div style="background: #16213e; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h3 style="color: #ffffff; margin-top: 0; border-bottom: 1px solid #2a2a4e; padding-bottom: 8px;">Pizza Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Base Crust:</td>
              <td style="padding: 6px 0; color: #fff; text-align: right; font-size: 14px;">${populatedOrder.pizza.base}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Sauce:</td>
              <td style="padding: 6px 0; color: #fff; text-align: right; font-size: 14px;">${populatedOrder.pizza.sauce}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Cheese:</td>
              <td style="padding: 6px 0; color: #fff; text-align: right; font-size: 14px;">${populatedOrder.pizza.cheese}</td>
            </tr>
            ${populatedOrder.pizza.veggies && populatedOrder.pizza.veggies.length > 0 ? `
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px; vertical-align: top;">Toppings:</td>
              <td style="padding: 6px 0; color: #fff; text-align: right; font-size: 14px;">${populatedOrder.pizza.veggies.join(', ')}</td>
            </tr>` : ''}
          </table>
        </div>
        <div style="background: #ff6b35; color: #ffffff; padding: 16px 20px; border-radius: 12px; text-align: center; font-size: 18px; font-weight: bold;">
          Total Paid: ₹${populatedOrder.totalPrice} INR
        </div>
        <div style="text-align: center; color: #666; font-size: 12px; margin-top: 24px;">
          <p style="margin: 0;">If you have any questions, please contact our support team.</p>
          <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} PizzaGo. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: populatedOrder.user.email,
        subject: `🍕 PizzaGo Order Confirmed! — #${populatedOrder._id}`,
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error('📧 Order confirmation email sending failed:', emailErr.message);
    }

    res.status(201).json({ message: 'Order placed successfully!', order: populatedOrder });
  } catch (error) {
    console.error('Payment verify error:', error);
    res.status(500).json({ message: 'Error processing order.' });
  }
});

module.exports = router;
