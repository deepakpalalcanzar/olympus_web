var localConf = require('./local');

// Configure installed adapters
// If you define an attribute in your model definition,
// it will override anything from this global config.
module.exports.adapters = {

  // If you leave the adapter config unspecified
  // in a model definition, 'default' will be used.
  'default': 'mysql',

  // In-memory adapter for DEVELOPMENT ONLY
  memory: {
    module: 'sails-memory'
  },

  // Persistent adapter for DEVELOPMENT ONLY
  // (data IS preserved when the server shuts down)
  disk: {
    module: 'sails-disk'
  },

  // MySQL is the world's most popular relational database.
  // Learn more: http://en.wikipedia.org/wiki/MySQL
  mysql: {
    module: 'sails-mysql',
    host: localConf.MYSQL && localConf.MYSQL.HOST || 'localhost',
    user: localConf.MYSQL && localConf.MYSQL.USER || 'root',
    password: (localConf.MYSQL && (typeof(localConf.MYSQL.PASS) !== 'undefined')) ? localConf.MYSQL.PASS : 'refico',
    database: localConf.MYSQL && localConf.MYSQL.DB || 'olympus-blackops'
  },

  s3: {
    apiKey: localConf.s3.API_KEY,
    apiSecret: localConf.s3.API_SECRET,
    bucket: localConf.s3.BUCKET || 'olympus_stuff'
  }
};
