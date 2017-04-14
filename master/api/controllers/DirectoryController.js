var mime = require('mime');
var policy = sails.policies;

var DirectoryController = {
    // Return information about the directory in question
    read: function (req, res) {
        Directory.find(req.param('id')).done(function (err, directory) {
            if (err)
                res.send(500, err);
            else {
                directory.subscribe(req, req.param('id'));
                res.json(directory.values);
            }
        });
    },
    createlogupload: function (req, res) {
        // Create Loggingggggggggggggg
        var opts = {
            uri: 'http://localhost:1337/logging/register/',
            method: 'POST',
        };

        opts.json = {
            user_id: req.session.Account.id,
            text_message: 'has uploaded ' + req.session.Account.name + '.',
            activity: 'uploaded',
            on_user: req.session.Account.id,
            client_ip: req.params.ip,
            ip: req.session.Account.ip,
            platform: req.headers.user_platform,
        };


        request(opts, function (err1, response1, body1) {
            if (err)
                return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);

            res.send(200);
        });
    },
    /**
     * Fetch a list of the workgroups viewableable by the logged-in user
     * Subscribe to updates from each workgroup
     */
    workgroups: function (req, res) {

        Directory.whoseParentIs({// Get workgroups
            parentId: null,
            accountId: req.session.Account && req.session.Account.id
        }, function (err, dirs) {
            if (err) {
                return afterwards(err);
            }
            async.forEach(dirs, function (dir, cb) {
                dir.recalculateSize(cb);
            }, function (err) {
                afterwards(err, dirs);
            });
        });

        function afterwards(err, results) {

            if (err)
                return res.send(500, err);
            _.each(results, function (v, k) { // Subscribe to workgroups
                v.subscribe(req);
            });
            res.json(APIService.Directory.mini(results)); // Send API response
        }
    },
    dispatchAPI: function (req, res) {

        if (!_.isUndefined(req.param('id'))) {
            switch (req.method) {
                case 'GET':
                    return DirectoryController.info(req, res);

                case 'PUT':
                    return sails.policies.can('write')(req, res, function () {
                        DirectoryController.update(req, res);
                    });

                case 'DELETE':
                    return sails.policies.can('admin')(req, res, function () {
                        DirectoryController['delete'](req, res);
                    });

                default:
                    return res.send(404);
            }
        }

        switch (req.method) {
            case 'GET':
                return res.send(404);

            case 'POST':
                return sails.policies.can('write')(req, res, function () {
                    DirectoryController.mkdir(req, res);
                });

            default:
                return res.send(404);
        }

    },
    update: function (req, res) {

        var tasks = [];
        // If the "name" is set, attempt to rename the dir
        if (req.param('name')) {
            tasks.push(function (cb) {
                INodeService.rename(req, res, cb);
            });
        }

        // If the "parent" is set, attempt a move
        if (req.param('parent') && req.param('parent').id) {
            req.body.directoryId = req.param('parent').id;
            tasks.push(function (cb) {
                INodeService.move(req, res, cb);
            });
        }

        // Try to perform all the changes. If an error occurs at any point,
        // the error message will be sent back.  Otherwise, the updated
        // API object will be sent back.
        async.series(tasks, function (err, results) {
            if (err) {
                res.json(err, err.status);
            } else {
                Directory.find(req.param('id')).success(function (model) {
                    res.json(APIService.Directory.mini(model));
                });
            }
        });
    },
    deletePermission: function (req, res) {

        DirectoryPermission.findAll({
            where: ['AccountId=' + req.params.user_id],
        }).success(function (dirPerm) {
            dirPerm.forEach(function (perm) {
                Directory.find({
                    where: ['OwnerId IS NULL and id =' + perm.DirectoryId],
                }).success(function (useDir) {
                    DirectoryPermission.destroy({
                        where: ['DirectoryId = ' + useDir.id + 'and AccountId = ' + req.params.user_id]
                    }).success(function (desDir) {
                    });
                });
            });
        });

    },
    /**
     * Fetch list of the contents of this directory as JSON
     * -params-
     * id  -> the target Directory's unique identifier
     */
    ls: function (req, res, cb) {
        async.auto({
            files: childrenOf(File),
            // Get this directory's files
            directories: childrenOf(Directory) // Get this directory's directories
        }, afterwards);


        function childrenOf(model) {
            return function (cb, rs) {
                model.whoseParentIs({
                    parentId: req.param('id'),
                    accountId: req.session.Account && req.session.Account.id
                }, cb);
            };
        }

        function afterwards(err, results) {
            if (err)
                return res.send(500, err);
            function subscribe(child) {
                child.subscribe(req);
            }

            // Subscribe to each file and directory
            _.each(results.directories, subscribe);
            _.each(results.files, subscribe);
            var files = APIService.File.mini(results.files);
            var directories = APIService.Directory.mini(results.directories);

            // Combine files and directories in result set and send API response
            var response = directories.concat(files);
            if (cb) {
                cb(response);
            } else {
                res.json(directories.concat(files));
            }
        }
    },
    info: function (req, res) {
        Directory.find(req.param('id')).success(function (model) {
            res.json(APIService.Directory.mini(model));
        });
    },
    items: function (req, res) {

//        console.log('&&&&&&&###################65546456456##############&&&');
//        console.log(req.headers);
//        console.log('&&&&&&&####################65546456456##############&&&');

        DirectoryController.ls(req, res, function (items) {
            var response = {
                "item_collection": {
                    "total_count": items.length,
                    "limit": items.length,
                    "offset": "0",
                    "entries": items
                }
            };
            res.json(response);
        });
    },
    comments: INodeService.comments,
    mkdir: function (req, res) {
        var request = require('request');

        // We want to create a workgroup (a directory at the toplevel). Client does not send an id.
        if (!req.param('parent')) {

            Directory.createWorkgroup({
                name: req.param('name'),
                accountId: req.session.Account.id
            }, function (err, results) {

                if (err)
                    return res.send(500, err);
                var apiResponse = APIService.Directory.mini(results.newDirectory);
                apiResponse.created_by.id = req.session.Account.id;
                // Broadcast activity to this users socket.
                Account.broadcast('ITEM_CREATE', apiResponse, req.session.Account.id);
                _.shout("ITEM_CREATE", apiResponse, req.session.Account.id);
                // (Always return an object instead of a single-item list)
                apiResponse = (_.isArray(apiResponse)) ? apiResponse[0] : apiResponse;

                /*Create logging*/
                var options = {
                    uri: 'http://localhost:1337/logging/register/',
                    method: 'POST',
                };

                options.json = {
                    user_id: req.session.Account.id,
                    text_message: 'has created a ' + results.newDirectory.name + ' directory.',
                    activity: 'create',
                    on_user: req.session.Account.id,
                    ip: req.session.Account.ip,
                    platform: req.headers.user_platform,
                };

                request(options, function (err, response, body) {
                    if (err)
                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    // res.send(200);
                });
                /*Create logging*/

                // Respond with new directory
                res.json(apiResponse);
            });

            // We are creating a folder and not a workgroup.
        } else {

            if (_.isUndefined(req.param('parent').id)) {
                return res.send(500, "'id' property missing from 'parent' parameter object.");
            }

            async.auto({
                // Get the permissions linked with the parent directory
                parentPermissions: function (cb, res) {
                    DirectoryPermission.findAll({
                        where: {DirectoryId: req.param('parent').id}
                    }).done(cb);
                },
                // Make sure the name is unique, or make it so
                metadata: function (cb) {
                    UniqueNameService.unique(Directory, req.param('name'), req.param('parent').id, cb);
                },
                newDirectory: ['metadata', function (cb, r) { // Create the new directory
                        Directory.create({
                            name: r.metadata.fileName,
                            directoryId: req.param('parent').id
                        }).done(cb);
                    }],
                // Cascade parent permissions to new directory
                newPermissions: ['newDirectory', 'parentPermissions', function (cb, res) {
                        var chainer = new Sequelize.Utils.QueryChainer();
                        _.each(res.parentPermissions, function (parentPermission, index) {
                            // The creator always gets admin perms
                            if (parentPermission.AccountId != req.session.Account.id) {
                                chainer.add(DirectoryPermission.create({
                                    type: parentPermission.type,
                                    accountId: parentPermission.AccountId,
                                    directoryId: res.newDirectory.id
                                }));
                            }
                        });
                        chainer.run().done(cb);
                    }],
                ownerPermissions: ['newDirectory', function (cb, res) {
                        DirectoryPermission.create({
                            type: 'admin',
                            accountId: req.session.Account.id,
                            directoryId: res.newDirectory.id
                        }).done(cb);
                    }]

            }, function (err, results) {

                if (err)
                    return res.send(500, err);

                var apiResponse = APIService.Directory.mini(results.newDirectory);
                var parentDirRoomName = Directory.roomName(req.param('parent').id);
                var newDirRoomName = Directory.roomName(results.newDirectory.id);

// Subscribe all of the parent dir's subscribers to updates from the new directory
                _.each(io.sockets.clients(parentDirRoomName), function (socket) {
                    socket.join(newDirRoomName);
                });

// And broadcast activity to all sockets subscribed to the parent
                SocketService.broadcast('ITEM_CREATE', parentDirRoomName, apiResponse);

// (Always return an object instead of a single-item list)
                apiResponse = (_.isArray(apiResponse)) ? apiResponse[0] : apiResponse;

// Assign admin permission ONLY for the user who created the folder
                apiResponse.permission = 'admin';

                /*Create logging*/
                Directory.find(req.param('parent').id).success(function (dirModel) {
                    var options = {
                        uri: 'http://localhost:1337/logging/register/',
                        method: 'POST',
                    };

                    options.json = {
                        user_id: req.session.Account.id,
                        text_message: 'has created a sub directory named ' + results.newDirectory.name + ' inside root ' + dirModel.name + ' directory.',
                        activity: 'create',
                        on_user: req.session.Account.id,
                        ip: req.session.Account.ip,
                        platform: req.headers.user_platform,
                    };

                    console.log('###################  Create User  ###############');
                    console.log(req.headers);
                    console.log('################### Create User ####################');


                    request(options, function (err, response, body) {
                        if (err)
                            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                        // res.send(200);
                    });
                });
// Respond with new directory
                res.json(apiResponse);
            });
        }
    },
// uploads a file to this directory
    upload: function (req, res) {

        // Parse form data from client, if specified
        var parsedFormData;
        if (req.param('data')) {
            parsedFormData = JSON.parse(req.param('data'));
        } else if (req.param('id')) {
            parsedFormData = {parent: {id: req.param('id')}};
        }

        // API parameters
        else if (req.param('parent_id')) {
            parsedFormData = {parent: {id: req.param('parent_id')}};
            req.files.files = [req.files.filedata];
            console.log(req);
        }

        else
            return res.send("No parent directory specified!", 500);
        if (!req.files)
            return res.send("No files uploaded!", 500);
        sails.log.info('Upload:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
        // The HTTP request was aborted, either on purpose or not.
        var reqEvents = {
            onAbort: function defaultBehavior() {
                sails.log.warn('Request was aborted, but the dangling file could not be cleaned up.');
            }
        };

        res.addListener('close', function () {
            reqEvents.onAbort();
        });

        // Iterate through each uploaded file
        var fileId = [];
        async.map(req.files.files, function (file, cb) {
            console.log("\n\n\n\n\n", "Uploading file...", "\n\n\n\n");
            File.upload({
                reqEvents: reqEvents,
                file: file,
                parentId: parsedFormData.parent.id,
                replaceId: req.param('replaceFileId'),
                accountId: req.session.Account.id
            }, cb);
        },
                // And respond
                        function (err, resultSet) {
                            if (err)
                                return res.send(err, 500);
                            var response = {
                                total_count: resultSet.length,
                                entries: resultSet
                            };
                            res.json(response);
                        });

            },
    mv: INodeService.move,
    /*
     * Rename an iNode
     */
    rename: INodeService.rename,
    /**
     * Return the set of users who are currently viewing the stream
     * -params-
     *    id  -> the target Directory's unique identifier
     */
    swarm: INodeService.swarm,
    /**
     * Return the comments
     */
    activity: INodeService.activity,
    /**
     * CRUD permissions attached to this inode
     */
    permissions: INodeService.permissions,
    addPermission: INodeService.addPermission,
    updatePermission: INodeService.updatePermission,
    removePermission: INodeService.removePermission,
    /**
     * Mark self as an active user in this directory
     */
    join: INodeService.join,
    /**
     * Remove self as an active user in this directory
     */
    leave: INodeService.leave,
    /**
     * Add and remove new comments on this node
     */
    addComment: INodeService.addComment,
    removeComment: INodeService.removeComment,
    assignPermission: INodeService.assignPermission,
    /*
     * Delete an iNode
     */
    'delete': INodeService['delete'],
    subscribe: function (req, res) {
        var id = req.param('id');
        Directory.find(id).success(function (model) {
            model.subscribe(req);
            res.json({
                success: true
            });
        });
    },
    enablePublicSublinks: function (req, res) {
// Get the INode
        Directory.find(req.param('id')).success(function (model) {
// Set the public link to enabled / disabled based on the information
// received in the request
            model.public_sublinks_enabled = req.param('enable');
            if (model.AccountId) {
                model.accountId = model.AccountId;
                delete model.AccountId;
            }
            if (model.DirectoryId) {
                model.directoryId = model.DirectoryId;
                delete model.DirectoryId;
            }
            model.save().success(function (model) {
                var subscribers = Directory.roomName(req.param('id'));
// Broadcast a message to everyone watching this INode to update
// accordingly.
                SocketService.broadcast('PUBLIC_SUBLINKS_ENABLE', subscribers, {
                    id: req.param('id'),
                    enable: req.param('enable')
                });
            });
        });
    },
    // Copy a folder
    copy: function (req, res) {
        var destDirName = 'Copy of';
        // Search for directory using id parameter
        Directory.find(req.param('id')).done(function (err, srcDir) {
            // Throw an error if there is an error finding the directory
            if (err)
                return res.json({error: err});

            if (req.param('name'))
                destDirName = req.param('name');
            else
                destDirName += srcDir.name;

            Directory.create({name: destDirName}).done(function (err, destDir) {
                srcDir.cp(destDir, function (err, dir) {
                    if (err)
                        return res.json({error: err});
                    else
                        return res.json(destDir);
                });
            });
        });
    },
    // Return the directory's usage
    quota: function (req, res) {
        if (req.param('id')) {
            Directory.find(req.param('id')).done(function (err, dir) {
                return res.json({
                    usage: dir.size,
                    quota: dir.quota
                });
            })
        } else
            return res.json({error: 'No id provided'});
    },
    // Set the quota for a given directory.
    setQuota: function (req, res) {
        // We have to have an id and quota parameter. If not, throw an error.
        if (!req.param('id') || !req.param('quota'))
            return res.json({error: 'Missing parameter ' + (req.param('id') ? 'id' : 'quota') + '.'});

        Directory.find(req.param('id')).done(function (err, dir) {
            // Specified directory currently must be a workgroup to have a set quota.
            if (!dir.isWorkgroup)
                return res.json({
                    error: 'Specified directory is not a Workgroup.'
                });

            // We can't let the directory size be greater than the quota currently.
            // TODO: Find out how to manage quotas and handle too big of usage to quota values.
            if (dir.size > req.param('quota'))
                return res.json({
                    error: 'Directory quota cannot be smaller than current size of the directory'
                });

            // Update the quota value
            dir.updateAttributes({
                quota: req.param('quota')
            }).done(function (err) {
                return res.json(err ? {error: err} : dir);
            })
        })
    },
    // Lock or Unlock a directory
    setLock: function (req, res) {
        // We have to have an id and lock parameter. If not, throw an error.
        if (!req.param('id') || !req.param('lock'))
            return res.json({error: 'Missing parameter ' + (req.param('id') ? 'id' : 'lock') + '.'});

        // Find the target directory to lock or unlock
        Directory.find(req.param('id')).done(function (err, dir) {
            if (err)
                return res.json({error: err});

            // Find all directory perms for the given directory and (un)lock them.
            DirectoryPermission.findAll({where: {DirectoryId: req.param('id')}}).done(function (err, perms) {
                _.each(perms, function (p) {
                    p.updateAttributes({
                        isLocked: req.param('lock')
                    }).done(function (err) {
                        // Send back an error if we have one
                        if (err)
                            return res.json({error: err});

                        // Go through all related files and update their lock status as well.
                        // TODO: Is this really best? Or should we modify all the alter methods to check status of parent before acting?
                        File.findAll({where: {DirectoryId: dir.id}}).done(function (err, files) {
                            _.each(files, function (f) {
                                FilePermission.findAll({where: {FileId: f.id}}).done(function (err, perms) {
                                    _.each(perms, function (fp) {
                                        fp.updateAttributes({
                                            isLocked: req.param('lock')
                                        }).done(function (err) {
                                            if (err)
                                                return res.json({error: err});

                                            // respond with the directory object.
                                            return res.json(dir);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    },
    // used for autocomplete in the sharing settings for an inode
    fetchWorkgroup: function (req, res) {
        // If this is a private deployment, just send back a 403. We dont want to search for users.
        /*if (sails.config.privateDeployment) {
         return res.send(403);
         }*/

        Directory.findAll({
            where: ['(deleted = 0 OR deleted IS NULL) AND (name LIKE ?)', "%" + req.param('name') + "%"],
            limit: 10
        }).success(function (directory) {
            res.json(directory, 200);
        });

    },
    // used for autocomplete in the sharing settings for an inode
    fetchAssignWorkgroup: function (req, res) {
        // If this is a private deployment, just send back a 403. We dont want to search for users.
        if (sails.config.privateDeployment) {
            return res.send(403);
        }

        if (req.session.Account.isSuperAdmin === 1) {

            Directory.findAll({
                where: ['(deleted = 0 OR deleted IS NULL) AND (name LIKE ?)', "%" + req.param('name') + "%"],
                limit: 10
            }).success(function (directory) {
                res.json(directory, 200);
            });

        } else {

            Directory.findAll({
                where: ['(deleted = 0 OR deleted IS NULL) AND (OwnerId=?) AND (name LIKE ?)', req.session.Account.id, "%" + req.param('name') + "%"],
                limit: 10
            }).success(function (directory) {
                res.json(directory, 200);

            });

        }
    },
    /*
     This function is used by Desktop App 
     Get List of all files and directories of logged in user
     */

    dataSyncing: function (req, res) {
        var options = {accountId: req.session.Account.id};
        var response = [];
        var sql = "SELECT d.* from directory d JOIN directorypermission dp ON d.id = dp.DirectoryId where dp.AccountId =?";
        sql = Sequelize.Utils.format([sql, req.session.Account.id]);

        sequelize.query(sql, null, {
            raw: true
        }).success(function (dirs) {

            response['0'] = dirs;
            var sqlFile = "SELECT f.* from file f JOIN filepermission fp ON f.id = fp.FileId where fp.AccountId =?";
            sqlFile = Sequelize.Utils.format([sqlFile, req.session.Account.id]);
            sequelize.query(sqlFile, null, {
                raw: true
            }).success(function (files) {
                response['1'] = files;
                res.json(response);
            });

        });
    },
};
_.extend(exports, DirectoryController);
