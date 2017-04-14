/**
 * Test Instance/Class Methods on a File Model
 */

var assert = require('assert'),
  async = require('async'),
  Utils = require('../../support/utils'),
  Database = require('../../support/database');

describe('Directory', function () {

  describe('.createWorkgroup()', function() {
    it('creates a workgroup and sets the owner id', function(done){
      Directory.createWorkgroup({ name: 'test workgroup name' }, 1, true, function(err, res){
        assert(res.newDirectory.name === 'test workgroup name');
        assert(res.newDirectory.OwnerId === 1);
        assert(res.newPermissions.AccountId === 1);
        done();
      });
    });
  });

  describe('.copy()', function () {

    /**
     * Copy a Single Directory over to another directory and check the permissions
     * get updated accordingly
     */

    describe('single level directory', function () {
      var directories = {};

      before(function (done) {

        // Wipe the data
        Database.deleteData(['directory', 'directorypermission', 'file', 'filePermission'], function () {

          // Create A Source Directory & Permissions
          Utils.createDirectory('dir-a', {}, function (err, dirA) {
            if (err) return done(err);
            directories.A = dirA;

            // Create a Target Directory & Permissions
            Utils.createDirectory('dir-b', {}, function (err, dirB) {
              if (err) return done(err);
              directories.B = dirB;

              // Create a directory inside of dir-b to test name gets updated correctly
              Utils.createDirectory('dir-a', {
                DirectoryId: dirB.id
              }, function (err, dir) {
                if (err) return done(err);

                Utils.createDirectoryPermissions(dir.id, {}, function (err, dirPerm) {
                  if (err) return done(err);
                  done();
                });
              });
            });
          });

        });
      });


      it('should copy a directory and give it a new name', function (done) {

        directories.A.copy(directories.B.id, function (err, dirCopy) {
          assert(!err);
          assert(dirCopy.name === 'dir-a copy');
          done();
        });
      });


      it('should copy the target directory permissions onto the copied directory', function (done) {

        // Update the Directory permissions to check
        DirectoryPermission.update({
          DirectoryId: directories.B.id
        }, {
          type: 'read'
        }).exec(

        function (err, perms) {

          directories.A.copy(directories.B.id, function (err, dirCopy) {

            // Find the directory's permissions and check it has type `read`
            DirectoryPermission.find({
              DirectoryId: dirCopy.id
            }).exec(function (err, dirPerms) {
              assert(!err);
              assert(dirPerms[0].type === 'read');
              assert(dirPerms.length === 1);
              done();
            });
          });

        });
      });
    });


    /**
     * Copy a complex directory containing multiple children directories and files
     * into a new directory that has multiple permissions.
     *
     * This should more resemble a real world use case.
     */

    describe('multi-level copy', function () {
      var directories = {},
      files = {},
      copies = {};


      before(function (done) {
        Database.deleteData(['directory', 'directorypermission', 'file', 'filePermission'], function () {

          async.auto({

            // Create Directory-A With OwnerID 1
            createDirA: function (next) {
              Utils.createDirectory('dir-a', {
                OwnerId: 1,
                AccountId: 1
              }, function (err, dir) {
                if (err) return next(err);
                directories.A = dir;
                next();
              });
            },

            // Create Directory-B With OwnerID 2
            createDirB: function (next) {
              Utils.createDirectory('dir-b', {
                OwnerId: 2,
                type: 'admin',
                AccountId: 2
              },

              function (err, dir) {
                if (err) return next(err);
                directories.B = dir;
                next();
              });
            },

            // Create Permissions For 2 Accounts On Directory B
            createPerms1: ['createDirB', function (next) {
              Utils.createDirectoryPermissions(directories.B.id, {
                AccountId: 1,
                type: 'edit'
              }, next);
            }],

            createPerms2: ['createDirB', function (next) {
              Utils.createDirectoryPermissions(directories.B.id, {
                AccountId: 3,
                type: 'read'
              }, next);
            }],

            // Create Directory-C
            createDirC: ['createDirA', function (next) {
              Utils.createDirectory('dir-c', {
                DirectoryId: directories.A.id,
                AccountId: 1
              },

              function (err, dir) {
                if (err) return next(err);
                directories.C = dir;
                next();
              });
            }],

            // Create Directory-D Inside of Directory-C
            createDirD: ['createDirC', function (next) {
              Utils.createDirectory('dir-d', {
                DirectoryId: directories.C.id,
                AccountId: 1
              },

              function (err, dir) {
                if (err) return next(err);
                directories.D = dir;
                next();
              });
            }],

            // Create File-A Inside of Directory-C
            createFileA: ['createDirC', function (next) {
              Utils.createFile({
                name: 'file-a',
                dirId: directories.C.id
              }, function (err, file) {
                if (err) return next(err);
                files.A = file;
                next();
              });
            }]

          }, function (err) {
            if (err) return done(err);
            done();
          });

        });
      });


      it('should copy Directory-C and it\'s children into Directory-B', function (done) {

        // Run Copy on the Directory
        directories.C.copy(directories.B.id, function (err, copiedDir) {
          assert(!err);

          // Cache the copy for later tests
          copies.C = copiedDir;

          // Check Directory-D was copied over to the new parent
          Directory.findOne({
            DirectoryId: copiedDir.id
          }).exec(function (err, dirD) {
            assert(dirD);

            // Cache the copy for later tests
            copies.D = dirD;

            // Check File-A was copied over to the new parent
            File.findOne({
              DirectoryId: copiedDir.id
            }).exec(function (err, fileA) {
              assert(fileA);
              assert(fileA.DirectoryId === copiedDir.id);

              // Cache copied file for later tests
              copies.FileA = fileA;

              done();
            });
          });
        });
      });


      it('should correctly set permissions on all of the copied directories children',

      function (done) {

        // Check New Directory-C has proper permissions for Account-1, Account-2 and Account-3
        DirectoryPermission.find({
          DirectoryId: copies.C.id
        }).exec(function (err, dirCPerms) {

          dirCPerms.forEach(function (perm) {
            if (perm.AccountId === 1) assert(perm.type === 'edit');
            if (perm.AccountId === 2) assert(perm.type === 'admin');
            if (perm.AccountId === 3) assert(perm.type === 'read');
          });

          // Check New Directory-D has proper permissions for Accounts
          DirectoryPermission.find({
            DirectoryId: copies.D.id
          }).exec(function (err, dirDPerms) {

            dirDPerms.forEach(function (perm) {
              if (perm.AccountId === 1) assert(perm.type === 'edit');
              if (perm.AccountId === 2) assert(perm.type === 'admin');
              if (perm.AccountId === 3) assert(perm.type === 'read');
            });

            // Check new File-A has proper permissions for Accounts
            FilePermission.find({
              FileId: copies.FileA.id
            }).exec(function (err, fileAPerms) {

              fileAPerms.forEach(function (perm) {
                if (perm.AccountId === 1) assert(perm.type === 'edit');
                if (perm.AccountId === 2) assert(perm.type === 'admin');
                if (perm.AccountId === 3) assert(perm.type === 'read');
              });

              done();
            });
          });
        });
      });


      it('should not allow a directory to be copied into itself', function (done) {
        directories.C.copy(directories.C.id, function (err, copiedDir) {
          assert(err);
          done();
        });
      });


      it('should not allow a directory to be copied into a child directory', function (done) {
        directories.C.copy(directories.D.id, function (err, copiedDir) {
          assert(err);
          done();
        });
      });
    });

  });

  describe('.share(type, account)', function () {
    var directories = {},
    files = {},
    copies = {};
    before(function (done) {
      Database.deleteData(['directory', 'directorypermission', 'file', 'filePermission'], function () {

        async.auto({

          // Create Directory-A With OwnerID 1
          createDirA: function (next) {
            Utils.createDirectory('dir-a', {
              OwnerId: 1,
              AccountId: 1
            }, function (err, dir) {
              if (err) return next(err);
              directories.A = dir;
              next();
            });
          },

          // Create Directory-B inside Directory-A
          createDirB: ['createDirA', function (next) {
            Utils.createDirectory('dir-b', {
              DirectoryId: directories.A.id,
              AccountId: 1
            },

            function (err, dir) {
              if (err) return next(err);
              directories.B = dir;
              next();
            });
          }],

          // Create File-A Inside of Directory-B
          createFileA: ['createDirB', function (next) {
            Utils.createFile({
              name: 'file-a',
              dirId: directories.B.id
            }, function (err, file) {
              if (err) return next(err);
              files.A = file;
              next();
            });
          }]

        }, function (err) {
          if (err) return done(err);
          done();
        });

      });
    });


    it('should grant permission to account', function (done) {
      directories.A.share('write', 2).then(function (perm) {
        // check the folder it was applied to
        DirectoryPermission.findOne({
          AccountId: 2,
          DirectoryId: directories.A.id
        }).then(function (perm) {
          assert(perm.type === 'write');

          // check the nested folder
          DirectoryPermission.findOne({
            AccountId: 2,
            DirectoryId: directories.B.id
          }).then(function (perm) {
            assert(perm.type === 'write');

            // check the deep nested file
            FilePermission.findOne({
              AccountId: 2,
              FileId: files.A.id
            }).then(function (perm) {
              assert(perm.type === 'write');
              done();
            });

          });
        }).fail(done);
      });
    });

    it('should upgrade previous permissions on account', function (done) {
      directories.A.share('admin', 2).then(function () {
        DirectoryPermission.findOne({
          AccountId: 2,
          DirectoryId: directories.A.id
        }).then(function (perm) {
          assert(perm.type === 'admin');
          done();
        }).fail(done);
      });
    });

    it('should revoke permissions from account', function (done) {
      directories.A.share('revoke', 2).then(function () {
        DirectoryPermission.findOne({
          AccountId: 2,
          DirectoryId: directories.A.id
        }).then(function (perm) {
          assert(perm == null);
          done();
        }).fail(done);
      });
    });

  });

});
