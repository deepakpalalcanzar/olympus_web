/**
 * Test Directory Controller Methods
 */

var assert = require('assert'),
    request = require('supertest'),
    Utils = require('../../support/utils'),
    Database = require('../../support/database');


describe('File Controller', function() {

  // Clean database before tests
  before(function(done) {
    Database.deleteData(['account', 'accountdeveloper', 'directory', 'directorypermission', 'file', 'filePermission'], done);
  });

  describe('GET /files/:id/thumbnail', function() {
    var file, account, developer;

    // Bootstrap some directories to copy
    before(function(done) {

      // Create an account
      Utils.createAccount({}, function(err, accountModel) {
        if(err) return done(err);
        account = accountModel;

        // Create a Developer Key to get past ACL
        Utils.createAccountDeveloper(account.id, function(err, developerModel) {
          if(err) return done(err);
          developer = developerModel;

          // Create a Source File
          Utils.createFile({ name: 'file-a', dirId: 1, AccountId: account.id }, function(err, fileA) {
            if(err) return done(err);
            file = fileA;

            done();
          });
        });
      });
    });


    it('should respond with file', function(done) {
      request(sails.express.app)
      .get('/files/' + file.id + '/thumbnail')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + developer.access_token)
      .end(function(err, res) {
        assert(res.statusCode === 200);
        assert(res.body.name === 'file-a');
        done();
      });
    });

  });
});
