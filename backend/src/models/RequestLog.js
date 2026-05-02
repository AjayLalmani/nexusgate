const mongoose = require('mongoose');

const RequestLogSchema = new mongoose.Schema({
  apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apiEndpointId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiEndpoint' },
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseTimeMs: { type: Number, required: true },
  ipAddress: { type: String },
  error: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// TTL index to auto-delete logs older than 90 days
RequestLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('RequestLog', RequestLogSchema);
