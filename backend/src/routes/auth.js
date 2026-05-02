const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getRedisClient } = require('../config/redis');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const router = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

router.post('/signup', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Create free subscription for new user
    const sub = new Subscription({ userId: user._id });
    await sub.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    res.status(201).json({ accessToken, refreshToken, user: { id: user._id, name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    res.json({ accessToken, refreshToken, user: { id: user._id, name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`bl_${refreshToken}`);
    if (isBlacklisted) return res.status(403).json({ message: 'Token has been revoked' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret');
    const tokens = generateTokens(decoded.id);
    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      const redis = getRedisClient();
      // Blacklist for 7 days
      await redis.set(`bl_${refreshToken}`, 'true', 'EX', 7 * 24 * 60 * 60);
    } catch (e) {
      console.error('Redis error on logout', e);
    }
  }
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
