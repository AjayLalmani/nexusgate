const RequestLog = require('../models/RequestLog');
const { incrementUsage } = require('../services/usageTracker');

const logRequest = (req, res, next) => {
  const start = Date.now();
  
  // Intercept the finish event to log details after response is sent
  res.on('finish', () => {
    try {
      const responseTimeMs = Date.now() - start;
      
      // Safely extract IP
      const ipAddress = req.ip || 
                        (req.connection && req.connection.remoteAddress) || 
                        (req.socket && req.socket.remoteAddress) || 
                        'unknown';

      // Write log asynchronously (don't await)
      const logEntry = {
        apiKeyId: req.apiKey ? req.apiKey._id : null,
        userId: req.apiUser ? req.apiUser : null,
        apiEndpointId: req.apiEndpoint ? req.apiEndpoint._id : null,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs,
        ipAddress,
        timestamp: new Date()
      };
      
      RequestLog.create(logEntry).catch(err => console.error('Failed to write request log:', err));

      // Increment usage metrics if successful gateway request
      if (req.apiUser) {
        incrementUsage(req.apiUser).catch(err => console.error('Failed to increment usage:', err));
      }
    } catch (err) {
      console.error('Synchronous error in logRequest finish handler:', err);
    }
  });

  next();
};

module.exports = { logRequest };
