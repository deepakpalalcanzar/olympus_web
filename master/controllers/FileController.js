var fsx = require('fs-extra');
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
                                    ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                                    platform: req.headers.user_platform,
                                };

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
                                    ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
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

	//console.log("sending request sending request sending request sending request sending request sending request");
	//console.log(req.headers['ip']);
	//console.log(req.session.Account.ip);
	//console.log("sending request sending request sending request sending request sending request sending request");

	
        var today = new Date();
        File.find(req.param('id')).success(function (model) {
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
                        ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                        platform: user_platform,
                    };

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

            //Rishabh: START async.auto
        async.auto({
            getAdapter: function(cb) {

                // UploadPaths.find({where:{id:fileModel.uploadPathId}}).done(cb);
                // uploadPaths.findOne({where:{isActive:1}}).done(cb);
                if(fileModel.uploadPathId){
                    UploadPaths.find({where:{id:fileModel.uploadPathId}}).done(cb);
                }else{
                    console.log('NO_ADAPTER_FOUND :: fileModel.uploadPathId : '+fileModel.uploadPathId)
                    cb(null, 'NO_ADAPTER_FOUND');
                }
            },
            uploadFileTask: ['getAdapter', function(cb, up) {
                console.log(up.getAdapter);
                if(typeof up.getAdapter != 'undefined' && up.getAdapter != 'NO_ADAPTER_FOUND' && up.getAdapter){
                    console.log('up.getAdapter.type');
                    console.log(up.getAdapter.type);
                    var current_receiver        = up.getAdapter.type;
                    var current_receiverinfo    = up.getAdapter;

                    // set content-type header
                    if (current_receiver == 'Disk') {
                        //Download and serve file from local Disk
                        var file = sails.config.appPath + '/../api/files/' + fileModel.fsName;
                    fsx.exists( file, function(exists) {//(path.resolve(current_receiverinfo.path||'files', req.param('id')))
                        if(exists){
                        res.setHeader('Content-disposition', 'attachment; filename=' + fileModel.name);

                            // Set content-length header: Rishabh
                            res.setHeader('Content-Length', fileModel.size);

                        res.setHeader('Content-Type', fileModel.mimetype);
                        var filestream = fs.createReadStream(file);

                            //commented to avoid unnecessary caching of files
                            // filestream.pipe(fs.createWriteStream(sails.config.appPath + "/public/demo/"+fileModel.fsName));

                        return filestream.pipe(res);
                        }else{
                            console.log('404');
                            return res.send(404);
                        }
                    });

                    } else if(current_receiver == 'S3'){

                        // console.log(FileAdapter);
                        // Download and serve file from s3 and swift
                        S3APIService.download({
                            name: fileModel.fsName,
                            current_receiverinfo: current_receiverinfo
                        }, function (err, data, contentLength, stream) {

                            if (err){
                                console.log('S3exceptionS3exceptionS3exceptionS3exception');
                                console.log(err.StatusCode);
                                return res.send(err.StatusCode, err);
                            }
                                // return res.send(500, err);
                            // Set content-length header
                            res.setHeader('Content-Length', fileModel.size);
                            // set content-type header
                            res.setHeader('Content-Type', mime.lookup(fileModel.name));

                            // No data available
                            if (!data && !stream) {
                                return res.send(404);
                            } else if (!data) { // Stream file (Swift)

                                //commented to avoid unnecessary caching of files
                                // stream.pipe(fs.createWriteStream(sails.config.appPath + "/public/demo/"+fileModel.fsName));

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
                    }else{

                        // console.log(FileAdapter);
                        // Download and serve file from s3 and swift
                        OrmucoAPIService.download({
                            name: fileModel.fsName,
                        current_receiverinfo: current_receiverinfo,
                        //stream: res
                        }, function (err, data, contentLength, stream) {

                            if (err){
                                console.log('S3exceptionS3exceptionS3exceptionS3exception');
                                console.log(err.StatusCode);
                                return res.send(err.StatusCode, err);
                            }
                                // return res.send(500, err);
                            // Set content-length header
                            res.setHeader('Content-Length', fileModel.size);
                            // set content-type header
                            res.setHeader('Content-Type', mime.lookup(fileModel.name));

                            // No data available
                            if (!data && !stream) {
                                return res.send(404);
                            } else if (!data) { // Stream file (Swift)

                                //commented to avoid unnecessary caching of files
                                // stream.pipe(fs.createWriteStream(sails.config.appPath + "/public/demo/"+fileModel.fsName));

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
                }else{
                    res.send(404);
                }
            }]
        });

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
        var sql = "SELECT c.id,c.payload,c.CreatedAt AS comm_date,a.name,a.avatar_image FROM comment c INNER JOIN account a " +
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
    exportDatabase: function (req, res) {
        console.log('exportingDBexportingDBexportingDBexportingDBexportingDBexportingDB');

        var time = Date.now || function() {
            return +new Date;
        };

        var backup_file_name    = 'OLYMPUS-BACKUP-'+time()+'.sql';
        var backup_file         = sails.config.appPath + '/public/images/profile/'+backup_file_name;
        
        var fsx = require('fs-extra');
        var mysqlDump = require('mysqldump');

        mysqlDump({
            host: sails.config.datasource.host,
            user: sails.config.datasource.username,
            password: sails.config.datasource.password,
            database: sails.config.datasource.database,
            // tables:['players'], // only these tables 
            // where: {'players': 'id < 1000'}, // Only test players with id < 1000 
            // ifNotExist:true,
            dest: backup_file // destination file
        },function(err){
            console.log('Database Exported ||||||||||||||||||||||||||||||||||||||||||||');

            fsx.exists(path.resolve(backup_file), function(exists) {
                if(exists){
                    // var filename = path.basename(backup_file);
                    // console.log(filename);

                    // var mimetype = mime.lookup(backup_file);
                    // console.log(mimetype);
                    
                    res.setHeader('Content-disposition', 'attachment; filename='+backup_file_name);
                    res.setHeader('Content-type', 'application/x-sql');
                    
                    var filestream = fs.createReadStream(backup_file);
                    filestream.pipe(res);
                }else{
                    res.send(404);
                }
            });
        });
    },
    testDatabaseExportDetails: function (req, res) {

        var fsx = require('fs-extra');
        console.log('.................testing connection.................');
        var request = require('request');

        var time = Date.now || function() {
            return +new Date;
        };
        // req.param('file_id')

        var localFilePath       = sails.config.appPath + '/public/images/export_db/';
        var localFileName       = 'olympus_test_connection';

        var remoteFilePath      = req.param('export_db_path');//'/var/www/html/';
        var remoteFileName      = 'olympus-'+time();

        fs.mkdir(localFilePath, 0777, function(err) {
            if (err) {
                if (err.code != 'EEXIST'){// ignore the error if the folder already exists
                    console.log('Some error occurred: '+err);
                    return res.json({ error: err}, 200);
                }
            }

            var stats = fs.statSync(localFilePath+''+localFileName);
            var uploadfileSize = stats["size"]; //(In Bytes)

            console.log('uploadfileSizeInBytes', remoteFileName, uploadfileSize);

            var client_upload       = require('scp2');
            var client_download     = require('scp2');
            // console.log(req.params.filepath);

            if(req.params.filepath && req.params.filepath.length && req.params.name){
                console.log('UPDATING DB BACKUP CONFIG ['+req.params.name+']');
                binaryData = req.params.filepath;
                // var base64Data = binaryData.replace(/^data:image\/(png|gif|jpeg);base64,/, "");
                var base64Data = binaryData.replace(/^data:application\/(x-x509-ca-cert);base64,/, "");
                // base64Data += base64Data.replace('+', ' ');
                binaryData = new Buffer(base64Data, 'base64').toString('binary');

                fsx.writeFile(localFilePath +''+ req.params.name, binaryData, 'binary', function (err) {
                    var client_options = {
                        host        : req.param('export_db_host'),//'162.243.205.148',
                        username    : req.param('export_db_user'),//'rishabh',
                        password    : req.param('export_db_pass'),//'alcanzar@321',
                        path        : req.param('export_db_path')+''+remoteFileName,//remoteFilePath+''+remoteFileName//remote path+name of file- File Name can be different from local(i.e. backup_file)
                        port        : req.param('export_db_port') || 22,
                        privateKey  : require('fs').readFileSync(localFilePath+''+req.params.name)
                    };

                    client_upload.scp( localFilePath+''+localFileName, client_options, function(err) {

                        console.log('testDatabaseExportDetailsErrtestDatabaseExportDetailsErr', err);
                        if (err)
                            return res.json({error: err, type: 'error'});

                        if(err == null){

                            //Verify if file was uploaded by downloading it again
                            client_download.scp( client_options, localFilePath, function(err) {

                                if (err)
                                    return res.json({error: err, type: 'error'});
                                console.log('sql backup downloaded', err);

                                var stats = fs.statSync(localFilePath+''+remoteFileName);
                                var downloadfileSize = stats["size"]; //(In Bytes)

                                console.log('downloadfileSizeInBytes', remoteFileName, downloadfileSize);

                                if(downloadfileSize == uploadfileSize){
                                    return res.json({ status: 'ok'}, 200);
                                }else{
                                    return res.json({error: 'Some error occurred', type: 'error'});
                                }
                            });
                        }else{
                            console.log('some error occured');
                        }
                    });                
                });
            }else{
                console.log('UPDATING DB BACKUP CONFIG.');
                var client_options = {
                    host        : req.param('export_db_host'),//'162.243.205.148',
                    username    : req.param('export_db_user'),//'rishabh',
                    password    : req.param('export_db_pass'),//'alcanzar@321',
                    path        : req.param('export_db_path')+''+remoteFileName,//remoteFilePath+''+remoteFileName//remote path+name of file- File Name can be different from local(i.e. backup_file)
                    port        : req.param('export_db_port') || 22
                };

                client_upload.scp( localFilePath+''+localFileName, client_options, function(err) {

                    console.log('testDatabaseExportDetailsErrtestDatabaseExportDetailsErr', err);
                    if (err)
                        return res.json({error: err, type: 'error'});

                    if(err == null){

                        //Verify if file was uploaded by downloading it again
                        client_download.scp( client_options, localFilePath, function(err) {

                            if (err)
                                return res.json({error: err, type: 'error'});
                            console.log('sql backup downloaded', err);

                            var stats = fs.statSync(localFilePath+''+remoteFileName);
                            var downloadfileSize = stats["size"]; //(In Bytes)

                            console.log('downloadfileSizeInBytes', remoteFileName, downloadfileSize);

                            if(downloadfileSize == uploadfileSize){
                                return res.json({ status: 'ok'}, 200);
                            }else{
                                return res.json({error: 'Some error occurred', type: 'error'});
                            }
                        });
                    }else{
                        console.log('some error occured');
                    }
                });
            }
        });
    },
    saveDatabaseExportDetails: function (req, res) {

        console.log('.................saving export DB settings.................');

        var fsx = require('fs-extra');
        var localFilePath       = sails.config.appPath + '/public/images/export_db/';

        var request = require('request');
        /*Create logging*/
        var opts = {
            uri: 'http://localhost:1337/account/dbExportCron/',
            method: 'POST',
        };

        opts.json = {
            formaction   : req.param('formaction'),
            exportdbdays : req.param('export_db_days')
        };

console.log('33333333333333333333333333333333333');
        // console.log(opts);

        request(opts, function (err, response, body) {

            if (err){
                console.log(err);
                return res.json({success: false, error: err});
                // return res.json({error: err.message, type: 'error'}, response && response.statusCode);
            }

            SiteOptions.find({where:{id:1}}).done(function (err, otheropt) {

                if (err)
                    res.json({success: false, error: err});





                if(req.params.filepath && req.params.filepath.length && req.params.name){
                    console.log('UPDATING DB BACKUP CONFIG ['+req.params.name+']');
                    binaryData = req.params.filepath;
                    // var base64Data = binaryData.replace(/^data:image\/(png|gif|jpeg);base64,/, "");
                    var base64Data = binaryData.replace(/^data:application\/(x-x509-ca-cert);base64,/, "");
                    // base64Data += base64Data.replace('+', ' ');
                    binaryData = new Buffer(base64Data, 'base64').toString('binary');

                    fsx.writeFile(localFilePath +''+ req.params.name, binaryData, 'binary', function (err) {
                        
                    });
                }


                if(otheropt){

                    if(req.param('formaction') == 'disable_db_export'){
                        otheropt.exportDbActive                 = false;
                    }else{
                        // console.log(adapter);
                        console.log('Export DB settings being updated.');
                        //Set it as Active
                        // otheropt.allowSignupfromMobile          = msignup_setting;
                        otheropt.exportDbActive                 = true;
                        otheropt.exportDbHost                   = req.param('export_db_host');
                        otheropt.exportDbUser                   = req.param('export_db_user');
                        otheropt.exportDbPass                   = req.param('export_db_pass');
                        otheropt.exportDbPath                   = req.param('export_db_path');
                        otheropt.exportDbPort                   = req.param('export_db_port') || 22;
                        otheropt.backupInterval                 = req.param('export_db_days');
                        otheropt.privateKey                     = req.param('name');
                    }

                    otheropt.save().done(function(err) {

                        if (err) return res.json({ error: err}, 200);
                        return res.json({ status: 'ok'}, 200);
                    });
                            
                }else{
                    console.log('Export DB settings being configured for the first time.');

                    SiteOptions.create({

                        // allowSignupfromMobile          : msignup_setting,
                        exportDbActive                  : true,
                        exportDbHost                    : req.param('export_db_host'),
                        exportDbUser                    : req.param('export_db_user'),
                        exportDbPass                    : req.param('export_db_pass'),
                        exportDbPath                    : req.param('export_db_path'),
                        exportDbPort                    : req.param('export_db_port') || 22,
                        backupInterval                  : req.param('export_db_days'),
                        privateKey                      : req.param('name')

                    }).done(function addedSettings (err, otheropt) {

                        if (err) return res.json({ error: err}, 200);
                        return res.json({ status: 'ok'}, 200);
                    });
                }
            });

            // res.json(body, response && response.statusCode);
            // console.log(response);
        });
    },
    importDatabase: function (req, res) {

        console.log('.................importing database.................');
        console.log('uploading database.................');
        var fsx = require('fs-extra');
        var localFilePath       = sails.config.appPath + '/public/images/import_db/';

        var request = require('request');
        /*Create logging*/

        if(req.params.filepath && req.params.filepath.length && req.params.name){
            console.log('UPDATING DB BACKUP CONFIG ['+req.params.name+']');
            binaryData = req.params.filepath;
            // console.log(binaryData);
            // var base64Data = binaryData.replace(/^data:image\/(png|gif|jpeg);base64,/, "");
            var base64Data = binaryData.replace(/^data:application\/(sql);base64,/, "");
            // base64Data += base64Data.replace('+', ' ');
            binaryData = new Buffer(base64Data, 'base64').toString('binary');

            fs.mkdir(localFilePath, 0777, function(err) {
                if (err) {
                    if (err.code != 'EEXIST'){// ignore the error if the folder already exists
                        console.log('Some error occurred: '+err);
                        return res.json({ error: err}, 200);
                    }
                }

                fsx.writeFile(localFilePath +''+ req.params.name, binaryData, 'binary', function (err) {

                    if(err){
                        console.log('Some error occurred: '+err);
                        return res.json({ error: err}, 200);
                    }

                    var time = Date.now || function() {
                        return +new Date;
                    };

                    console.log('Database Uploaded');
                    // console.log(sails.config);
                    var execsql = require('execsql'),
                    dbConfig = {
                        host: sails.config.datasource.host,
                        user: sails.config.datasource.username,
                        password: sails.config.datasource.password
                    };
                    databaseName        = sails.config.datasource.database;
                    // databbaseTempName   = sails.config.datasource.database+'-'+time();
                    // databbaseBackupName = sails.config.datasource.database+'-MIGRATEBKUP-'+time();
                    dropdbsql       = 'DROP DATABASE '+databaseName+';'
                    createdbsql     = 'CREATE DATABASE IF NOT EXISTS '+databaseName+';',
                    usedbsql        = 'use '+databaseName+';',
                    sqlFile = localFilePath +''+ req.params.name;
                    connectdb = execsql.config(dbConfig);
                    console.log('DB connected.');
                    connectdb.exec(dropdbsql, function(err, createddbres){
                        if(err){
                            console.log('some error occurred: '+err);
                            return res.json({ error: err}, 200);
                        }
                        console.log('Old DATABASE deleted.');
                        connectdb.exec(createdbsql, function(err, createddbres){
                            if(err){
                                console.log('some error occurred: '+err);
                                return res.json({ error: err}, 200);
                            }
                            console.log('NEW DATABASE created.');
                            connectdb.exec(usedbsql, function(err, currentdbres){
                                if(err){
                                    console.log('some error occurred: '+err);
                                    return res.json({ error: err}, 200);
                                }
                                console.log('NEW DATABASE connected.');
                                connectdb.execFile(sqlFile, function(err, results){

                                    console.log('executing sql script.');
                                    if(err){
                                        console.log('some error occurred: '+err);
                                        return res.json({ error: err}, 200);
                                    }
                                    console.log('Script executed successfully.'+results);
                                    console.log(typeof SiteOptions, SiteOptions);
                                    return res.json({ status: 'ok'}, 200);
                                });
                                console.log('=========================== CALLBACK THREE ===========================');
                            });
                            console.log('============================ CALLBACK TWO ============================');
                        });
                        console.log('============================ CALLBACK ONE ============================');
                    });
                    console.log('============================ CALLBACK DROP ============================');
                });
            });
        }
    },
    importDriveToken: function (req, res) {

        console.log('.................importing Drive Token.................');
        // var fsx = require('fs-extra');
        // var localFilePath       = sails.config.appPath + '/public/drive_secret/';

        // var request = require('request');
        /*Create logging*/

        async.auto({
            saveTokenFile: function (cb, results) {
                cb();
                //If a token file is uploaded then uncomment following file
                /*if(req.params.formaction == 'gdrive_enable' && req.params.filepath && req.params.filepath.length && req.params.name){
                    console.log('UPDATING DRIVE TOKEN CONFIG ['+req.params.name+']');
                    binaryData = req.params.filepath;
                    // console.log(binaryData);
                    // var base64Data = binaryData.replace(/^data:image\/(png|gif|jpeg);base64,/, "");
                    var base64Data = binaryData.replace(/^data:application\/(json);base64,/, "");
                    // base64Data += base64Data.replace('+', ' ');
                    binaryData = new Buffer(base64Data, 'base64').toString('binary');

                    fs.mkdir(localFilePath, 0777, function(err) {
                        if (err) {
                            if (err.code != 'EEXIST'){// ignore the error if the folder already exists
                                console.log('Some error occurred: '+err);
                                        // return res.json({ error: err}, 200);
                                        cb();
                            }
                        }

                        fsx.writeFile(localFilePath +''+ req.params.name, binaryData, 'binary', function (err) {

                            if(err){
                                console.log('Some error occurred: '+err);
                                        // return res.json({ error: err}, 200);
                                        cb();
                            }

                            var time = Date.now || function() {
                                return +new Date;
                            };

                            console.log('Token Uploaded');
                                    // return res.json({ status: 'ok'}, 200);
                            // console.log(sails.config);
                            cb();
                        });
                    });
                }else{
                    cb();
                }*/
            },
            // Verify that the link references a valid API access token
            verifyAccessToken: ['saveTokenFile', function (cb, results) {

                console.log('verifyAccessToken Callback');
                SiteOptions.find({where: {id: 1}}).done(function (err, otheropt) {
                    if (err)
                        res.json({success: false, error: err});
                    if(otheropt){
                        if( req.params.formaction == 'gdrive_enable' ){
                            otheropt.gdriveSync           = true;
                            otheropt.gdriveClientId       = req.params.client_id;
                            otheropt.gdriveClientSecret   = req.params.client_secret;
                            otheropt.gdriveRedirectUri    = req.params.redirect_uri;
                        }else{
                            otheropt.gdriveSync = false;
                        }
                        otheropt.save().done(function(){
                            console.log('SiteOptions Updated: gdrive disabled');
                            return res.json({ status: 'ok'}, 200);
                        });
                    }else{//null
                        console.log('Adding new SiteOptions');
                        SiteOptions.create({
                            gdriveSync                  : ( req.params.formaction == 'gdrive_enable' )?true:false,
                            gdriveClientId              : req.params.client_id,
                            gdriveClientSecret          : req.params.client_secret,
                            gdriveRedirectUri           : req.params.redirect_uri
                        }).done(function addedSettings (err, otheropt) {
                            if (err) return res.json({ error: err}, 200);
                            return res.json({ status: 'ok'}, 200);
                        });
                    }
                });
            }]
        });
    },
    saveDropboxDetails: function (req, res) {

        console.log('.................importing Dropbox Details.................');
        // var fsx = require('fs-extra');
        // var localFilePath       = sails.config.appPath + '/public/drive_secret/';

        // var request = require('request');
        /*Create logging*/

        console.log('verifyAccessToken Callback');
        SiteOptions.find({where: {id: 1}}).done(function (err, otheropt) {
            if (err)
                res.json({success: false, error: err});
            if(otheropt){
                if( req.params.formaction == 'dropbox_enable' ){
                    otheropt.dropboxSync           = true;
                    otheropt.dropboxClientId       = req.params.client_id;
                    otheropt.dropboxClientSecret   = req.params.client_secret;
                }else{
                    otheropt.dropboxSync = false;
                }
                otheropt.save().done(function(){
                    console.log('SiteOptions Updated: dropbox_enabled');
                    return res.json({ status: 'ok'}, 200);
                });
            }else{//null
                console.log('Adding new SiteOptions');
                SiteOptions.create({
                    dropboxSync          : ( req.params.formaction == 'dropbox_enable' )?true:false,
                    dropboxClientId      : req.params.client_id,
                    dropboxClientSecret  : req.params.client_secret
                }).done(function addedSettings (err, otheropt) {
                    if (err) return res.json({ error: err}, 200);
                    return res.json({ status: 'ok'}, 200);
                });
            }
        });
    },
    saveBoxDetails: function (req, res) {

        console.log('.................importing Box Details.................');
        // var fsx = require('fs-extra');
        // var localFilePath       = sails.config.appPath + '/public/drive_secret/';

        // var request = require('request');
        /*Create logging*/

        console.log('verifyAccessToken Callback');
        SiteOptions.find({where: {id: 1}}).done(function (err, otheropt) {
            if (err)
                res.json({success: false, error: err});
            if(otheropt){
                if( req.params.formaction == 'box_enable' ){
                    otheropt.boxSync           = true;
                    otheropt.boxClientId       = req.params.client_id;
                    otheropt.boxClientSecret   = req.params.client_secret;
                }else{
                    otheropt.boxSync = false;
                }
                otheropt.save().done(function(){
                    console.log('SiteOptions Updated: box_enabled');
                    return res.json({ status: 'ok'}, 200);
                });
            }else{//null
                console.log('Adding new SiteOptions');
                SiteOptions.create({
                    boxSync          : ( req.params.formaction == 'box_enable' )?true:false,
                    boxClientId      : req.params.client_id,
                    boxClientSecret  : req.params.client_secret
                }).done(function addedSettings (err, otheropt) {
                    if (err) return res.json({ error: err}, 200);
                    return res.json({ status: 'ok'}, 200);
                });
            }
        });
    },
    enablePublicLink: INodeService.enablePublicLink,
    enableLinkPassword: INodeService.enableLinkPassword,
    changeLinkPassword: INodeService.changeLinkPassword

};
_.extend(exports, FileController);

