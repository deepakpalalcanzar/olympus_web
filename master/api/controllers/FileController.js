var path = require('path');
var mime = require('mime');
var anchor = require('anchor');
var request = require('request');
var FileController = {
    // Check if a file exists
    stat: function (req, res) {
        // Given path, look up inode
        // (note: first check and see if the Box API has an analogue and implement that if possible)
        var path = req.param('path');
        PathService.lookupFile(path, function (err, file) {
            if (err)
                return res.send(err, 500);
            else
                res.json(APIService.File(file));
        });
    },
    // Return information about the file in question
    read: function (req, res) {
        File.find(req.param('id')).done(function (err, file) {
            if (err)
                return res.send(err, 500);
            else {
                file.subscribe(req, req.param('id'));
                res.json(file.values);
            }
        });
    },
    // Direct, Box.net-style file upload
    content: function (req, res) {

        var file, filename;
        if (!req.param('parent_id'))
            return res.send('No parent directory specified!', 500);
        else if (!req.files) {
            return res.send('No files uploaded!', 500);
        }
        else {
            filename = _.keys(req.files)[0];
            file = req.files[filename];
        }

        sails.log.info('Upload new file into ' + req.param('parent_id') + ' [User:' + req.session.Account.id + ']');
        // Perform upload
        File.upload({
            file: {
                path: file.path,
                size: file.size,
                name: filename,
                type: file.type
            },
            parentId: req.param('parent_id'),
            replaceId: null,
            accountId: req.session.Account.id
        }, function (err, file) {
            if (err)
                return res.send(err, 500);
            else
                res.json(APIService.File(file));
        });
    },
    /**
     * Download a file
     */
    'public': function (req, res) {
        // Get the file record from the db based on the UDID in the request
        File.find({where: {fsName: req.param('fsName')}}).success(function (model) {
            // If there's no such file, return a 404
            if (model === null) {
                res.send(404);
            }
            // If the file's public link is disabled, send a 403
            else if (!model.public_link_enabled) {
                res.send(403);
            }
            // Find the file's workgroup
            else {
                Directory.workgroup(model.DirectoryId, function (workgroup) {
                    // If the workgroup doesn't allow public links, send a 403
                    if (workgroup !== null && !workgroup.public_sublinks_enabled) {
                        res.send(403);
                        return;
                    }
                    // Otherwise stream the file
                    else {
                        return FileController._download(req, res, model.id);
                    }
                });
            }
        });
    },
    retrieve: function (req, res) {
        // Find the download link using the specified key, and verify that it's still valid
        async.auto({
            getLink: function (cb, results) {
                FileDownloadLink.find({where: {link_key: req.param('key')}}).done(function (err, model) {
                    if (err) {
                        cb(err);
                    } else if (model === null) {
                        cb({
                            type: "error",
                            status: 404,
                            code: "Not found",
                            message: "The download link is invalid."
                        });
                    } else {
                        var now = new Date();
                        if (model.key_expires < now) {
                            cb({
                                type: "error",
                                status: 403,
                                code: "Link expired",
                                message: "The download link is expired."
                            });
                        } else {
                            cb(null, model);
                        }
                    }
                });
            },
            // Verify that the link references a valid API access token
            verifyAccessToken: ['getLink', function (cb, results) {
                    var link = results.getLink;
                    AccountDeveloper.find({where: {access_token: link.access_token}}).done(function (err, model) {
                        var now = new Date();
                        if (err) {
                            cb(err);
                        } else if (model === null || model.access_expires < now) {
                            cb({
                                type: "error",
                                status: 403,
                                code: "Not found",
                                message: "The access token is invalid."
                            });
                        } else {
                            cb(null);
                        }
                    });
                }],
            // Get the file in question
            getFile: ['getLink', function (cb, results) {
                    File.find(results.getLink.file_id).done(function (err, model) {
                        if (model === null || err) {
                            cb({
                                type: "error",
                                status: 500,
                                code: "Error",
                                message: "The file could not be retrieved."
                            });
                        } else {
                            cb(null, model);
                        }
                    });
                }]
        },
        function (err, results) {
            if (err) {
                res.json(err, err.status);
            } else {
                FileController._download(req, res, results.getFile.id);
            }
        });
    },
    open: function (req, res) {
        return FileController._download(req, res, req.param('id'), true);
    },
    download: function (req, res) {
        // PathService.lookupFile(req, res, function (err, file) {
        // if (err) return res.send(err, 500);
        return FileController._download(req, res, req.param('id'), false);
        // });
    },
    dispatchAPI: function (req, res) {

        if (!_.isUndefined(req.param('id'))) {




            switch (req.method) {


                case 'GET':

                    return FileController.info(req, res);

                case 'PUT':

                    File.find(req.param('id')).success(function (model) {

                        if (model) {
                            var options = {
                                uri: 'http://localhost:1337/logging/register/',
                                method: 'POST',
                            };

                            // If the "open" param isn't set, force the file to download
                            if (!req.url.match(/^\/file\/open\//)) {
                                res.setHeader('Content-disposition', 'attachment; filename=\"' + model.name + '\"');


                                options.json = {
                                    user_id: req.session.Account.id,
                                    text_message: 'has renamed ' + model.name,
                                    activity: 'rename',
                                    on_user: model.id,
                                    ip: req.session.Account.ip,
                                    platform: req.headers.user_platform,
                                };

                                console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& RENAME   &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
                                console.log(req.headers);
                                console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& RENAME  &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');


                                request(options, function (err, response, body) {
                                    if (err)
                                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                                });
                            }
                        }
                    });

                    return sails.policies.can('write')(req, res, function () {
                        FileController.update(req, res);
                    });

                case 'DELETE':

                    File.find(req.param('id')).success(function (model) {

                        if (model) {
                            var options = {
                                uri: 'http://localhost:1337/logging/register/',
                                method: 'POST',
                            };

                            // If the "open" param isn't set, force the file to download
                            if (!req.url.match(/^\/file\/open\//)) {
                                res.setHeader('Content-disposition', 'attachment; filename=\"' + model.name + '\"');


                                options.json = {
                                    user_id: req.session.Account.id,
                                    text_message: 'has deleted ' + model.name,
                                    activity: 'deleted',
                                    on_user: model.id,
                                    ip: req.session.Account.ip,
                                    platform: req.headers.user_platform,
                                };

                                request(options, function (err, response, body) {
                                    if (err)
                                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                                });
                            }
                        }
                    });


                    return sails.policies.can('admin')(req, res, function () {
                        FileController['delete'](req, res)
                    });

                default:
                    return res.send(404);
            }
        }
    },
    info: function (req, res) {
        File.find(req.param('id')).success(function (model) {
            res.json(APIService.File.mini(model));
        });
    },
    apiDownload: function (req, res) {


        var today = new Date();
        File.find(req.param('id')).success(function (model) {
            console.log(model);
            if (model) {



                var options = {
                    uri: 'http://localhost:1337/logging/register/',
                    method: 'POST',
                };

                // If the "open" param isn't set, force the file to download
                if (!req.url.match(/^\/file\/open\//)) {
                    res.setHeader('Content-disposition', 'attachment; filename=\"' + model.name + '\"');

                    var user_platform;
                    if (req.headers.user_platform) {
                        user_platform = req.headers.user_platform;
                    } else {
                        if (req.headers['user-agent']) {
                            user_platform = req.headers['user-agent'];
                        } else {
                            user_platform = "Web Application";
                        }
                    }
                    if(user_platform=="Apache-HttpClient/UNAVAILABLE (java 1.4)"){
                        user_platform= "Android - Phone"
                    }

                    options.json = {
                        user_id: req.session.Account.id,
                        text_message: 'has downloaded ' + model.name,
                        activity: 'download',
                        on_user: model.id,
                        ip: req.session.Account.ip,
                        platform: user_platform,
                    };

                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& file Downloaded &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
                    console.log(user_platform);
                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& file Downloaded &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');


                    request(options, function (err, response, body) {
                        //if (err)
                        //return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    });
                }



                // Create a new temporary download link
                FileDownloadLink.create({
                    file_id: model.id,
                    link_key: AuthenticationService.randString(20),
                    key_expires: new Date(today.getTime() + 1000 * 60 * 10), // key expires in 10 minutes
                    access_token: req.headers['authorization'].split(' ')[1]
                }).done(function (err, result) {

                    if (err) {
                        res.send(err);
                    } else {

                        // Create a 302 redirect with the file download link in the header.  Also
                        // send the URL in the text of the response, in case the client doesn't want
                        // to immediately follow the redirect.
                        var protocol = req.connection.encrypted ? 'https://' : 'http://';
                        res.header('Location', protocol + req.host + "/r/" + result.link_key);
                        res.send(protocol + req.host + "/r/" + result.link_key, 302);

                    }
                });
            } else {
                res.json({
                    type: "error",
                    status: 404,
                    code: "Not found",
                    message: "No file with that ID could be found."
                }, 404);
            }
        });
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
                File.find(req.param('id')).success(function (model) {
                    res.json(APIService.File.mini(model));
                });
            }
        });
    },
    comments: INodeService.comments,
    _download: function (req, res, id, open) {

        // Make sure the user has access to the file
        File.find(id).success(function (fileModel) {

            // If we have a file model to work with...
            if (fileModel) {


//                var options = {
//                    uri: 'http://localhost:1337/logging/register/',
//                    method: 'POST',
//                };


                // If the "open" param isn't set, force the file to download
//                if (!req.url.match(/^\/file\/open\//)) {

                if (!req.param('open') && !open) {
                    res.setHeader('Content-disposition', 'attachment; filename=\"' + fileModel.name + '\"');


//                    options.json = {
//                        user_id: req.session.Account.id,
//                        text_message: 'has downloaded ' + fileModel.name,
//                        activity: 'download',
//                        on_user: fileModel.id,
//                        ip: req.session.Account.ip,
//                        platform: req.headers['user-agent'],
//                    };

//                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
//                    console.log(req);
//                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');


//                    request(options, function (err, response, body) {
//                        if (err)
//                            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
//                    });
                }

                // set content-type header
                if (sails.config.fileAdapter.adapter == 'disk') {
                    //Download and serve file from local Disk
                    var file = '/var/www/html/olympus/api/files/' + fileModel.fsName;
                    res.setHeader('Content-disposition', 'attachment; filename=' + fileModel.name);
                    res.setHeader('Content-Type', fileModel.mimetype);
                    var filestream = fs.createReadStream(file);
                    return filestream.pipe(res);

                } else {

                    // Download and serve file from s3 and swift
                    FileAdapter.download({
                        name: fileModel.fsName
                    }, function (err, data, contentLength, stream) {

                        if (err)
                            return res.send(500, err);
                        // Set content-length header
                        res.setHeader('Content-Length', fileModel.size);
                        // set content-type header
                        res.setHeader('Content-Type', mime.lookup(fileModel.name));

                        // No data available
                        if (!data && !stream) {
                            return res.send(404);
                        } else if (!data) { // Stream file (Swift)
                            return stream.pipe(res);
                        }
                        else
                            return res.send(data); // Or dump data (S3)
                        // If the "open" param isn't set, force the file to download
                        if (!req.param('open') && !open)
                            res.setHeader('Content-disposition', 'attachment; filename=\"' + fileModel.name + '\"');

                        // set content-type header
                        headers['Content-Type'] = mime.lookup(fileModel.name);
                        // Set content- length and range headers
                        headers['Content-Length'] = size; // - (range[1] - range[0]);
                        headers['Accept-Ranges'] = '0-' + size;

                        // No data available
                        if (!data && !stream)
                            return res.send(404, headers);

                        // Go ahead and respond with a 500 ISE on error getting the file model
                        if (err)
                            return res.send(err, 500);

                        // Do we have data or a stream?
                        if (!data) {
                            // Get a buffer of the entire stream object. This simplifies http
                            // range functionality and makes header management more manageable.
                            data = stream.read(size);
                            data = data.toString('utf', range[0] || 0, range[1] || size);
                        }

                        // Get path to file
                        var file = sails.config.appPath + '/public/files/' + fileModel.fsName;
                        if (req.headers['http-range'] !== undefined) {
                            // Check if we've got a valid content range (or none at all, too)
                            if (req.headers['http-range'].indexOf(',') < 0) {
                                // Set our content range based upon the requested range
                                headers['Content-Range'] = 'bytes ' + range[0] + '-' + range[1] + '/' + size;
                                // dump data to the client
                                return res.send(data, 206, headers);
                            } else {
                                // And tell the client we had an error with the range
                                return res.send(416, headers);
                            }
                        } else {
                            return res.send(data);
                        }
                    });
                }

            } else {
                res.json({
                    success: false,
                    error: 'File could not be found.',
                    message: 'File could not be found.'
                });
            }
        });
    },
    /** Rename an iNode */
    rename: INodeService.rename,
    /** Move an iNode */
    mv: INodeService.move,
    /**
     * Return the set of users who are currently viewing the stream
     * -params-
     *    id  -> the target Directory's unique identifier
     */
    swarm: INodeService.swarm,
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
     * Return the comments
     */
    activity: INodeService.activity,
    version: INodeService.version,
    /**
     * Add and remove new comments on this node
     */
    addComment: INodeService.addComment,
    removeComment: INodeService.removeComment,
    /*
     * Delete an iNode
     */
    'delete': INodeService["delete"],
    subscribe: function (req, res) {
        var id = req.param('id');
        File.find(id).success(function (model) {
            model.subscribe(req);
            res.json({
                success: true
            });
        });
    },
    // Copy a file
    copy: function (req, res) {
        var destFileName = 'Copy of';
        // Search for directory using id parameter
        File.find(req.param('id')).done(function (err, srcFile) {
            // Throw an error if there is an error finding the directory
            if (err)
                return res.json({error: err});
            if (req.param('name'))
                destFileName = req.param('name');
            else
                destFileName += srcFile.name;
            File.create({name: destFileName}).done(function (err, destFile) {
                srcFile.cp(destFile, function (err, dir) {
                    if (err)
                        return res.json({error: err});
                    else
                        return res.json(destFile);
                });
            });
        });
    },
    getVersionComment: function (req, res) {
        var sql = "SELECT c.id,c.payload,c.CreatedAt AS comm_date,a.name FROM comment c INNER JOIN account a " +
                "ON c.AccountId=a.id WHERE c.FileId=?";
        sql = Sequelize.Utils.format([sql, req.params.id]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (comments) {
            res.json(comments, 200);
        });
    },
    numVersionComment: function (req, res) {
        var sql = "SELECT COUNT(id) AS num_ver_comment FROM comment WHERE FileId=?";
        sql = Sequelize.Utils.format([sql, req.params.id]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (comments) {
            res.json(comments, 200);
        });
    },
    createComment: function (req, res) {

        var request = require('request');
        var options = {
            uri: 'http://localhost:1337/file/postComment/',
            method: 'POST',
        };

        var access_token = req.param('account_id');
        options.json = {
            file_id: req.param('file_id'),
            comment: req.param('comment'),
            account_id: req.param('account_id'),
        };

        request(options, function (err, response, body) {
            if (err)
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
            //  Resend using the original response statusCode
            //  Use the json parsing above as a simple check we got back good stuff
            res.json(body, response && response.statusCode);
        });

    },
    enablePublicLink: INodeService.enablePublicLink

};
_.extend(exports, FileController);

