/**
 * Test Directory Controller Methods
 */

var assert = require('assert'),
    request = require('supertest'),
    Utils = require('../../support/utils'),
    Database = require('../../support/database');


describe('Directory Controller', function() {

  describe('with correct permissions', function() {

    // Clean database before tests
    before(function(done) {
      Database.deleteData(['account', 'accountdeveloper', 'directory', 'directorypermission', 'file', 'filePermission'], done);
    });

    describe('POST /folders/:id/copy', function() {
      var directories = {},
          account, developer;

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

              // Create a Target Directory & Permissions
              Utils.createDirectory('dir-b', { AccountId: account.id }, function(err, dirB) {
                if(err) return done(err);
                directories.B = dirB;

                done();
              });
            });
          });
        });
      });


      it('should respond with the copied directory', function(done) {
        request(sails.express.app)
        .post('/folders/' + directories.A.id + '/copy')
        .send({ dest: directories.B.id })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + developer.access_token)
        .end(function(err, res) {
          assert(res.statusCode === 200);
          assert(res.body.name === 'dir-a');
          done();
        });
      });


      it('should error if no target is given', function(done) {
        request(sails.express.app)
        .post('/folders/' + directories.A.id + '/copy')
        .send({})
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + developer.access_token)
        .end(function(err, res) {
          assert(res.statusCode === 400);
          assert(res.body.type === 'error');
          done();
        });
      });

    });
  });


  describe('with incorrect permissions on target directory', function() {

    // Clean database before tests
    before(function(done) {
      Database.deleteData(['account', 'accountdeveloper', 'directory', 'directorypermission', 'file', 'filePermission'], done);
    });

    describe('POST /folders/:id/copy', function() {
      var directories = {},
          account, developer;

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

              // Create a Target Directory & Permissions
              Utils.createDirectory('dir-b', { type: 'read', AccountId: account.id }, function(err, dirB) {
                if(err) return done(err);
                directories.B = dirB;

                done();
              });
            });
          });
        });
      });


      it('should return a 403 error', function(done) {
        request(sails.express.app)
        .post('/folders/' + directories.A.id + '/copy')
        .send({ dest: directories.B.id })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + developer.access_token)
        .end(function(err, res) {
          assert(res.statusCode === 403);
          done();
        });
      });

    });
  });

});
