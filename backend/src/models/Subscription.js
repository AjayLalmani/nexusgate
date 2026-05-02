const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  status: { type: String, default: 'active' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { 
    type: Date, 
    default: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d;
    }
  },
  requestsUsed: { type: Number, default: 0 },
  requestLimit: { type: Number, default: 100 } // Free plan default
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
