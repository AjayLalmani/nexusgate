const express = require('express');
const { validateApiKey } = require('../middleware/gateway');
const { gatewayRateLimiter } = require('../middleware/rateLimiter');
const { logRequest } = require('../middleware/logger');
const { forwardRequest } = require('../services/forwarder');

const router = express.Router();

// The gateway catch-all route
router.all('/*path', validateApiKey, gatewayRateLimiter, logRequest, async (req, res) => {
  const targetUrl = req.apiEndpoint.targetUrl;

  let pathParams = req.params.path || '';

  await forwardRequest(req, res, targetUrl, pathParams);
});

module.exports = router;
