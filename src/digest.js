const crypto = require('crypto');

/**
 * Creates a HMAC hex digest of data using the given key.
 * 
 * @param {Object} data - Data to sign.
 * @param {String|Buffer|TypedArray|DataView|KeyObject} key - Secret for the 
 *    HMAC.
 */
function digest(data, key) {
  return 'sha1=' +
    crypto
      .createHmac('sha1', key)
      .update(data.toString())
      .digest('hex');
}

module.exports = digest;