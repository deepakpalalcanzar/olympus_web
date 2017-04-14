var fileService = require('../services/lib/file/util');

/*---------------------
:: File
-> model
---------------------*/
module.exports = {

    attributes: {

        name: 'string',
        size: {
          type: 'text',
          defaultsTo: '0'
        },
        fsName: 'text',
        md5checksum: 'text',

        deleted: {
            type: 'boolean',
            defaultsTo: false
        },

        deleteDate: 'datetime',

        isLocked: {
            type: 'boolean',
            defaultsTo: false
        },

        mimetype: 'string',

        public_link_enabled: {
            type: 'boolean',
            defaultsTo: true
        },

        link_password_enabled: {
          type: 'boolean',
          defaultsTo: false
        },

        link_password: 'string',

        replaceFileId: 'integer',

        isOnDrive: {//google drive
            type: 'boolean',
            defaultsTo: false
        },

        isOnDropbox: {//dropbox
            type: 'boolean',
            defaultsTo: false
        },

        isOnBox: {//dropbox
            type: 'boolean',
            defaultsTo: false
        },
        DirectoryId: 'integer',
        thumbnail: 'integer',
        uploadPathId: 'integer',//Stores Superadmin paths IDs(Disk,S3,Ormuco Details) as well as User Defined Paths IDs(Drive, Dropbox, Box.net etc.)
        viewLink: 'string',
        downloadLink: 'string',
        iconLink: 'string',

/****************************************************
* Instance Methods
****************************************************/

        share: function (type, accountId, orphan, cb) {
            var self = this;
            var orphan = orphan || false;

            // list of possible share types, in ascending orders
            var types = ['revoke', 'comment', 'read', 'write', 'admin'];

            if (types.indexOf(type) === -1) {
                if (cb) return cb(new Error('invalid type'));
                else throw new Error('invalid type');
            }

            if (type === 'revoke') {

                return FilePermission.destroy({
                    AccountId: accountId,
                    FileId: self.id
                }).then().nodeify(cb);

            } else {

                return FilePermission.findOne({
                    AccountId: accountId,
                    FileId: self.id
                }).then(function (perm) {

                    // if the permission doesn't exist we need to create it
                    if (!perm) {
                
                        return FilePermission.create({
                            type: type,
                            orphan: orphan,
                            AccountId: accountId,
                            FileId: self.id
                        }).then(function (perm) {
                            return perm;
                        })

                    // if the permission is lower, we need to upgrade it
                    } else if (perm && types.indexOf(perm.type) < types.indexOf(type)) {

                        return FilePermission.update({
                            AccountId: accountId,
                            FileId: self.id
                        }, {
                            type: type
                        }).then(function (perm) {
                            return perm;
                        })
                    }
                    return perm;
                }).nodeify(cb);
            }
        },

    /**
    * Copies a File and Permissions from one directory to another
    *
    * @param {Integer} Directory Id to move to
    * @param {Function} callback
    */

        copy: function (dirId, name, cb) {

            var self = this;
            function uniq(name) {
                return File.findOne({
                    name: name,
                    DirectoryId: dirId,
                    deleted: false
                }).then(function (f) {
                    if (f) return uniq(name + ' copy');
                    return name;
                });
            }

            fileService.uniqueName(name, dirId, function (err, name) {

                if (err) {return cb(err);}
                // Build a new file based off the original
                var clone = self.toObject();
                clone.name = name;

                // Remove the id, keeping the timestamps for now. Should these reset?
                delete clone.id;

                // Set new parent directory
                clone.DirectoryId = dirId;

                // Create a new file from the clone
                return File.create(clone).then(function (file) {

                    // s3 clone TODO
                    // updates change fname, so technically should work until we start deleting files

                    // Find the original files' permissions
                    return DirectoryPermission.find({
                        DirectoryId: dirId
                    }).then(function (filePerms) {

                        if (filePerms.length === 0) {
                            return cb(new Error('No File Permissions for File with Id ' + self.id));
                        }

                    // copy all directory permissions asyncronously, return when done
                    return filePerms.map(function (perm) {
                        perm = perm.toObject();
                        delete perm.id;
                        delete perm.DirectoryId;
                        perm.FileId = file.id;

                        return FilePermission.create(perm).then();
                    })

                    }).all().then(function () {
                        Directory.workgroup(dirId, function(err, workgroup) {
                            if (err) {return cb(err);}
                            console.log("RECALC WORKGROUP");
                            workgroup.recalculateSize(function(err) {
                                if (err) {return cb(err);}
                                cb(null, file);
                            }, true);
                        });            
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
                if (err) return next(err);
                cb();
            });
        },
    }
};