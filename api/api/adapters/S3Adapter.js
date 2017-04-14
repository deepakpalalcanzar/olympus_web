/**
 * S3 adapter using knox
 */

var knox = require('knox');



module.exports = (function () {

  // Adapter specific variables
  var client;

  /**
   * Git Adapter Methods
   */

  var adapter = {

    // Set Identity, for testing
    identity: 's3',

    /**
     * Register Collection, required by Waterline
     */

    registerCollection: function (collection, cb) {
      client = knox.createClient({
        key: collection.config.apiKey,
        secret: collection.config.apiSecret,
        bucket: collection.config.bucket
      });
      
      return cb();
    },

    s3: client

  };

  return adapter;
})();