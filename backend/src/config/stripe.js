const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not defined.');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

module.exports = stripe;
