/**
 * Utility Helpers for manipulating the MySQL database
 */

var mysql = require('mysql'),
    async = require('async'),
    localConf = require('../../config/local');

var Database = module.exports = {};

/**
 * Drop Table
 */

Database.dropDatabase = function(cb) {

  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : localConf.MYSQL && localConf.MYSQL.PASS || ''
  });

  connection.connect();

  connection.query('DROP database olympus_blackops_test', function(err, rows, fields) {
    cb(err);
  });

  connection.end();
};


/**
 * Create the database
 */

Database.createDatabase = function(cb) {

  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : localConf.MYSQL && localConf.MYSQL.PASS || ''
  });

  connection.connect();

  connection.query('CREATE database olympus_blackops_test', function(err, rows, fields) {
    cb(err);
  });

  connection.end();
};


/**
 * Delete Data from a table
 */

Database.deleteData = function(tables, cb) {

  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    database : 'olympus_blackops_test',
    password : localConf.MYSQL && localConf.MYSQL.PASS || ''
  });

  connection.connect();

  async.each(tables, function(table, next) {
    connection.query('DELETE from ' + table, function(err, rows, fields) {
      next();
    });
  }, function() {
    cb();
  });

  connection.end();
};
