const crypto = require('crypto');

const hashKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

module.exports = hashKey;
