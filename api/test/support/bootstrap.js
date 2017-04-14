/**
 * Bootstrap
 */

var Sails = require('sails'),
    Utils = require('./utils'),
    Database = require('./database'),
    localConf = require('../../config/local');

/**
 * Before ALL the test bootstrap the server
 */

var app;

before(function(done) {
  
  this.timeout(5000);
  // Create the Database
  Database.createDatabase(function() {

    Sails.lift({

      log: {
        level: 'error'
      },

      adapters: {
        mysql: {
          module: 'sails-mysql',
          host: 'localhost',
          database: 'olympus_blackops_test',
          user: 'root',
          pass: localConf.MYSQL && localConf.MYSQL.PASS || ''
        }
      }

    }, function(err, sails) {
      app = sails;
      done(err, sails);
    });
  
  });
});


/**
 * After ALL the tests, lower sails
 */

after(function(done) {

  // Remove Testing footprints
  Database.dropDatabase(function() {
    app.lower(done);
  });

});
