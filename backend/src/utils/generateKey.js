const crypto = require('crypto');

const generateKey = () => {
  const randomHex = crypto.randomBytes(16).toString('hex');
  return `sk_live_${randomHex}`;
};

module.exports = generateKey;
