const hashKey = require('../utils/hashKey');
const ApiKey = require('../models/ApiKey');
const ApiEndpoint = require('../models/ApiEndpoint');
const { checkQuota } = require('../services/billingEngine');

const validateApiKey = async (req, res, next) => {
  const apiKeyRaw = req.headers['x-api-key'];

  if (!apiKeyRaw) {
    return res.status(401).json({ error: 'Unauthorized', message: 'API key is missing in headers (x-api-key)' });
  }

  try {
    const hashedKey = hashKey(apiKeyRaw);
    
    // Find the API key and populate related info
    const apiKeyDoc = await ApiKey.findOne({ key: hashedKey, isRevoked: false });
    
    if (!apiKeyDoc) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or revoked API key' });
    }

    // Check if the endpoint exists and is active
    const endpointDoc = await ApiEndpoint.findById(apiKeyDoc.apiEndpointId);
    
    if (!endpointDoc || !endpointDoc.isActive) {
      return res.status(404).json({ error: 'Not Found', message: 'Target API endpoint is not found or inactive' });
    }

    // Check billing quota for user
    const hasQuota = await checkQuota(apiKeyDoc.userId);
    if (!hasQuota) {
      return res.status(429).json({ error: 'Too Many Requests', message: 'Billing quota exceeded. Please upgrade your plan.' });
    }

    // Attach info to request
    req.apiKey = apiKeyDoc;
    req.apiUser = apiKeyDoc.userId;
    req.apiEndpoint = endpointDoc;

    // Async update last used
    apiKeyDoc.lastUsed = new Date();
    apiKeyDoc.save().catch(err => console.error('Failed to update key lastUsed', err));

    next();
  } catch (error) {
    console.error('API Key validation error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Error validating API key' });
  }
};

module.exports = { validateApiKey };
