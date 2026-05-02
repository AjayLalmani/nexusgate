const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL is not defined. Redis operations will fail.');
  }
  
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  redisClient.on('connect', () => {
    console.log('Redis connected successfully');
  });

  redisClient.on('error', (error) => {
    console.error('Redis connection error:', error.message);
  });
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
