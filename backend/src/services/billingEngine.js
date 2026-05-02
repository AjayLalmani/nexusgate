const Subscription = require('../models/Subscription');

const PLAN_LIMITS = {
  free: 100,
  pro: 10000,
  enterprise: -1 // Unlimited
};

const checkQuota = async (userId) => {
  const subscription = await Subscription.findOne({ userId });
  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Check if period has ended and reset
  if (new Date() > subscription.currentPeriodEnd) {
    subscription.requestsUsed = 0;
    
    // Set next period end
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = d;
    await subscription.save();
  }

  const limit = PLAN_LIMITS[subscription.plan];
  
  if (limit === -1) return true; // Enterprise

  if (subscription.requestsUsed >= limit) {
    if (subscription.plan === 'pro') {
      // apply overage charge (dummy logic for now)
      await applyOverageCharge(userId);
      return true; // allow request but charged
    }
    return false; // free plan hard limit
  }

  return true;
};

const applyOverageCharge = async (userId) => {
  // In a real app, track overage usage and invoice via Stripe at month end.
  // Dummy logic here.
  console.log(`Applying overage charge for user ${userId}`);
};

module.exports = { checkQuota, applyOverageCharge, PLAN_LIMITS };
