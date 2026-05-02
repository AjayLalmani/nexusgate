const axios = require('axios');

const forwardRequest = async (req, res, targetUrl, pathParams) => {
  try {
    // Construct the full target URL
    const forwardUrl = `${targetUrl}${pathParams ? '/' + pathParams : ''}`;
    
    // Remove host from headers to prevent conflicts
    const headers = { ...req.headers };
    delete headers.host;
    // Don't forward api key header to upstream
    delete headers['x-api-key'];

    // Send request via axios
    const response = await axios({
      method: req.method,
      url: forwardUrl,
      headers: headers,
      data: req.body,
      params: req.query,
      responseType: 'stream', // Important for handling all content types effectively
      validateStatus: () => true // Resolve promise for all status codes
    });

    // Copy headers from the target response
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set status code and pipe the stream back to the client
    res.status(response.status);
    response.data.pipe(res);

    return {
      statusCode: response.status,
      responseTimeMs: 0 // Will be calculated by logger
    };
  } catch (error) {
    console.error('Forwarding error:', error.message);
    
    if (res.headersSent) {
      return { statusCode: 502, error: error.message };
    }

    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to reach the target API endpoint',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

    return { statusCode: 502, error: error.message };
  }
};

module.exports = { forwardRequest };
