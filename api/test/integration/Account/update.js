/**
 * Test Directory Controller Methods
 */

var assert = require('assert'),
    request = require('supertest'),
    Utils = require('../../support/utils'),
    Database = require('../../support/database');


describe('Account Controller', function() {

  // Clean database before tests
  before(function(done) {
    Database.deleteData(['account', 'accountdeveloper', 'directory', 'directorypermission', 'file', 'filePermission'], done);
  });

  describe('PUT /account/:id', function() {
    var account, developer;

    before(function(done) {

      // Create an account
      Utils.createAccount({ isAdmin: true }, function(err, accountModel) {
        if(err) return done(err);
        account = accountModel;

        // Create a Developer Key to get past ACL
        Utils.createAccountDeveloper(account.id, function(err, developerModel) {
          if(err) return done(err);
          developer = developerModel;

          done();
        });
      });
    });


    it('should respond with updated account', function(done) {
      request(sails.express.app)
      .put('/account/' + account.id)
      .send({ name: 'foo updated' })
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + developer.access_token)
      .end(function(err, res) {
        assert(res.statusCode === 200);
        assert(res.body.name === 'foo updated');
        done();
      });
    });

  });
});
