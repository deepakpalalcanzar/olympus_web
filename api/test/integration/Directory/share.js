/**
 * Test Directory Controller Methods
 */

var assert = require('assert'),
  request = require('supertest'),
  Utils = require('../../support/utils'),
  Database = require('../../support/database');


describe('Directory Controller', function () {

  this.timeout(10000);

  // Clean database before tests
  before(function (done) {
    Database.deleteData(['account', 'accountdeveloper', 'directory', 'directorypermission', 'file', 'filePermission'], done);
  });

  describe('POST /share/folders/:id', function () {
    var directories = {}, account, developer;

    // Bootstrap a directory to share
    before(function (done) {

      // Create an account
      Utils.createAccount({}, function (err, accountModel) {
        if (err) return done(err);
        account = accountModel;

        // Create a Developer Key to get past ACL
        Utils.createAccountDeveloper(account.id, function (err, developerModel) {
          if (err) return done(err);
          developer = developerModel;

          // Create A Source Directory & Permissions
          Utils.createDirectory('dir-a', {
            AccountId: account.id
          }, function (err, dirA) {
            if (err) return done(err);
            directories.A = dirA;
            done();
          });
        });
      });
    });


    it('should respond with an ok status', function (done) {
      request(sails.express.app)
        .post('/share/folder/' + directories.A.id)
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

    /// TODO: check for account creation and email send

  });
});