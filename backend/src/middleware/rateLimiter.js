const { getRedisClient } = require('../config/redis');
const { PLAN_LIMITS } = require('../services/billingEngine');
const Subscription = require('../models/Subscription');

// Global route rate limiter (e.g. for dashboard API)
const globalRateLimiter = async (req, res, next) => {
  try {
    const redis = getRedisClient();
    const ip = req.ip || req.connection.remoteAddress;
    const key = `ratelimit:global:${ip}`;
    
    const limit = 200;
    const windowMs = 60000; // 1 min
    
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.pexpire(key, windowMs);
    }
    
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));

    if (current > limit) {
      return res.status(429).json({ error: 'Too Many Requests', message: 'Global rate limit exceeded (200/min)' });
    }
    
    next();
  } catch (err) {
    // Fail open if Redis is down
    console.error('Global rate limit error:', err);
    next();
  }
};

// Gateway sliding window rate limiter per API Key based on Plan Limit
const gatewayRateLimiter = async (req, res, next) => {
  try {
    const redis = getRedisClient();
    const apiKeyId = req.apiKey._id.toString();
    const userId = req.apiUser.toString();
    
    // Get user's plan to determine hourly rate limit
    // To minimize DB hits per request, cache plan in redis briefly or fetch
    let limit = 100; // default free
    const cacheKey = `plan:${userId}`;
    let cachedPlan = await redis.get(cacheKey);
    
    if (!cachedPlan) {
      const sub = await Subscription.findOne({ userId });
      cachedPlan = sub ? sub.plan : 'free';
      await redis.set(cacheKey, cachedPlan, 'EX', 3600); // cache for 1 hour
    }
    
    const planLimitHourly = PLAN_LIMITS[cachedPlan];
    
    if (planLimitHourly === -1) {
      return next(); // unlimited
    }
    
    const now = Date.now();
    const windowSizeMs = 3600000; // 1 hour sliding window
    const windowStart = now - windowSizeMs;
    const redisKey = `ratelimit:gateway:${apiKeyId}`;
    
    // Sliding window using Redis Sorted Sets
    const multi = redis.multi();
    // 1. Remove elements outside the window
    multi.zremrangebyscore(redisKey, 0, windowStart);
    // 2. Add current request
    multi.zadd(redisKey, now, `${now}-${Math.random()}`); // value needs to be unique
    // 3. Get count
    multi.zcard(redisKey);
    // 4. Update expiry
    multi.pexpire(redisKey, windowSizeMs);
    
    const results = await multi.exec();
    const requestCount = results[2][1];
    
    res.setHeader('X-RateLimit-Limit', planLimitHourly);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, planLimitHourly - requestCount));
    
    if (requestCount > planLimitHourly) {
      res.setHeader('Retry-After', 3600);
      return res.status(429).json({ 
        error: 'Too Many Requests', 
        message: `Plan rate limit exceeded (${planLimitHourly}/hr)` 
      });
    }
    
    next();
  } catch (error) {
    console.error('Gateway rate limit error:', error);
    next(); // Fail open
  }
};

module.exports = { globalRateLimiter, gatewayRateLimiter };
