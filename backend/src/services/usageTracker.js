const { getRedisClient } = require('../config/redis');
const Subscription = require('../models/Subscription');

const incrementUsage = async (userId) => {
  try {
    const redis = getRedisClient();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const redisKey = `usage:${userId}:${currentMonth}`;

    // Atomic increment in Redis
    const currentUsage = await redis.incr(redisKey);
    
    // Set expiry for 32 days if first request of month
    if (currentUsage === 1) {
      await redis.expire(redisKey, 32 * 24 * 60 * 60);
    }

    // Async write to DB every 10 requests to minimize DB load
    if (currentUsage % 10 === 0) {
      await Subscription.findOneAndUpdate(
        { userId },
        { requestsUsed: currentUsage },
        { new: true }
      );
    }
    
    return currentUsage;
  } catch (error) {
    console.error('Usage increment error:', error);
    // Fallback to DB if redis fails
    const sub = await Subscription.findOneAndUpdate(
      { userId },
      { $inc: { requestsUsed: 1 } },
      { new: true }
    );
    return sub ? sub.requestsUsed : 0;
  }
};

const getUsage = async (userId) => {
  try {
    const redis = getRedisClient();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const redisKey = `usage:${userId}:${currentMonth}`;
    
    let usage = await redis.get(redisKey);
    if (usage !== null) {
      return parseInt(usage, 10);
    }

    // Fallback to DB
    const sub = await Subscription.findOne({ userId });
    return sub ? sub.requestsUsed : 0;
  } catch (error) {
    const sub = await Subscription.findOne({ userId });
    return sub ? sub.requestsUsed : 0;
  }
};

module.exports = { incrementUsage, getUsage };
