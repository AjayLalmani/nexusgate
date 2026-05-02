const express = require('express');
const stripe = require('../config/stripe');
const { verifyToken } = require('../middleware/auth');
const Subscription = require('../models/Subscription');

const router = express.Router();

// Mock Stripe Checkout for Dummy Payments
router.post('/create-checkout', verifyToken, async (req, res) => {
  const { plan } = req.body;
  if (!['free', 'pro', 'enterprise'].includes(plan)) {
    return res.status(400).json({ message: 'Invalid plan' });
  }

  try {
    // In dummy mode, we don't actually create a Stripe session, just update DB
    // However, if we want to simulate the stripe checkout, we can return a dummy url
    const subscription = await Subscription.findOne({ userId: req.user._id });
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    // Dummy logic: instantly upgrade the user
    subscription.plan = plan;
    subscription.status = 'active';
    
    if (plan === 'pro') subscription.requestLimit = 10000;
    else if (plan === 'enterprise') subscription.requestLimit = -1; // unlimited
    else subscription.requestLimit = 100;

    await subscription.save();

    // Since we are simulating, we just send a success URL to redirect the frontend
    res.json({ url: `${process.env.FRONTEND_URL}/billing?success=true&plan=${plan}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock Stripe Portal
router.get('/portal', verifyToken, async (req, res) => {
  // Dummy portal URL
  res.json({ url: `${process.env.FRONTEND_URL}/settings` });
});

// Webhook for Stripe (Keep this for structure, even if dummy)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body); // dummy fallback
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Payment successful!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});

module.exports = router;
