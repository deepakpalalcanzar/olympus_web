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

  describe('POST /files/:id/copy', function() {
    var directories = {},
        files = {},
        developer, account;

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

          // Create A Source Directory & Permissions
          Utils.createDirectory('dir-a', { AccountId: account.id }, function(err, dirA) {
            if(err) return done(err);
            directories.A = dirA;

            // Create a Source File
            Utils.createFile({ name: 'file-a', dirId: dirA.id, AccountId: account.id }, function(err, fileA) {
              if(err) return done(err);
              files.A = fileA;

              done();
            });
          });
        });
      });
    });



    it('should respond with an ok status', function (done) {
      request(sails.express.app)
        .post('/share/file/' + files.A.id)
        .send({
        type: 'edit',
        emails: ['abc@def.com']
      })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + developer.access_token)
        .end(function (err, res) {
        assert(res.statusCode === 200);
        assert(res.body.status === 'ok');
        done();
      });
    });

    // TODO: check for account creation and email sending

  });
});