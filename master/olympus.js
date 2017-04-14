// Start app
var _ = require('lodash');
require('sails').lift(_.merge(require('./config/config.js'), require('./config/localConfig.js'), require('./config/express.js')));
