/**
 * Test Instance/Class Methods on a File Model
 */

var assert = require('assert'),
  Utils = require('../../support/utils'),
  Database = require('../../support/database');

describe('File', function () {

  // Clean database before tests
  before(function (done) {
    Database.deleteData(['directory', 'directorypermission', 'file', 'filePermission'], done);
  });

  describe('.copy()', function () {
    var directory, file;

    before(function (done) {

      // Create A Directory & Permissions
      Utils.createDirectory('dir-a', {}, function (err, dir) {
        if (err) return done(err);
        directory = dir;

        // Create a File & Permissions
        Utils.createFile({
          name: 'file-a',
          dirId: dir.id
        }, function (err, fileObj) {
          if (err) return done(err);
          file = fileObj;

          done();
        });
      });
    });


    it('should copy a file and give it a new name', function (done) {
      file.copy(directory.id, 'file-a', function (err, fileCopy) {
        assert(!err);
        assert(fileCopy.name === 'file-a copy');
        done();
      });
    });


    it('should copy the target directory permissions onto the file', function (done) {

      // Update the Directory permissions to check
      DirectoryPermission.update({
        DirectoryId: directory.id
      }, {
        type: 'read'
      }).exec(

      function (err, perms) {

        file.copy(directory.id, 'file-b', function (err, fileCopy) {
          assert(!err);

          // Find the file's permissions and check it has type `read`
          FilePermission.findOne({
            FileId: fileCopy.id
          }).exec(function (err, filePerms) {
            assert(!err);
            assert(filePerms.type === 'read');
            done();
          });
        });

      });
    });


    it('should copy all permissions on a directory down to the file', function (done) {

      Utils.createDirectory('dir-b', {}, function (err, dir) {
        Utils.createDirectoryPermissions(dir.id, {
          AccountId: 2,
          type: 'read'
        },

        function (err, dirPerms) {
          file.copy(dir.id, 'file-c', function (err, fileCopy) {
            FilePermission.find({
              FileId: fileCopy.id
            }, function (err, filePerms) {
              assert(!err);
              assert(filePerms.length === 2);
              done();
            });
          });
        });
      });
    });
  });

  describe('.share(type, account)', function () {
    var directory, file;

    before(function (done) {

      // Create A Directory & Permissions
      Utils.createDirectory('dir-a', {}, function (err, dir) {
        if (err) return done(err);
        directory = dir;

        // Create a File & Permissions
        Utils.createFile({
          name: 'file-a',
          DirId: dir.id
        }, function (err, fileObj) {
          if (err) return done(err);
          file = fileObj;

          done();
        });
      });
    });


    it('should grant permission to account', function (done) {
      file.share('write', 2).then(function () {
        FilePermission.findOne({
          AccountId: 2,
          FileId: file.id
        }).then(function (perm) {
          assert(perm.type === 'write');
          done();
        }).fail(done);
      });
    });

    it('should upgrade previous permissions on account', function (done) {
      file.share('admin', 2).then(function () {
        FilePermission.findOne({
          AccountId: 2,
          FileId: file.id
        }).then(function (perm) {
          assert(perm.type === 'admin');
          done();
        }).fail(done);
      });
    });

    it('should revoke permissions from account', function (done) {
      file.share('revoke', 2).then(function () {
        FilePermission.findOne({
          AccountId: 2,
          FileId: file.id
        }).then(function (perm) {
          assert(perm == null);
          done();
        }).fail(done);
      });
    });

  });

});