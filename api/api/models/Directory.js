/*---------------------
  :: Directory
  -> model
---------------------*/

var copyUtils = require('../services/lib/directory/copy'),
  async = require('async');

// TODO: move this to somewhere else
function uniqueNameAccount(name, ownerId, cb) {

    Directory.findOne({
        name: name,
        OwnerId: ownerId,
		deleted: false
    }).exec(function (err, dir) {
        if (dir) return uniqueNameAccount(name + ' copy', ownerId, cb);
        return cb(null, name);
    });
}

module.exports = {

  attributes: {

    name: 'string',
    size: {
      type: 'text',
      defaultsTo: '0'
    },

    quota: {
      type: 'text',

      // Default is 1GB
      defaultsTo: '100000000000'
    },

    public_link_enabled: {
      type: 'boolean',
      defaultsTo: true
    },

    public_sublinks_enabled: {
      type: 'boolean',
      defaultsTo: true //sails.config.publicLinksEnabledByDefault
    },

    isWorkgroup: {
      type: 'boolean',
      defaultsTo: false
    },

    isLocked: {
      type: 'boolean',
      defaultsTo: false
    },

    deleted: {
      type: 'boolean',
      defaultsTo: false
    },

    deleteDate: 'datetime',

    // If a directory has no parent it is a workgroup
    DirectoryId: 'integer',

    // Optional association to a particular account who created this workgroup and is financially responsible
    // (must be a workgroup, i.e. !DirectoryId)
    OwnerId: 'integer',

    isDriveDir: {//google drive
        type: 'boolean',
        defaultsTo: false
    },
    isOlympusDriveDir: {//is this the 'GOOGLE DRIVE' directory of olympus
        type: 'boolean',
        defaultsTo: false
    },
    isDropboxDir: {//Dropbox
        type: 'boolean',
        defaultsTo: false
    },
    isOlympusDropboxDir: {//is this the 'DROPBOX' directory of olympus
        type: 'boolean',
        defaultsTo: false
    },

    isBoxDir: {//Dropbox
        type: 'boolean',
        defaultsTo: false
    },
    isOlympusBoxDir: {//is this the 'DROPBOX' directory of olympus
        type: 'boolean',
        defaultsTo: false
    },
    driveFsName: 'text',
    uploadPathId: 'integer',//Paths IDs(Drive, Dropbox, Box.net etc.)


    /****************************************************
     * Instance Methods
     ****************************************************/

    share: function (type, accountId, orphan, cb) {

        var self = this;
        orphan   = orphan || false;

        if ( ! _.isFinite(accountId) ) {
            var msg = 'Invalid accountId specified';
            sails.log.error(msg  +' :: ', accountId);
            return cb && cb(msg);
        }

        sails.log.verbose('Directory.share() :: ', type, 'with account :: ', accountId);

        function recurseShare(type, accountId) {
            // get child dirs
            return Directory.find({
                DirectoryId: self.id
            }).then(function (dirs) {
                return dirs.map(function (dir) {
                // revoke access on child
                        return dir.share(type, accountId).then(function(perm){
                            return perm;
                        });
                });

                // .all() waites for the previous promise array to be fullfilled
            }).all().then(function () {
                // get all child files
                return File.find({ DirectoryId: self.id });
            }).all().then(function (files) {
                return files.map(function (file) {
                // revoke their access
                    return file.share(type, accountId).then(function(perm){
                        return perm;
                    });
                });
            });
        }

        // list of possible share types, in ascending orders
        var types = ['read', 'comment', 'write', 'admin', 'revoke'];
        if (types.indexOf(type) === -1) {

            var msg = 'Invalid type passed to Directory.share().';
            sails.log.error(msg);
            if (cb) {
                return cb(new Error(msg));
            }
                else throw new Error (msg);
            }

            if (type === 'revoke') {

                // revoke access
                return DirectoryPermission.destroy({
                    AccountId: accountId,
                    DirectoryId: self.id
                }).then(function destroyedPermission() {
                    return recurseShare(type, accountId);
                }).nodeify(cb);

            } else {

                sails.log.verbose('Finding dir permission with \naccountId :: ', accountId, 'and directoryId ::',self.id);
                return DirectoryPermission.findOne({
                    AccountId: accountId,
                    DirectoryId: self.id
                }).then(function foundDirectoryPermission (perm) {
                    // if the directorypermission doesn't exist, we need to create it
                    if (!perm) {
                        sails.log.verbose('The permission doesn\'t exist, so we\'ll create it.');
                        return DirectoryPermission.create({
                            type: type,
                            orphan: orphan,
                            AccountId: accountId,
                            DirectoryId: self.id
                        }).then(function createdDirectoryPermission (perm) {
                            return recurseShare(type, accountId);
                        });
                    }

                    // if the permission is lower, we need to upgrade it
                    if (perm && types.indexOf(perm.type) < types.indexOf(type)) {
                        sails.log.verbose('The directory permission was lower, so we try to upgrade it.');
                        return DirectoryPermission.update({
                            AccountId: accountId,
                            DirectoryId: self.id
                        }, {
                            type: type
                        }).then(function permissionUpdated (perm) {
                            return perm;
                        });
                    }
                    sails.log.verbose('Directory permission found :: ', perm);
                    return perm;
                }).fail(function errorFindingPermission(err) {
                    sails.log.error(err);
                    throw err;
                }).nodeify(cb);
            }
        },


    /**
     * Copies a directory and it's children into the targetId
     *
     * @param {Function} callback
     */

    copy: function (targetId, cb) {
        
        var self = this;
      /**
       * Ensure we are not trying to copy the directory into itself
       * or any of it's child directories
       */
        copyUtils.recursiveCheck(this.id, targetId, function (err) {
            if (err) return cb(err);
            copyUtils.recursiveCopy(self, targetId, function(err) {
                if (err) {return cb(err);}
                Directory.workgroup(targetId, function(err, workgroup) {
                    if (err) {return cb(err);}
                    workgroup.recalculateSize(cb, true);
                });
            });
        });
    },


    /**
     * Override Destroy instance method to flag as deleted
     *
     * @param {Function} callback
     */

    destroy: function (cb) {

      // Flag as deleted
        this.deleted = true;
        this.deleteDate = new Date();
        this.save(function (err) {
            cb(err);
        });

    },

    recalculateSize: function(cb, force) {

      // If file size is cached, use the cached size.
        if (this.size !== null && !force) {
            return cb(null, this);
        }

        var self = this;
        async.auto({
            // Add up file sizes
            sumFiles: function(cb) {
                sumFiles(self.id, cb);
            },

            // Get subdirs
            dirs: function(cb) {
                Directory.find({
                    DirectoryId: self.id,
                    deleted: null
                }).exec(cb);
            },

        // Get subdir sizes
            sumDirs: ['dirs', function(cb, results) {
                var size = 0;
                async.reduce(results.dirs, 0, function(size, dir, cb) {
                    dir.recalculateSize(function(err, dir) {
                        if (err) {return cb(err);}
                        return cb(null, size + dir.size);
                    }, force);
                }, cb);
            }]

        }, function(err, results) {
            if (err) {return cb(err);}
            // Total size is files + dirs
            var size = results.sumFiles + results.sumDirs;
            // If the size has changed, save it and alert subscribers
            if (self.size != size) {
                // Change the model's size
                self.size = size;
                // Workaround for sequelizing skipping attributes with zero value
                if (self.size == 0) {self.size = '0';}
                // Save the new model size and send a message to subscribers to update the size
                Directory.update({id: self.id}, {size: self.size}).exec(cb);
            } 
            // If the size hasn't changed, just continue
            else {
                return cb(null, self);
            }       
        });

        function sumFiles(dirId, cb) {
            File.find({
                where: {
                    DirectoryId: dirId,
                    deleted: null
                }
            }).exec(function(err, files) {
                if (err) return cb(err);
                return cb(null, _.reduce(files, function(memo, file) {return memo + file.size;}, 0));
            })
        }
    }
},

  // Get a dir's workgroup
workgroup: function(id, cb) {

    if(id === null || (typeof id == 'undefined') ) {
        cb(null);
        return;
    }

    Directory.findOne(id).exec(function(err, model) {
        if (err) {return cb(err);}
        
        if(model === null) {
            return cb(null);
        } else if((typeof model == 'undefined') || (model.DirectoryId === null)) {
            return cb(null, model);
        } else {
    
            var workgroup = null;
            async.until(
            function() {
                return workgroup !== null;
            }, function(callback) {
                
                Directory.findOne(model.DirectoryId).exec(function(err, parentModel) {
                    if (err) {return callback(err);}
                    if(parentModel.DirectoryId === null) {
                        workgroup = parentModel;
                    } else {
                        model = parentModel;
                    }
                    callback();
                });

            }, function(err) {
                if (err) {return cb(err);}
                cb(null, workgroup);
            });
        }
    });
},

checkQuota: function(id, size, cb) {
    Directory.workgroup(id, function(workgroup) {
        if(workgroup.quota === null) {
            return cb();
        }
        if(workgroup.quota >= (workgroup.size + size)) {
            sails.log.debug('Quota check clear.');
            cb();
        } else {
            var message = 'Quota exceeded: Current size='+workgroup.size+' Quota='+workgroup.quota+' Attempting to upload='+size+'';
            sails.log.info(message);
            cb(message);
        }
    });
},
  
  /**
   * Creates a workgroup (a folder with no parent directory, but has an owner id)
   */
  createWorkgroup: function (options, accountId, isOwner, cb) {
    
    console.log('Create workgroup');
    console.log(options);
    
    var name = options.name;

    async.auto({

      // Make a unique name for the directory
      metadata: function (cb) {
        uniqueNameAccount(name, accountId, cb);
      },

      // create a new directory
      newDirectory: ['metadata', function (cb, results) {
        var name = results.metadata;
        Directory.create({
          name: name,
          isWorkgroup: true,
          OwnerId: isOwner ? accountId : undefined,
          quota: options.quota || undefined
        }).done(cb);
      }],

      newPermissions: ['newDirectory', function (cb, results) {
        var directory = results.newDirectory;
        DirectoryPermission.create({
          type: 'admin',
          AccountId: accountId,
          DirectoryId: directory.id
        }).done(cb);
      }]

    }, cb);
  },

  
  



};
