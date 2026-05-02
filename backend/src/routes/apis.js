const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const generateKey = require('../utils/generateKey');
const hashKey = require('../utils/hashKey');
const ApiEndpoint = require('../models/ApiEndpoint');
const ApiKey = require('../models/ApiKey');

const router = express.Router();

router.use(verifyToken);

// Create API Endpoint
router.post('/create', [
  body('name').notEmpty(),
  body('targetUrl').isURL()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, targetUrl, description } = req.body;
    const api = new ApiEndpoint({ userId: req.user._id, name, targetUrl, description });
    await api.save();
    res.status(201).json(api);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List APIs
router.get('/', async (req, res) => {
  try {
    const apis = await ApiEndpoint.find({ userId: req.user._id, isActive: true });
    res.json(apis);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update API
router.put('/:id', async (req, res) => {
  try {
    const api = await ApiEndpoint.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { name: req.body.name, targetUrl: req.body.targetUrl, description: req.body.description } },
      { new: true }
    );
    if (!api) return res.status(404).json({ message: 'API not found' });
    res.json(api);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Soft Delete API
router.delete('/:id', async (req, res) => {
  try {
    const api = await ApiEndpoint.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!api) return res.status(404).json({ message: 'API not found' });
    res.json({ message: 'API removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- API Keys Management ---

router.post('/:id/keys', [
  body('label').notEmpty()
], async (req, res) => {
  try {
    const api = await ApiEndpoint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!api) return res.status(404).json({ message: 'API not found' });

    const rawKey = generateKey();
    const hashedKey = hashKey(rawKey);

    const apiKey = new ApiKey({
      key: hashedKey,
      apiEndpointId: api._id,
      userId: req.user._id,
      label: req.body.label
    });
    await apiKey.save();

    // Return the raw key ONLY ONCE
    res.status(201).json({ ...apiKey.toObject(), key: rawKey });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/keys', async (req, res) => {
  try {
    const keys = await ApiKey.find({ apiEndpointId: req.params.id, userId: req.user._id })
                             .select('-key'); // NEVER return the hashed key
    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id/keys/:keyId', async (req, res) => {
  try {
    const key = await ApiKey.findOneAndUpdate(
      { _id: req.params.keyId, apiEndpointId: req.params.id, userId: req.user._id },
      { isRevoked: true },
      { new: true }
    );
    if (!key) return res.status(404).json({ message: 'Key not found' });
    res.json({ message: 'Key revoked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
