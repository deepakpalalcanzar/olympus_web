File = Model.extend({
    tableName: 'file',
    name: STRING,
    size: INTEGER,
    fsName: TEXT,
    deleted: BOOLEAN,
    mimetype: STRING,
    public_link_enabled: BOOLEAN,
    deleteDate: DATE,
    replaceFileId: INTEGER,
    thumbnail: INTEGER,
    // Save the name and identifying info of the adapter used for the upload
    // adapterName: STRING,
    // adapterId: STRING,

    hasMany: ['FilePermission', 'Comment'],
    belongsTo: ['Directory'],
    classMethods: {
        asForeignKey: 'FileId',
        /**
         * Handle a file upload
         *
         * reqEvents- 
         *   onAbort
         * file- path, size, name, type
         * parentId - id of parent dir
         * replaceId - (optional) the id of the file that will be replaced.
         * accountId - who uploaded the file
         */
        upload: function (options, cb) {

            // define cleanup behavior for onAbort event
            var uploadedFile, uploadBufferComplete = false;

            // This logic is triggered when `req` fires the `end` event
            // (i.e. client finishes THEIR part OR they abort)
            if (options.reqEvents) {
                options.reqEvents.onAbort = function cleanupFile() {
                    try {
                        !uploadBufferComplete && uploadedFile.destroy().done(function (err) {
                            if (err)
                                sails.log.error(err);
                        });
                    }
                    catch (e) {
                        sails.log.error(e);
                    }
                };
            }

            async.auto({
                // Read temp file
                readFile: [function (cb, r) {
                        fs.readFile(options.file.path, function (err, file) {
                            // If no size is specifed, determine it by looking at the file
                            console.log(file);
                            cb(err, file);
                        });
                    }],
                checkQuota: ['readFile', function (cb, r) {
                        if (typeof options.file.size === 'undefined') {
                            throw new Error('No size specified!');
                        }
                        Directory.checkQuota(options.parentId, options.file.size, cb);
                    }],
                // Make sure the name is unique, or make it so, and get pathname info
                metadata: ['checkQuota', function (cb) {
                        UniqueNameService.unique(File, options.file.name, options.parentId, cb, options.replaceId);
                    }],
                // Write file with fileAdapter
                writeFile: ['readFile', 'metadata', 'checkQuota', function (cb, r) {
                        // Read /tmp file
                        fs.readFile(options.file.path, function (err, data) {
                            if (err)
                                return cb(err);

                            // Upload file to storage container
                            // _.shout("payload",data.toString());
                            FileAdapter.upload({
                                payload: data,
                                name: r.metadata.fsName,
                                contentLength: options.file.size
                            }, function (err, data) {

                                // TODO: delete the tmp file

                                cb(err, data);
                            });
                        });
                    }],
                // Save File to database
                // TODO: move `writeFile` dependency to the other places that depend on it
                // (we can save the metadata as soon as possible-- dont need to wait until the upload actually finishes)
                fileModel: ['metadata', function (cb, r) {
                        sails.log.debug('saving file to db');

                        // TODO: Save the name and identifying info of the adapter
                        // (necessary to invalidate files which were uploaded to another transport and hide them)
                        // Save file to database
                        File.create({
                            name: r.metadata.fileName,
                            size: options.file.size,
                            fsName: r.metadata.fsName,
                            mimetype: options.file.type,
                            replaceFileId: options.replaceId || null,
                            public_link_enabled: sails.config.publicLinksEnabledByDefault
                        }).done(function (err, result) {
                            if (err)
                                return cb(err);
                            // Keep track of this as our uploaded file
                            // so we can cleanup if necessary (i.e. upload doesn't finish)
                            uploadedFile = result;
                            cb(err, result);
                        });

                    }],
                // Move file into the specified parent directory, inheriting permissions
                inheritPermissions: ['fileModel', function (cb, r) {
                        // console.log("INHERIT CALLED");
                        r.fileModel.mv(options.parentId, function (err, result) {
                            console.log("FINISHED MV", "error?", err);
                            cb(err, result);
                        });
                    }],
                // Update the parent directory sizes.
                updateParentDirectorySizes: ['fileModel', function (cb, r) {
                        sails.log.debug('updating parent directories');
                        Directory.updateParentDirectorySizes(options.parentId, options.file.size, function (err) {
                            if (err)
                                return cb(err);
                            cb();
                        });
                    }],
                // If this is a replace op, emove the existing File model
                destroyExistingFile: ['fileModel', function destroyExistingFile(cb, r) {
                        if (!options.replaceId)
                            return cb();
                        else {
                            INodeService.destroy({
                                id: options.replaceId || options.parentId,
                                model: File
                            }, cb);
                        }
                    }],
                // Combine the different pieces into a single object
                coallesced: ['inheritPermissions', function (cb, result) {
                        console.log("INHERIT permissions");
                        console.log(result);
                        console.log("INHERIT PERMISSIONS 2");

                        var parentDirRoomName = Directory.roomName(options.parentId);
                        var apiResponse = APIService.File.mini(result.fileModel);
                        apiResponse.parent.id = options.parentId;
                        SocketService.broadcast('ITEM_CREATE', parentDirRoomName, apiResponse);
                        cb(null, apiResponse);
                    }],
            }, function (err, results) {
                if (err)
                    return cb(err);
                else if (!results)
                    return cb("No results!");

                // File upload was successful
                uploadBufferComplete = true;

                return cb(err, results.coallesced);
            });
        },
        handleUpload: function (options, cb) {

            async.auto({
                // Make sure the name is unique, or make it so, and get pathname info
                uniqueName: function (cb) {
                    UniqueNameService.unique(File, options.name, options.parentId, cb, options.replaceId);
                },
                // Save File to database
                // TODO: move `writeFile` dependency to the other places that depend on it
                // (we can save the metadata as soon as possible-- dont need to wait until the upload actually finishes)
                fileModel: ['uniqueName', function (cb, r) {

                        sails.log.debug('saving file to db');

// TODO: Save the name and identifying info of the adapter
// (necessary to invalidate files which were uploaded to another transport and hide them)
// Save file to database
                        File.create({
                            name: r.uniqueName.fileName,
                            size: options.size,
                            fsName: options.fsName,
                            mimetype: options.type,
                            replaceFileId: options.replaceId || null,
                            public_link_enabled: sails.config.publicLinksEnabledByDefault,
                            thumbnail: "1",

                         
                         

                        }).done(function (err, result) {

                            if (err)
                                return cb(err);

                            // Keep track of this as our uploaded file
                            // so we can cleanup if necessary (i.e. upload doesn't finish)
                            Version.createVersion({
                                fileId: result.id,
                                version: options.version,
                                oldFile: options.oldFile === 0 ? result.id : options.oldFile,
                                account_id: options.account_id, // AF
                            }, function (err, resultSet) {
                                if (err)
                                    return res.send(err, 500);
                            });
                            uploadedFile = result;
                            cb(err, result);

                        });
                    }],
                // Move file into the specified parent directory, inheriting permissions
                inheritPermissions: ['fileModel', function (cb, r) {
                        // console.log("INHERIT CALLED");
                        r.fileModel.mv(options.parentId, function (err, result) {
                            console.log("FINISHED MV", "error?", err);
                            cb(err, result);
                        });
                    }],
                // Update the parent directory sizes.
                updateParentDirectorySizes: ['fileModel', function (cb, r) {
                        sails.log.debug('updating parent directories');
                        Directory.updateParentDirectorySizes(options.parentId, options.size, function (err) {
                            if (err)
                                return cb(err);
                            cb();
                        });
                    }],
                // If this is a replace op, emove the existing File model
                destroyExistingFile: ['fileModel', function destroyExistingFile(cb, r) {
                        if (!options.replaceId)
                            return cb();
                        else {
                            INodeService.destroy({
                                id: options.replaceId || options.parentId,
                                model: File
                            }, cb);
                        }
                    }],
                // Combine the different pieces into a single object
                coallesced: ['inheritPermissions', function (cb, result) {
                        var parentDirRoomName = Directory.roomName(options.parentId);
                        var apiResponse = APIService.File.mini(result.fileModel);
                        apiResponse.parent.id = options.parentId;
                        SocketService.broadcast('ITEM_CREATE', parentDirRoomName, apiResponse);
                        cb(null, apiResponse);
                    }],
            }, function (err, results) {
                if (err)
                    return cb(err);
                else if (!results)
                    return cb("No results!");

                // File upload was successful
                uploadBufferComplete = true;

                return cb(err, results.coallesced);
            });
        },
        /**
         * Return files which match the specified criteria
         */
        findWhere: function (criteria) {
            return function (cb) {
                File.findAll({
                    where: criteria
                }).done(cb);
            };
        },
        /**
         * Return the directories viewable by the logged-in user who belong to the specified parent
         */
        whoseParentIs: function (options, callback) {

            options = _.defaults(options, {
                attributes: {}
            });

            // Get files that are children of the specified parent
            // which you have permission to see
            var basicSet = ["SELECT p.type AS permission, f.id AS pk, f.* " +
                        "FROM file f " +
                        "INNER JOIN filepermission p ON p.FileId=f.id " +
                        "INNER JOIN account a ON a.id=p.AccountId " +
                        "WHERE f.id IN (select max(FileId) from version v group by v.parent_id) " +
                        "AND (p.type='read' OR p.type='comment' OR p.type='write' OR p.type='admin') " +
                        (options.parentId ? "AND f.DirectoryId=? " : "AND f.DirectoryId IS NULL ") +
                        (options.accountId ? "AND a.id=? " : "AND a.id IS NULL") +
                        ""];

            options.parentId && basicSet.push(options.parentId);
            options.accountId && basicSet.push(options.accountId);
            basicSet = Sequelize.Utils.format(basicSet);

            // Return the number of comments
            
            var num_comments = "SELECT COUNT(comment.id) AS num_comments, Parent.pk FROM " +
                    "(" + basicSet + ") Parent " +
                    "LEFT OUTER JOIN comment ON Parent.pk=comment.FileId " +
                    "GROUP BY Parent.id";

            var sql =
                    "SELECT * FROM (" + basicSet + ") basic " +
                    "INNER JOIN (" + num_comments + ") nc ON nc.pk=basic.id ";

            sequelize.query(sql, File).success(_.unprefix(callback)).error(function (err) {
                throw new Error(err);
            });
        },
        // Get the room name for model update subscription
        roomName: function (id) {
            return 'file' + id;
        },
        // Get the room name for membership
        activeRoomName: function (id) {
            return 'file' + id + '_active';
        },
        join: function (req, id) {
            req.socket.join(File.activeRoomName(id));
        },
        leave: function (req, id) {
            req.socket.leave(File.activeRoomName(id));
        },
        // Get # of active participants in this model
        getNumActiveUsers: function (id) {
            return io.sockets.clients(File.activeRoomName(id)).length;
        },
        // Get active participants in this model
        getActiveUsers: function (id, callback) {
            return io.sockets.clients(File.activeRoomName(id));
        },
        // Subscribe to updates from this file
        subscribe: function (req, id) {
            if (req.isSocket) {
                req.socket.join(File.roomName(id));
            }
        },
        // Unsubscribe to updates from this file
        unsubscribe: function (req, id) {
            if (req.isSocket) {
                req.socket.leave(File.roomName(id));
            }
        }

    },
    instanceMethods: {
        // Subscribe to updates from this file
        subscribe: function (req) {
            File.subscribe(req, this.id);
        },
        // Unsubscribe to updates from this file
        unsubscribe: function (req) {
            File.unsubscribe(req, this.id);
        },
        /**
         * Return this directory's parent folder for the public API
         * TODO: also get parent name (requires join)
         */
        getParent: function () {
            return (this.DirectoryId) ? {
                type: 'folder',
                id: this.DirectoryId,
                name: null				// TODO
            } : Directory.getRoot();
        },
        getNumActiveUsers: function () {
            return File.getNumActiveUsers(this.id);
        },
        // Return the number of comments for this node
        getNumComments: function (cb, results) {
            this.getComments().success(function (comments) {
                cb(null, comments.length);
            });
        },
        /**
         * "Remove" this file record (mark as deleted and remove from parent dir)
         * TODO: Destroy binary data in object store
         * Cascade delete all permissions
         */
        rm: function (callback) {

            var my = this;

            var parentId = my.DirectoryId;
            my.updateAttributes({
                deleted: true,
                deleteDate: new Date(),
                directoryId: null
            }).complete(function (e, rs) {

                Directory.updateParentDirectorySizes(parentId, function () {
                });

// TODO: remove binary data in object store
// Cascade delete all permissions

                FilePermission.findAll({
                    where: {FileId: my.id}
                }).complete(function (e, r) {

                    // Destroy all of the models using the query chainer
                    var chainer = new Sequelize.Utils.QueryChainer();
                    _.each(r, function (m) {
                        chainer.add(m.destroy());
                    });
                    chainer.run().complete(callback);
                });

                sequelize.query('SELECT * FROM version where FileId =' + my.id + ' OR parent_id =' + my.id, Account)
                        .success(function (version) {
                            // Each record will now be mapped to the project's DAO-Factory.
                            version.forEach(function (listVersions) {
                                console.log(listVersions);
                            });
                        });
            });
        },
        /**
         * Rename this file to newName
         */
        rename: function (newName, callback) {
            this.updateAttributes({
                name: newName
            }).complete(callback);
        },
        /**
         * Copy this file and move the copy into targetDir
         * (inherit any new permissions from the directory)
         */
        cp: function (targetDir, callback) {
            File.create({
                name: this.name
            }).success(function (file) {
                file.mv(targetDir, callback);
            });
        },
        /**
         * Move this file into targetDir
         * (inherit any new permissions from the directory)
         */
        mv: function (targetDirId, callback) {

            var file = this;
            var sourceDirId = file.DirectoryId;

            async.auto({
                checkQuota: function (cb) {
                    Directory.checkQuota(targetDirId, file.size, cb);
                },
                // Move this file into targetDir
                move: ['checkQuota', function (cb, results) {
                        file.updateAttributes({
                            directoryId: targetDirId
                        }).done(cb);
                    }],
                sourceWorkgroup: function (cb) {
                    Directory.workgroup(sourceDirId, function (workgroup) {
                        return cb(null, workgroup);
                    });
                },
                targetWorkgroup: function (cb) {
                    Directory.workgroup(targetDirId, function (workgroup) {
                        return cb(null, workgroup);
                    });
                },
                updateParentDirectorySizes: ['move', 'sourceWorkgroup', 'targetWorkgroup', function (cb, results) {
                        sails.log.debug('moving the file over ' + file.id + ' ' + sourceDirId + ' ' + targetDirId);
                        if (sourceDirId == targetDirId || sourceDirId === null) {
                            sails.log.debug('same file forget about it');
                            return cb();
                        }
                        sails.log.debug('bout to update them parent dirs, you heard.');
                        async.parallel([
                            function (cb) {
                                return results.sourceWorkgroup ? results.sourceWorkgroup.recalculateSize(cb, true) : cb()
                            },
                            function (cb) {
                                return results.targetWorkgroup ? results.targetWorkgroup.recalculateSize(cb, true) : cb();
                            }
                        ], cb);
                    }],
                // Get permissions associated w/ targetDir
                dirPermissions: function (cb, results) {
                    DirectoryPermission.findAll({
                        where: {
                            DirectoryId: targetDirId
                        }
                    }).done(cb);
                },
                stripFilePermissions: function (cb, results) {
                    // Delete the files and their permissions
                    FilePermission.findAll({
                        where: {
                            FileId: file.id
                        }
                    }).done(function (err, perms) {
                        if (err)
                            return cb(err);

                        // Delete all the file permissions
                        async.forEach(perms, function (p, cb) {
                            p.destroy().done(cb);
                        }, cb);
                    });
                },
                // Assign dir permissions to file
                inheritPermissions: ['dirPermissions', 'stripFilePermissions', function (cb, results) {
                        // TODO: with transaction
                        async.forEach(results.dirPermissions, function (v, itemCb) {
                            FilePermission.findOrCreate({
                                type: v.type,
                                accountId: v.AccountId,
                                fileId: file.id
                            }, ['type', 'AccountId', 'FileId'], function () {
                                console.log("FIND OR CREATE COMPLETE!!!!!!");
                                itemCb();
                            });
                        }, cb);
                    }]

            }, function (err, results) {
                callback(err, results && results.move);
            });
        },
        /**
         * Permit account to perform action on this file
         */
        permit: function (action, accountId, orphan, callback) {
            // If action is null, delete the permission
            if (action === null) {
                FilePermission.find({where: {AccountId: accountId, FileId: this.id}}).success(function (p) {
                    if (p) {
                        p.destroy();
                    }
                    callback();
                });
            } else {
                FilePermission.findOrCreate({
                    type: action,
                    accountId: accountId,
                    fileId: this.id,
                    orphan: orphan
                }, ['type', 'AccountId', 'FileId'], callback);
            }
        },
        /**
         * Permit account read access to this file
         */
        permitRead: function (account, callback) {
            return this.permit('read', account, callback);
        },
        // Get the room name for model update subscription
        roomName: function () {
            return File.roomName(this.id);
        },
        // Get the room name for membership
        activeRoomName: function () {
            return File.activeRoomName(this.id);
        }

    }
});
