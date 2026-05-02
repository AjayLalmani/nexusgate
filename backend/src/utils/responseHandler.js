const sendResponse = (res, statusCode, data, message = '') => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data
  });
};

const sendError = (res, statusCode, message, errorDetails = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails
  });
};

module.exports = { sendResponse, sendError };
