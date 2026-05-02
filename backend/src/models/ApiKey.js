const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // Store hashed key
  apiEndpointId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiEndpoint', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, required: true },
  isRevoked: { type: Boolean, default: false },
  lastUsed: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);
