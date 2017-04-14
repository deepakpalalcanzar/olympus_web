/**
 * Test Instance/Class Methods on a File Model
 */

var assert = require('assert'),
    Utils = require('../../support/utils'),
    Database = require('../../support/database');

describe('Account', function() {

  describe('.destroy()', function() {
    var account,
        directories = {},
        files = {};

    before(function(done) {

      // Clean database before tests
      Database.deleteData(['account', 'directory', 'directorypermission', 'file', 'filePermission'],
      function() {

        // Create an account
        Utils.createAccount({}, function(err, accountModel) {
          if(err) return done(err);
          account = accountModel;

          // Create A Workgroup & Permissions
          Utils.createDirectory('dir-a', { OwnerId: account.id }, function(err, dir) {
            if(err) return done(err);
            directories.A = dir;

            // Create a Child Directory
            Utils.createDirectory('dir-b', { DirectoryId: dir.id }, function(err, childDir) {
              if(err) return done(err);
              directories.B = childDir;

              // Create a File & Permissions
              Utils.createFile({ name: 'file-a', dirId: childDir.id }, function(err, fileObj) {
                if(err) return done(err);
                files.A = fileObj;

                done();
              });
            });
          });
        });
      });
    });


    it('should delete the account record', function(done) {
      account.destroy(function(err) {
        assert(!err);
        assert(account.deleted == true);
        assert(account.deleteDate);
        done();
      });
    });


    it('should delete workgroup record', function(done) {
      account.destroy(function(err) {

        // Look up the directory
        Directory.findOne(directories.A.id).exec(function(err, dir) {
          assert(!err);
          assert(dir.deleted == true);
          assert(dir.deleteDate);
          done();
        });
      });
    });


    it('should delete workgroup child directory record', function(done) {
      account.destroy(function(err) {

        // Look up the directory
        Directory.findOne(directories.B.id).exec(function(err, dir) {
          assert(!err);
          assert(dir.deleted == true);
          assert(dir.deleteDate);
          done();
        });
      });
    });


    it('should delete child file record', function(done) {
      account.destroy(function(err) {

        // Look up the directory
        File.findOne(files.A.id).exec(function(err, file) {
          assert(!err);
          assert(file.deleted == true);
          assert(file.deleteDate);
          done();
        });
      });
    });

  });


  describe('.lock()', function() {
    var account,
        directories = {},
        files = {};

    before(function(done) {

      // Clean database before tests
      Database.deleteData(['account', 'directory', 'directorypermission', 'file', 'filePermission'],
      function() {

        // Create an account
        Utils.createAccount({}, function(err, accountModel) {
          if(err) return done(err);
          account = accountModel;

          // Create A Workgroup & Permissions
          Utils.createDirectory('dir-a', { OwnerId: account.id }, function(err, dir) {
            if(err) return done(err);
            directories.A = dir;

            // Create a Child Directory
            Utils.createDirectory('dir-b', { DirectoryId: dir.id }, function(err, childDir) {
              if(err) return done(err);
              directories.B = childDir;

              // Create a File & Permissions
              Utils.createFile({ name: 'file-a', dirId: childDir.id }, function(err, fileObj) {
                if(err) return done(err);
                files.A = fileObj;

                done();
              });
            });
          });
        });
      });
    });


    it('should lock the account record', function(done) {
      account.lock(true, function(err) {
        assert(!err);
        assert(account.isLocked == true);
        done();
      });
    });

    it('should unlock the account record', function(done) {
      account.lock(false, function(err) {
        assert(!err);
        assert(account.isLocked == false);
        done();
      });
    });

    it('should lock workgroup record', function(done) {
      account.lock(true, function(err) {

        // Look up the directory
        Directory.findOne(directories.A.id).exec(function(err, dir) {
          assert(!err);
          assert(dir.isLocked == true);
          done();
        });
      });
    });


    it('should lock workgroup child directory record', function(done) {
      account.lock(true, function(err) {

        // Look up the directory
        Directory.findOne(directories.B.id).exec(function(err, dir) {
          assert(!err);
          assert(dir.isLocked == true);
          done();
        });
      });
    });


    it('should lock child file record', function(done) {
      account.lock(true, function(err) {

        // Look up the directory
        File.findOne(files.A.id).exec(function(err, file) {
          assert(!err);
          assert(file.isLocked == true);
          done();
        });
      });
    });

  });

});
