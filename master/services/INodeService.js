// In lieu of true relational inheritance, herein lies shared logic for
// DirectoryController and FileController
var UUIDGenerator = require('node-uuid');
var async = require('async');

exports.rename = function (req, res, cb) {
    var request = require('request');

    sails.log.info('Rename:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
    var inodeId = req.param('id');
    var INodeModel = (req.param('controller') == "directory") ? Directory : File;
    var INodeModelType = (req.param('controller') == "directory") ? 'folders' : 'files';//used in box only
    var subscribers = INodeModel.roomName(inodeId); // And broadcast activity to all sockets subscribed
    // Make sure the user has sufficient permissions for the delete
    var sourcePermissionClass = (req.param('controller') == "directory") ? DirectoryPermission : FilePermission;
    var sourceCriteria = {
        AccountId: req.session.Account.id,
        type: ['admin', 'write']
                // isLocked: false
    };

    if (sourcePermissionClass == DirectoryPermission) {
        sourceCriteria.DirectoryId = inodeId;
    } else {
        sourceCriteria.FileId = inodeId;
    }

    sourcePermissionClass.findAll({
        where: sourceCriteria
    }).success(function (models) {
        if (models.length === 0) {
            res.json({
                status: 'error',
                error: 'PERM_DENIED'
            }, 500);
            return;
        } else {
            // Get the model we're trying to rename
            INodeModel.find(inodeId).success(function (model) {
                // Check for a node with the same type, name and location
                // which is not deleted
                var prvName = model.name;

                INodeModel.find({
                    where: {
                        name: req.param('name'),
                        DirectoryId: model.DirectoryId,
                        deleted: null
                    }
                }).success(function (retrievedFile) {

                    var easyimg = require('easyimage');
                    var fsx     = require('fs-extra');

                    // If there is none, proceed with the rename
                    if (retrievedFile === null || retrievedFile.length == 0) {
                        model.directoryId = model.DirectoryId;
                        model.rename(req.param('name'), function (err, model) {

                            mimetype = model.mimetype;
        
                            if(mimetype != null){
                                
                                var fileType = mimetype.split("/");
                                if(fileType[0] === 'image'){

                                    var imgPath = sails.config.appPath + '/../api/files/'+model.fsName; 
                                    var thumbImgPath = sails.config.appPath + '/public/images/thumbnail/'+req.param('name')
                    
                                    fsx.exists(imgPath , function(exists) { 

                                        console.log(exists);
                                        if(exists){

                                            fsx.exists(thumbImgPath , function(exists) { 
                                                if(exists){
                                                    fsx.unlink(imgPath);
                                                }else{
                                                    easyimg.resize({
                                                        src: sails.config.appPath + "/../api/files/"+model.fsName,
                                                        // dst: sails.config.appPath + '/public/images/thumbnail/'+req.param('name')+"."+fileType[1], width: 150, height: 150
                                                        dst: sails.config.appPath + '/public/images/thumbnail/'+req.param('name'), width: 150, height: 150
                                                    }).then(
                                                    );
                                                }
                                            });
                                        }
                                    });
                                }
                            }

                            if(model.isOnDrive || model.isDriveDir){
                                // fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {
                                //   if (err) {
                                //     console.log('Error loading client secret file: ' + err);
                                //     return;
                                //   }
                                SiteOptions.find({where: {id: 1}}).done(function (err, credentials) {
                                    if (err)
                                        return res.json({error: err, type: 'error'});
                                    if(credentials.gdriveSync){
                                        sails.controllers.directory.authorize('file_open', req.session.Account.id, req.param('refresh_token'), credentials, function (auth, driveUploadPathId) {
                                        var google = require('googleapis');

                                        var drive = google.drive({
                                          version: 'v2',
                                          auth: auth
                                        });

                                        //File->isOnDrive;fsName
                                        //Directory->isDriveDir;driveFsName
                                        var fileId = model.isOnDrive?model.fsName:model.driveFsName;
                                        console.log('Renaming FILE: ', model.name);
                                        var body = {'title': model.name};

                                        var proxyReq_temp = drive.files.update({
                                           fileId: fileId,
                                           'resource': body
                                        })
                                        .on('end', function() {
                                          console.log('Done');
                                        })
                                        .on('error', function(err) {
                                          console.log('Error during doc download', err);
                                        });
                                    });
                                    }else{
                                        console.log('Drive Details not configured properly.');
                                        return;
                                    }
                                });
                                // });
                            }else{
                            }
                            //TODO: Rename should be done in Drive/Dropbox first then in olympus not vice-cersa
                            if(model.isOnDropbox || model.isDropboxDir){
                                SyncDbox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
                                    if (err) {
                                        console.log('Error loading client secret file: ' + err);
                                        return;
                                    }
                                    if( tokenrow ){
                                        //File->isOnDropbox;downloadLink
                                        //Directory->isDropboxDir;driveFsName
                                        var prvNameDbx = model.isOnDropbox?model.downloadLink:model.driveFsName;
                                        var newNameDbx = model.isOnDropbox?model.downloadLink.replace( prvName, model.name ):model.driveFsName.replace( prvName, model.name );
                                        var node_dropbox = require('node-dropbox');
                                        api = node_dropbox.api(tokenrow.access_token);
                                        api.moveSomething(prvNameDbx, newNameDbx, function(err, res, data){
                                            // console.log('res', res);
                                            // console.log('data', data);
                                            console.log('dbxMoveerr', err);
                                            if(data){
                                                if(model.isOnDropbox){
                                                    model.downloadLink = data.path;
                                                }else{
                                                    model.driveFsName = data.path;
                                                    //If This is a directory then update all nested Files/Directory
                                                    INodeService.dbxRecursiveRename(model, function(data){
                                                        console.log('Path of Nested Files/Directories Updated.');
                                                    });
                                                }
                                                model.save().success(function (model) {
                                                    console.log('Dbx path Updated in olympus');
                                                });
                                            }
                                        });
                                    }else{
                                    }
                                });
                            }else{
                            }
                            //TODO: Rename should be done in Drive/Dropbox/Box first then in olympus not vice-cersa
                            if(model.isOnBox || model.isBoxDir){
                                SyncBox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
                                    if (err) {
                                        console.log('Error loading client secret file: ' + err);
                                        return;
                                    }
                                    if( tokenrow ){
                                        //File->isOnDropbox;downloadLink
                                        //Directory->isDropboxDir;driveFsName
                                        var boxFileId = model.isOnBox?model.downloadLink:model.driveFsName;
                                        var newName = model.name;
                                        var superagent = require('superagent');
                                        var boxRequest = superagent
                                        .put('https://api.box.com/2.0'+'/'+INodeModelType+'/'+boxFileId)
                                        .set('Authorization', 'Bearer '+tokenrow.access_token)
                                        .set('Content-Type', 'application/json')
                                        .send({ name: newName });
                                        // .end(function(err, boxfile){
                                        //     console.log(boxfile, err, 'boxfile');
                                        //     console.log('Box '+INodeModelType+':'+boxFileId+' Renamed successfully to '+newName );
                                        // });
                                        INodeService.doBoxRequest(tokenrow, boxRequest,function onBoxComplete (err, boxfile) {
                                            console.log(boxfile, err, 'boxfile');
                                            console.log('Box '+INodeModelType+':'+boxFileId+' Renamed successfully to '+newName );
                                        });
                                    }else{
                                    }
                                });
                            }else{

                            }

                            var apiObj = APIService.File.mini(model);
                            SocketService.broadcast('ITEM_RENAME', subscribers, apiObj);
                            if (!cb) {

                                /*Create logging*/
                                if (req.param('controller') == "directory") {

                                    var options = {
                                        uri: 'http://localhost:1337/logging/register/',
                                        method: 'POST',
                                    };

                                    var user_platform;
                                        if (req.headers.user_platform) {
                                            var user_platform = req.headers.user_platform;
                                        } else {
                                            if (req.headers['user-agent']) {
                                                 user_platform = req.headers['user-agent'];
                                            } else {
                                                 user_platform = "Web Application";
                                            }
                                        }


                                    options.json = {
                                        user_id: req.session.Account.id,
                                        text_message: 'has renamed a directory from ' + prvName + ' to ' + model.name + '.',
                                        activity: 'rename',
                                        on_user: req.session.Account.id,
                                        client_ip: req.param('ipadd'),
                                        ip: req.session.Account.ip,
                                        platform: user_platform,
                                    };

                                    request(options, function (err, response, body) {
                                        if (err)
                                            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                                        res.json(apiObj);
                                    });

                                } else {

                                    Directory.find(model.DirectoryId).success(function (dirModel) {
                                        var options = {
                                            uri: 'http://localhost:1337/logging/register/',
                                            method: 'POST',
                                        };

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

                                        options.json = {
                                            user_id: req.session.Account.id,
                                            text_message: 'has renamed a file from ' + prvName + ' to ' + model.name + ' located in ' + dirModel.name + '.',
                                            activity: 'rename',
                                            on_user: req.session.Account.id,
                                            client_ip: req.param('ipadd'),
                                            ip: req.session.Account.ip,
                                            platform: user_platform,
                                        };

                                        request(options, function (err, response, body) {
                                            if (err)
                                                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                                            res.json(apiObj);
                                        });
                                    });
                                }

                                /*Create logging*/

                            } else {
                                cb(null);
                            }
                        });
                    }
                    // Otherwise, fail.
                    /* TODO */
                    /* Fail a little less silently */
                    else {
                        _.shout("Can't rename node; node with same type and name exists in this location");
                        var apiObj = APIService.File.mini(model);
                        SocketService.broadcast('ITEM_RENAME', subscribers, apiObj);
                        if (!cb) {
                            res.json({
                                status: 'conflict',
                                message: "Can't rename node; node with same type and name exists in this location",
                                obj: apiObj,
                                retrievedFile: retrievedFile
                            });
                        } else {
                            cb({
                                type: "error",
                                status: 409,
                                code: "conflict",
                                message: "Can't rename node; node with same type and name exists in this location"
                            });
                        }
                    }
                });
            });
        }
    });
},
/**
* @alcanzar:Rishabh Chauhan
* Callback for Dropbox Driectories after rename Operation for
* Updating downloadLinks of nested dropbox files/directories in Olympus
*/
exports.dbxRecursiveRename = function(model, finalCallback){
    async.auto({
        // rm child files
        renameFiles: function(cb, rs) {
            File.findAll({
                where: {
                    DirectoryId: model.id
                }
            }).complete(function(e, files) {
                // No child files?  Return
                if(files.length === 0) {
                    cb(e, files);
                    return;
                }
                async.forEach(files, function(f, cb_f) {
                    //update filepath = parent dir path + current file name
                    f.downloadLink = model.driveFsName+'/'+f.name;
                    f.directoryId = f.DirectoryId;//just added for precaution from the bug making the DirectoryId null when performing save()
                    f.save().success(cb_f);//Save and single file callback
                }, cb);//files callback
            });
        },
        // Recursively rm subdirectories
        renameSubdirectories: function(cb, rs) {
            Directory.findAll({
                where: {
                    DirectoryId: model.id
                }
            }).complete(function(e, subdirs) {
                if(subdirs.length === 0) {
                    cb(e, subdirs);
                    return;
                }
                async.forEach(subdirs, function(d, cb_d) {
                    //update dirpath = parent dir path + current dir name
                    d.driveFsName = model.driveFsName+'/'+d.name;
                    d.directoryId = d.DirectoryId;//just added for precaution from the bug making the DirectoryId null when performing save()
                    d.save().success(function(data){
                        console.log('SINGLE DIR CALLBACK', data);
                        INodeService.dbxRecursiveRename(d, cb_d);
                    });//Save and single file callback
                }, cb);
            });
        }
    }, finalCallback);
},
        /**
         * Move a file or folder into another directory
         */
        exports.move = function (req, res, cb) {
            sails.log.info('Move:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
            // Get the source model class
            var sourceModelClass = (req.param('controller') == "directory") ? Directory : File;
            var sourceModelType = (req.param('controller') == "directory") ? 'folders' : 'files';//Used in box only
            // Get the source node id
            var sourceId = req.param('id');
            // Get the destination dir id
            var destId = req.param('directoryId');

            // Make sure the user has admin permissions on source and destination
            var sourcePermissionClass = (req.param('controller') == "directory") ? DirectoryPermission : FilePermission;
            var sourceCriteria = {
                AccountId: req.session.Account.id,
                type: 'admin'
                        // isLocked: false
            };
            if (sourcePermissionClass == DirectoryPermission) {
                sourceCriteria.DirectoryId = sourceId;
            } else {
                sourceCriteria.FileId = sourceId;
            }

            async.auto({
                getSourcePermissions: function (cb) {
                    sourcePermissionClass.find({
                        where: sourceCriteria
                    }).success(_.unprefix(cb));
                },
                getDestPermissions: function (cb) {
                    DirectoryPermission.find({
                        where: {
                            AccountId: req.session.Account.id,
                            DirectoryId: destId,
                            type: 'admin'
                        }
                    }).success(_.unprefix(cb));
                }

            }, function (err, response) {
                if (response.getSourcePermissions === null) {
                    if (!cb) {
                        res.send(403);
                    } else {
                        cb({
                            type: "error",
                            status: 403,
                            code: "forbidden",
                            message: "Insufficient permissions on source node"
                        });
                    }
                    return;
                }
                if (response.getDestPermissions === null) {
                    if (!cb) {
                        res.send(403);
                    } else {
                        cb({
                            type: "error",
                            status: 403,
                            code: "forbidden",
                            message: "Insufficient permissions on destination node"
                        });
                    }
                    return;
                }

                // Find the source model
                sourceModelClass.find(req.param('id')).success(function (INodeModel) {
                    // Check for a file in the destination directory with the same name
                    sourceModelClass.find({
                        where: {
                            name: INodeModel.name,
                            directoryId: destId
                        }
                    }).success(function (dupModel) {
                        if (dupModel !== null) { /* TODO */
                            /* Do something if a file with the same name exists in the destination */
                            sails.log.debug("File with same name exists in destination; aborting...");
                            if (!cb) {
                                return res.send(409);
                            }
                            cb({
                                type: "error",
                                status: 409,
                                code: "conflict",
                                message: "Can't move node; node with same type and name exists in this location"
                            });
                        } else {
                            // Get the current parent directory of the node we're moving, so
                            // that it can update its UI if necessary.
                            var sourceDirectoryId = INodeModel.DirectoryId;
                            // Call the "mv" method of the source model

                            Directory.find(destId).success(function (destModel){


                                var isSourceNodeOnDrive = INodeModel.isOnDrive || INodeModel.isDriveDir || INodeModel.isOlympusDriveDir;//Source could be either file OR Directory
                                var isDestNodeOnDrive   = destModel.isDriveDir || destModel.isOlympusDriveDir;//Dest will only be a Directory

                                var isSourceNodeOnDropbox = INodeModel.isOnDropbox || INodeModel.isDropboxDir || INodeModel.isOlympusDropboxDir;//Source could be either file OR Directory
                                var isDestNodeOnDropbox   = destModel.isDropboxDir || destModel.isOlympusDropboxDir;//Dest will only be a Directory
                                var isSourceNodeOnBox = INodeModel.isOnBox || INodeModel.isBoxDir || INodeModel.isOlympusBoxDir;//Source could be either file OR Directory
                                var isDestNodeOnBox   = destModel.isBoxDir || destModel.isOlympusBoxDir;//Dest will only be a Directory
                                async.auto({
                                    checkDrive: function(driveCallback) {//check if it is a Drive synced Directory
                                            
                                        if(!isSourceNodeOnDrive && !isDestNodeOnDrive){//Go Ahead with Olympus Only
                                            driveCallback();
                                        }else{

                                            //Load auth tokens first
                                            fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {
                                              if (err) {
                                                console.log('Error loading client secret file: ' + err);
                                                return;
                                              }
                                              // Authorize a client with the loaded credentials, then call the
                                              // Drive API.

                                              console.log('========================================================================');
                                              console.log(req.param('drive_action'));
                                              // console.log('========================================================================');
                                              // console.log(JSON.parse(content));
                                              // console.log(sails);
                                              sails.controllers.directory.authorize('file_open', req.session.Account.id, req.param('refresh_token'), JSON.parse(content), function (auth, driveUploadPathId) {

                                                console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
                                                console.log(auth);
                                                console.log(driveUploadPathId);

                                                var google = require('googleapis');

                                                var drive = google.drive({
                                                  version: 'v3',
                                                  auth: auth
                                                });

                                                if(isSourceNodeOnDrive && isDestNodeOnDrive){
                                                //Just Move the Nodes on Drive


                                                    drive.files.get({
                                                      fileId: INodeModel.isOnDrive?INodeModel.fsName:INodeModel.driveFsName,
                                                      fields: 'parents'
                                                    }, function(err, file) {
                                                      if (err) {
                                                        // Handle error
                                                        console.log(err);
                                                      } else {

                                                            var previousParents = file.parents.join(',');
                                                            var driveMoveOptions = {
                                                              fileId: INodeModel.isOnDrive?INodeModel.fsName:INodeModel.driveFsName,
                                                              addParents: destModel.isOlympusDriveDir?'root':destModel.driveFsName,
                                                              removeParents: previousParents,
                                                              fields: 'id, parents'
                                                            };

                                                            console.log(driveMoveOptions, ':::::]]]]]]]driveMoveOptions');
                                                            drive.files.update(driveMoveOptions, function(err, file) {
                                                              if(err) {
                                                                // Handle error
                                                                driveCallback(err);
                                                              } else {
                                                                // File moved.
                                                                driveCallback();
                                                              }
                                                            });
                                                      }
                                                    });//drive.files.get


                                                }else if(isSourceNodeOnDrive){//Download file from Drive (TODO:and Delete in Drive)
                                                    return driveCallback(null, 'canNotDownloadFromDrive');
                                                }else if(isDestNodeOnDrive){//Upload file to Drive (and Delete in Olympus)
                                                    return driveCallback(null, 'canNotUploadToDrive');
                                                }
                                              });//sails.controllers.directory.authorize
                                            });//fs.readFile
                                        }
                                    },
                                    checkDropbox: function(dropboxCallback) {//check if it is a Dropbox synced Directory


                                        if(!isSourceNodeOnDropbox && !isDestNodeOnDropbox){//Go Ahead with Olympus Only
                                            dropboxCallback();
                                        }else{
                                            if(isSourceNodeOnDropbox && isDestNodeOnDropbox){
                                            //Just Move the Nodes on Drive
                                                SyncDbox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
                                                    if (err) {
                                                        console.log('Error loading client secret file: ' + err);
                                                        return dropboxCallback();
                                                    }
                                                    if( tokenrow ){
                                                        //File->isOnDropbox;downloadLink
                                                        //Directory->isDropboxDir;driveFsName
                                                        var prvNameDbx = ( INodeModel.isOnDropbox ? INodeModel.downloadLink : INodeModel.driveFsName );
                                                        var newNameDbx = ( destModel.isOlympusDropboxDir ? '' : destModel.driveFsName ) + '/' +INodeModel.name;
                                                        console.log(prvNameDbx +' >>> Moved To >>>  '+newNameDbx);
                                                        var node_dropbox = require('node-dropbox');
                                                        api = node_dropbox.api(tokenrow.access_token);
                                                        api.moveSomething(prvNameDbx, newNameDbx, function(err, res, data){
                                                            // console.log('res', res);
                                                            // console.log('data', data);
                                                            console.log('dbxMoveerr', err);
                                                            if(data){
                                                                if(INodeModel.isOnDropbox){
                                                                    INodeModel.downloadLink = data.path;
                                                                }else{
                                                                    INodeModel.driveFsName = data.path;
                                            }
                                                                INodeModel.directoryId = destModel.id;//just added for precaution from the bug making the DirectoryId null when performing save()
                                                                INodeModel.save().success(function (model) {

                                                                    if(INodeModel.isOnDropbox){//If This is a directory then update all nested Files/Directory
                                                                        INodeService.dbxRecursiveRename(INodeModel, function(data){
                                                                            console.log('Path of Nested Files/Directories Updated.');
                                                                        });
                                                                    }
                                                                    console.log('Dbx path Updated in olympus');
                                                                    dropboxCallback();
                                            });
                                                            }
                                                        });
                                                    }else{
                                                    }
                                                });
                                            }else if(isSourceNodeOnDropbox){//Download file from Dropbox (and Delete in Dropbox)
                                                return dropboxCallback(null, 'canNotDownloadFromDropbox');
                                            }else if(isDestNodeOnDropbox){//Upload file to Dropbox (and delete in olympus)
                                                return dropboxCallback(null, 'canNotUploadToDropbox');
                                            }
                                        }
                                    },
                                    checkBox: function(boxCallback) {//check if it is a Box synced Directory

                                        console.log('isSourceNodeOnBox: ', isSourceNodeOnBox);
                                        console.log('isDestNodeOnBox: ', isDestNodeOnBox);

                                        if(!isSourceNodeOnBox && !isDestNodeOnBox){//Go Ahead with Olympus Only
                                            boxCallback();
                                        }else{

                                            if(isSourceNodeOnBox && isDestNodeOnBox){
                                            //Just Move the Nodes on Drive

                                                SyncBox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
                                                    if (err) {
                                                        console.log('Error loading client secret file: ' + err);
                                                        return boxCallback();
                                                    }

                                                    if( tokenrow ){
                                                        //File->isOnBox;downloadLink
                                                        //Directory->isBoxDir;driveFsName
                                                        var boxFileId = ( INodeModel.isOnBox ? INodeModel.downloadLink : INodeModel.driveFsName );
                                                        var targetDirectoryId = destModel.isOlympusBoxDir ? 0 : destModel.driveFsName;

                                                        // console.log(prvNameDbx +' >>> Moved To >>>  '+newNameDbx);

                                                        var superagent = require('superagent');
                                                        var boxRequest = superagent
                                                        .put('https://api.box.com/2.0'+'/'+sourceModelType+'/'+boxFileId)
                                                        .set('Authorization', 'Bearer '+tokenrow.access_token)
                                                        .set('Content-Type', 'application/json')
                                                        // .send({ 'parent.id': 20480111458 })
                                                        .send({parent:{
                                                            id: targetDirectoryId //traget folder ID, for root: 0
                                                        }});
                                                        // .end(function(err, boxfile){
                                                        //     // console.log(boxfile, err, 'boxfile');
                                                        //     console.log('Box '+sourceModelType+' '+boxFileId+' moved to folder '+targetDirectoryId);
                                                        //     boxCallback();
                                                        // });
                                                        INodeService.doBoxRequest(tokenrow, boxRequest,function onBoxComplete (err, boxfile) {
                                                            // console.log(boxfile, err, 'boxfile');
                                                            console.log('Box '+sourceModelType+' '+boxFileId+' moved to folder '+targetDirectoryId);
                                                            boxCallback();
                                                        });
                                                    }else{

                                                    }
                                                });
                                            }else if(isSourceNodeOnBox){//Download file from Box (and Delete in Box)
                                                return boxCallback(null, 'canNotDownloadFromBox');
                                            }else if(isDestNodeOnBox){//Upload file to Box (and delete in olympus)
                                                return boxCallback(null, 'canNotUploadToBox');
                                            }
                                        }
                                    },
                                    moveFileTask: ['checkDrive','checkDropbox','checkBox', function(driveCallback, up) {//Move File in Olympus

                                        console.log(up.checkDrive, '>> X <<', up.checkDropbox);
                                        dropboxException = _.contains([ 'canNotUploadToDropbox', 'canNotDownloadFromDropbox'], up.checkDropbox);
                                        driveException   = _.contains([ 'canNotUploadToDrive', 'canNotDownloadFromDrive'], up.checkDrive);
                                        boxException        = _.contains([ 'canNotUploadToBox', 'canNotDownloadFromBox'], up.checkBox);
                                        if(dropboxException || driveException || boxException){
                                            var cloudException;
                                            if(dropboxException){
                                                cloudException = up.checkDropbox;
                                            }else if(boxException){
                                                cloudException = up.checkBox;
                                            }else{
                                                cloudException = up.checkDrive;
                                            }
                                            if (!cb) {
                                                return res.json({error: cloudException, type: 'error'}, response && response.statusCode);
                                            }
                                            cb({
                                                type: "error",
                                                status: 403,
                                                code: cloudException,//"canNotUploadToDropbox", "canNotDownloadFromDropbox"
                                                message: "Insufficient permissions on source node"
                                            });
                                        }else{
                                            INodeModel.mv(destId, function (err, obj) {
                                                var sourceSubscribers = Directory.roomName(sourceDirectoryId);
                                                // Get the subscribers to the destination
                                                var destSubscribers = Directory.roomName(destId); /* TODO */
                                                /* Calculate "num_children" values instead of getting them from the client */
                                                var model = req.param('controller') == "directory" ? APIService.Directory.mini(obj) : APIService.File.mini(obj);
                                                model.num_children = req.param('source_num_children');
                                                var apiObj = {
                                                    id: sourceId,
                                                    model: model,
                                                    directoryId: destId,
                                                    sourceDirectoryId: sourceDirectoryId,
                                                    source_dir_num_children: req.param('source_dir_num_children') - 1,
                                                    dest_dir_num_children: req.param('dest_dir_num_children') + 1
                                                };
                                                SocketService.broadcast('ITEM_MOVE', sourceSubscribers, apiObj);
                                                SocketService.broadcast('ITEM_MOVE', destSubscribers, apiObj);
                                                if (!cb) {
                                                    res.json({
                                                        status: 'success',
                                                        obj: apiObj
                                                    });
                                                } else {
                                                    cb(null);
                                                }
                                                sails.log.debug("Moved node #" + INodeModel.id + " (" + INodeModel.name + ") from dir #" + sourceDirectoryId + " to dir #" + destId);
                                            });
                                        }
                                    }]
                                });
                            });
                        }
                    });
                });
            });

        },
        /**
         @alcanzar
         Create new records entry in the table
         Whenever someone try to delete the file and directory
         */
/*
        exports.deletedFileInfo = function (options, cb) {

            var dt = new Date();
            var datetime = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

            if (options.model.name == "Directory") {

                DirectoryPermission.findAll({
                    where: {DirectoryId: options.id}
                }).success(function (directorypermission) {
                    Directory.findAll({
                        where: { id : directorypermission[0].DirectoryId }
                    }).success(function (directory) {
                        directorypermission.forEach(function (dirpermission) {
                            var sql = "Insert into deletedlist ( type, deleted_id, createdAt, updatedAt, user_id, account_id, directory_id, permission) VALUES ( '" + 2 + "', '" + dirpermission.DirectoryId + "', '" + datetime + "', '" + datetime + "',  '" + options.accountId + "', '" + dirpermission.AccountId + "', '"+ directory[0].DirectoryId +"', '"+dirpermission.type+"')";
                            sql = Sequelize.Utils.format([sql]);
                            sequelize.query(sql, null, {raw: true});
                        });
                    });
                }).error(function (err) {
                    throw new Error(err);
                });


            } else if (options.model.name == "File") {

                FilePermission.findAll({
                    where: {FileId: options.id}
                }).success(function (filepermission) {
                    File.findAll({
                        where: { id : filepermission[0].FileId }
                    }).success(function (file) {
                        filepermission.forEach(function (filepermission) {
                            var sql = "Insert into deletedlist ( type, deleted_id, createdAt, updatedAt, user_id, account_id, directory_id, permission) VALUES ( '" + 1 + "', '" +filepermission.FileId + "', '" + datetime + "', '" + datetime + "',  '" + options.accountId + "', '" + filepermission.AccountId + "', '"+ file[0].DirectoryId +"', '"+filepermission.type+"')";
                            sql = Sequelize.Utils.format([sql]);
                            sequelize.query(sql, null, {raw: true});
                        });
                    });
                }).error(function (err) {
                    throw new Error(err);
                });
            }

        }
*/


        /**
            @alcanzar
            Create new records entry in the table
            Whenever someone try to delete the file and directory
        */

        exports.deletedFileInfo = function (options, cb) {

            var dt = new Date();
            var datetime = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

            if (options.model.name == "Directory") {

	
                DirectoryPermission.findAll({
                    where: { DirectoryId: options.id }
                }).success(function (directorypermission) {

                    async.auto({

                        updateDeletedDir : function(cb){

                            Directory.findAll({
                                where: { id : directorypermission[0].DirectoryId }
                            }).success(function (directory) {

                                directorypermission.forEach(function (dirpermission) {
                                    var sql = "Insert into deletedlist ( type, deleted_id, createdAt, updatedAt, user_id, account_id, directory_id, permission) VALUES ( '" + 2 + "', '" + dirpermission.DirectoryId + "', '" + datetime + "', '" + datetime + "',  '" + options.accountId + "', '" + dirpermission.AccountId + "', '"+ directory[0].DirectoryId +"', '"+dirpermission.type+"')";
                                    sql = Sequelize.Utils.format([sql]);
                                    sequelize.query(sql, null, {raw: true});
                                }, cb);
                            });

                        },
                        
                        updateFileDir : function(cb){

                            File.findAll({
                                where: { DirectoryId : directorypermission[0].DirectoryId }
                            }).success(function (file) {
                                
                                file.forEach(function (filelist) {
                                    INodeService.insertDirectoryFile({
                                        filelist    : filelist, 
                                        datetime    : datetime,
                                        account_id  : options.accountId,
                                    });
                                },cb);

                            });

                        },
                        
                        updateSubDir : function(cb){

                            Directory.findAll({
                                where: { DirectoryId : directorypermission[0].DirectoryId, deleted : null }
                            }).success(function (directory) {
                                if(directory.length === 0){
                                }else{
                                    /*INodeService.insertDirectoryData({
                                        directory   : directory,
                                        datetime    : datetime,
                                        account_id  : options.accountId,
                                        add         : 0,
                                    });*/

                                    async.each(directory,//1st array of items
                                      // 2nd param is the function that each item is passed to
                                      function(directoryitem, recursivedeletecallback){// Call an asynchronous function, often a save() to DB

                                        INodeService.deletedFileInfo({
                                            id: directoryitem.id,
                                            model: Directory,
                                            // replaceFileId: req.param('replaceFileId'),
                                            accountId: options.accountId,
                                            accountName: options.accountName
                                        });
                                      },
                                      // 3rd param is the function to call when everything's done
                                      function(err){
                                        // All tasks are done now
                                        cb();// doSomethingOnceAllAreDone();
                                      }
                                    );
                                    
                                }
                            });
                        }

                    }, function(err, response){
                        cb(null, list);
                    });
                }).error(function (err) {
                    throw new Error(err);
                });

            } else if (options.model.name == "File") {

                FilePermission.findAll({
                    where: { FileId: options.id}
                }).success(function (filepermission) {
                    File.findAll({
                        where: { id : filepermission[0].FileId }
                    }).success(function (file) {
                        filepermission.forEach(function (filepermission) {
                            var sql = "Insert into deletedlist ( type, deleted_id, createdAt, updatedAt, user_id, account_id, directory_id, permission) VALUES ( '" + 1 + "', '" +filepermission.FileId + "', '" + datetime + "', '" + datetime + "',  '" + options.accountId + "', '" + filepermission.AccountId + "', '"+ file[0].DirectoryId +"', '"+filepermission.type+"')";
                            sql = Sequelize.Utils.format([sql]);
                            sequelize.query(sql, null, {raw: true});
                        });
                    });
                }).error(function (err) {
                    throw new Error(err);
                });
            }
        },

        /**
            @alcanzar:rishabh
            Just Delete the records entry in the table in case of drive
            Whenever someone try to delete the file and directory
        */
        exports.deletedDriveFileInfo = function (options, cb) {

            console.log('testDeleteDriveDir function testDeleteDriveDir function testDeleteDriveDir function');
            var dt = new Date();
            var datetime = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

            fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {
                
                if (err) {
                    console.log('Error loading client secret file: ' + err);
                    return;
                }

                sails.controllers.directory.authorize('file_delete_by_pathID', options.driveDetails.pathID, null, JSON.parse(content), function (auth, driveUploadPathId) {
                    var google = require('googleapis');

                    var drive = google.drive({
                      version: 'v2',
                      auth: auth
                    });

                    //File->isOnDrive;fsName
                    //Directory->isDriveDir;driveFsName
                    // var fileId = model.isOnDrive?model.fsName:model.driveFsName;
                    var fileId = options.driveDetails.driveId;
                    console.log('Deleting Drive FILE: ', fileId);

                    var proxyReq_temp = drive.files.delete({
                       fileId: fileId,
                       // 'resource': body
                    })
                    .on('end', function() {
                      console.log('Done');
                    })
                    .on('error', function(err) {
                      console.log('Error during doc download', err);
                    });
                });
            });

            if (options.model.name == "Directory") {
                // nothing to insert in case of drive
            } else if (options.model.name == "File") {
                // nothing to insert in case of drive
            }
        },

        exports.deletedOlympusDriveDir = function (options, cb) {

            console.log('testdeletedOlympusDriveDir testdeletedOlympusDriveDir testdeletedOlympusDriveDir testdeletedOlympusDriveDir ');
            var dt = new Date();
            var datetime = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

            fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {
                
                if (err) {
                    console.log('Error loading client secret file: ' + err);
                    return;
                }

                sails.controllers.directory.authorize('file_delete_by_pathID', options.driveDetails.pathID, null, JSON.parse(content), function (auth, driveUploadPathId) {
                    var google = require('googleapis');

                    var drive = google.drive({
                      version: 'v2',
                      auth: auth
                    });

                    //File->isOnDrive;fsName
                    //Directory->isDriveDir;driveFsName
                    // var fileId = model.isOnDrive?model.fsName:model.driveFsName;
                    var fileId = options.driveDetails.driveId;
                    console.log('Deleting Drive FILE: ', fileId);

                    var proxyReq_temp = drive.files.delete({
                       fileId: 'root',//fileId,
                       // 'resource': body
                    })
                    .on('end', function() {
                      console.log('Done');
                    })
                    .on('error', function(err) {
                      console.log('Error during doc download', err);
                    });
                });
            });
            if (options.model.name == "Directory") {
                // nothing to insert in case of drive
            } else if (options.model.name == "File") {
                // nothing to insert in case of drive
            }
        },
        /**
            @alcanzar:rishabh
            Just Delete the records entry in the table in case of drive
            Whenever someone try to delete the file and directory
        */
        exports.deletedDropboxFileInfo = function (options, cb) {
            console.log('testDeleteDropboxDir function testDeleteDropboxDir function testDeleteDropboxDir function', options.dropboxDetails);
            var dt = new Date();
            var datetime = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
            SyncDbox.find({where:{id: options.dropboxDetails.pathID}}).done(function (err, tokenrow) {
                if (err) {
                    console.log('Error loading client secret file: ' + err);
                    return;
                }
                if( tokenrow ){
                    var node_dropbox = require('node-dropbox');
                    api = node_dropbox.api(tokenrow.access_token);
                    if (options.model.name == "Directory") {
                        // nothing to insert in case of dropbox
                        api.removeDir(options.dropboxDetails.dropboxPath, function(err, httpResponse, body){
                            // console.log(httpResponse, ' httpResponse');
                            // console.log(err, ' ERR');
                            // console.log(body, ' BODY');
                            if(body.is_deleted){
                                console.log('DELETED');
                            }else{
                                console.log('NOT DELETED');
                            }
                        });
                    } else if (options.model.name == "File") {
                        // nothing to insert in case of dropbox
                        api.removeDir(options.dropboxDetails.dropboxPath, function(err, httpResponse, body){
                            // console.log(httpResponse, ' httpResponse');
                            // console.log(err, ' ERR');
                            // console.log(body, ' BODY');
                            if(body.is_deleted){
                                console.log('DELETED');
                            }else{
                                console.log('NOT DELETED');
                            }
                        });
                    }
                }
            });
        },
        exports.deletedOlympusDropboxDir = function (options, cb) {
            var dt = new Date();
            var datetime = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

            if (options.model.name == "Directory") {
                // nothing to insert in case of drive
            } else if (options.model.name == "File") {
                // nothing to insert in case of drive
            }
        },

        /**
            @alcanzar:rishabh
            Just Delete the records entry in the table in case of Box
            Whenever someone try to delete the file and directory
        */
        exports.deletedBoxFileInfo = function (options, cb) {

            console.log('testDeleteBoxDir function testDeleteBoxDir function testDeleteBoxDir function', options.dropboxDetails);
            var dt = new Date();
            var datetime = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

            SyncBox.find({where:{id: options.boxDetails.pathID}}).done(function (err, tokenrow) {
                if (err) {
                    console.log('Error loading client secret file: ' + err);
                    return;
                }

                if( tokenrow ){

                    var deleteUrl;
                    if(options.model.name == "Directory"){
                        deleteUrl = 'https://api.box.com/2.0'+'/'+'folders'+'/'+options.boxDetails.boxPath+'?recursive=true'
                    }else{//file
                        deleteUrl = 'https://api.box.com/2.0'+'/'+'files'+'/'+options.boxDetails.boxPath
                    }

                    var superagent = require('superagent');
                    var boxRequest = superagent
                    .delete(deleteUrl)
                    .set('Authorization', 'Bearer '+tokenrow.access_token);
                    // .end(function(err, boxfile){
                    //     console.log(boxfile, err, 'boxfile');
                    // });
                    INodeService.doBoxRequest(tokenrow, boxRequest,function onBoxComplete (err, boxfile) {
                        console.log(boxfile, err, 'boxfile');
                    });
                }
            });
        },

exports.doBoxRequest = function(tokenrow, boxRequest, callback){

    console.log('typeof boxRequest : ', boxRequest);
    boxRequest
    .end(function(err, boxfile){

        if( err && err.status == 401 && tokenrow && tokenrow.refresh_token ){//Try Refreshing the tokens once
            var superagent = require('superagent');
            superagent
            .post('https://app.box.com/api' + '/oauth2/token')
            .field('grant_type', "refresh_token")
            .field('client_id', 'cbev0e1mrb9jrmvc90gdvwmyworca1nx')
            .field('client_secret', 'UHa0J0epfLX0WoYOQ1JCmYpxvGLyDv8k')
            .field('refresh_token', tokenrow.refresh_token)
            .end(function (errRefresh, resRefresh) {
                console.log('checkcheckcheckcheckcheckcheckcheckcheckcheckcheckcheck',resRefresh);
                if(resRefresh.status == 200 && typeof resRefresh.body.access_token != 'undefined' || typeof resRefresh.body.refresh_token != 'undefined')
                {
                    // self.updateAccessToken(res.body.access_token);
                    console.log('res.body.access_token', resRefresh.body.access_token,'res.body.refresh_token', resRefresh.body.refresh_token);
                    tokenrow.access_token     = resRefresh.body.access_token;
                    tokenrow.refresh_token    = resRefresh.body.refresh_token;
                    tokenrow.save().done(function(err) {

                        console.log('new token saved, proceeding...')
                        //Hacky code (extra headers deleted so that request can be made again, access token updated)
                        delete boxRequest.req;
                        delete boxRequest.protocol;
                        delete boxRequest.host;
                        delete boxRequest._callback;
                        delete boxRequest.res;
                        delete boxRequest.response;
                        delete boxRequest.called;
                        delete boxRequest._timeout;
                        boxRequest.header.authorization = 'Bearer '+tokenrow.access_token;
                        boxRequest._header.authorization = 'Bearer '+tokenrow.access_token;
                        console.log('typeof boxRequest after: ', boxRequest);
                        //Try running the request again now
                        boxRequest
                        .end(function(err, boxfile){
                            console.log('Request called again');
                            callback(err, boxfile);
                        });
                    });
                }else{
                    //400-refresh token expired
                    // console.log(resRefresh.response.error);
                    console.log(resRefresh.body.error);
                    callback(err, boxfile);//Callback done with old boxfile response only
                    // return;
                    // return callback('Error: '+res.error.message);
                }
            });
        }else{
            callback(err, boxfile);//Normal Callback/Token not expired
        }
        // console.log(boxfile, err, 'boxfile');
        // console.log('Box '+INodeModelType+':'+boxFileId+' Renamed successfully to '+newName );
    });
},

exports.insertDirectoryData = function(options, cb){

    var directoryData   = options.directory;
    var datetime        = options.datetime;
    var account_id      = options.account_id;
    var checkInsert     = options.add; 

    directoryData.forEach(function (directorylist) {

	console.log("directorylistdirectorylistdirectorylistdirectorylistdirectorylistdirectorylistdirectorylist");
	console.log(directorylist.id);
	console.log("directorylistdirectorylistdirectorylistdirectorylistdirectorylistdirectorylistdirectorylist");

        if(checkInsert === 0){

            DirectoryPermission.findAll({
                where: { DirectoryId : directorylist.id }
            }).success(function (directorypermission) {

        		console.log("directorypermissiondirectorypermissiondirectorypermissiondirectorypermission");
        		console.log(directorypermission[0].AccountId);
        		console.log("directorypermissiondirectorypermissiondirectorypermissiondirectorypermission");

                if(directorypermission.length > 0){
                    var sql = "Insert into deletedlist ( type, deleted_id, createdAt, updatedAt, user_id, account_id, directory_id, permission) VALUES ( '" + 2 + "', '" + directorylist.id + "', '" + datetime + "', '" + datetime + "',  '" + account_id + "', '" + directorypermission[0].AccountId + "', '"+ directorylist.DirectoryId +"', '"+directorypermission[0].type+"')";

                    sql = Sequelize.Utils.format([sql]);

            		console.log("sqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsql");
            		console.log(sql);
            		console.log("sqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsql");
                    sequelize.query(sql, null, {raw: true});
                }
            });

        }

        Directory.findAll({
            where: { DirectoryId : directorylist.id, deleted : null }
        }).success(function (directory) {
            if(directory.length === 0){
            }else{

                async.auto({

                    updateDeletedDir : function(cb){

                        DirectoryPermission.findAll({
                            where: { DirectoryId : directorylist.id }
                        }).success(function (directorypermission) {
                            directorypermission.forEach( function (dirper) {
                                var sql = "Insert into deletedlist ( type, deleted_id, createdAt, updatedAt, user_id, account_id, directory_id, permission) VALUES ( '" + 2 + "', '" + directory[0].id + "', '" + datetime + "', '" + datetime + "',  '" + account_id + "', '" + dirper.AccountId + "', '"+ directory[0].DirectoryId +"', '"+dirper.type+"')";
                                sql = Sequelize.Utils.format([sql]);

				console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
				console.log(sql);
				console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");

                                sequelize.query(sql, null, {raw: true});

                            }, cb);
                        });
                    },

                    updateFileDir : function(cb){

                        directory.forEach(function (dir) {
                            File.findAll({
                                where: { DirectoryId : dir.id }
                            }).success(function (file) {
                                file.forEach(function (filelist) {
                                    INodeService.insertDirectoryFile({
                                        filelist    : filelist, 
                                        datetime    : datetime,
                                        account_id  : account_id
                                    });
                                },cb);
                            });
                        },cb);
                    }

                }, function(err, results){

                });
            }

            INodeService.insertDirectoryData({
                directory   : directory,
                datetime    : datetime,
                account_id  : account_id,
                add         : 1
            });
        });
    });

};

exports.insertDirectoryFile = function(options, cb){

    var fileData    = options.filelist;
    var datetime    = options.datetime;
    var account_id  = options.account_id;

    FilePermission.findAll({
        where: { FileId: fileData.id }
    }).success(function (filepermission) {
        File.findAll({
            where: { id : filepermission.FileId }
        }).success(function (file) {
            filepermission.forEach(function (filepermission) {
                var sql = "Insert into deletedlist ( type, deleted_id, createdAt, updatedAt, user_id, account_id, directory_id, permission) VALUES ( '" + 1 + "', '" + filepermission.FileId + "', '" + datetime + "', '" + datetime + "',  '" + account_id + "', '" + filepermission.AccountId + "', '"+ fileData.DirectoryId +"', '"+ filepermission.type+ "')";
                sql = Sequelize.Utils.format([sql]);
                sequelize.query(sql, null, {raw: true});
            });
        });
    }).error(function (err) {
        throw new Error(err);
    });
};


/**
 * Delete the specified inode
 */

exports['delete'] = function (req, res, cb) {

    var request = require('request');
    var inodeId = req.param('replaceFileId') || req.param('id');
    var rmCloud = req.param('rmCloud');
    var INodeModel;

    if (req.param('controller') == "account") {
        var INodeModel = Directory;
        INodeModel.identity = "directory";
    } else {
        var INodeModel = (req.param('controller') == "directory" && !req.param('replaceFileId')) ? Directory : File;
        INodeModel.identity = (req.param('controller') == "directory" && !req.param('replaceFileId')) ? "directory" : "file";
    }

    sails.log.info('Delete:' + inodeId + ' [User:' + req.session.Account.id + ']');

    // Get the model we're trying to rename
    INodeModel.find(inodeId).success(function (model) {

        console.log('delete INodeModel delete INodeModel delete INodeModel delete INodeModel delete INodeModel ');
        console.log(model);
        console.log('delete INodeModel delete INodeModel delete INodeModel delete INodeModel delete INodeModel ');

        if(model.isOlympusDriveDir){
            //Check if user confirmed to delete from Drive otherwise continue deleting from olympus only
            if(rmCloud){
                // INodeService.deletedOlympusDriveDir({
                //     id: inodeId,
                //     model: INodeModel,
                //     replaceFileId: req.param('replaceFileId'),
                //     accountId: req.session.Account.id,
                //     accountName: req.session.Account.name,
                //     driveDetails: { driveId: model.isOnDrive?model.fsName:model.driveFsName, pathID: model.uploadPathId }
                // });
            }
        }else if(model.isOnDrive || model.isDriveDir){
            //Check if user confirmed to delete from Drive otherwise continue deleting from olympus only
            if(rmCloud){
                INodeService.deletedDriveFileInfo({
                    id: inodeId,
                    model: INodeModel,
                    replaceFileId: req.param('replaceFileId'),
                    accountId: req.session.Account.id,
                    accountName: req.session.Account.name,
                    driveDetails: { driveId: model.isOnDrive?model.fsName:model.driveFsName, pathID: model.uploadPathId }
                });
            }
        }else if(model.isOlympusDropboxDir){
            //Check if user confirmed to delete from Drive otherwise continue deleting from olympus only
            if(rmCloud){
                // console.log('Removing Dropbox Directory from Olympus');
                // INodeService.deletedOlympusDropboxDir({
                //     id: inodeId,
                //     model: INodeModel,
                //     replaceFileId: req.param('replaceFileId'),
                //     accountId: req.session.Account.id,
                //     accountName: req.session.Account.name,
                //     dropboxDetails: { dropboxPath: model.isOnDropbox?model.downloadLink:model.driveFsName, pathID: model.uploadPathId }
                // });
            }
        }else if(model.isOnDropbox || model.isDropboxDir){
            //Check if user confirmed to delete from Drive otherwise continue deleting from olympus only
            if(rmCloud){
                INodeService.deletedDropboxFileInfo({
                    id: inodeId,
                    model: INodeModel,
                    replaceFileId: req.param('replaceFileId'),
                    accountId: req.session.Account.id,
                    accountName: req.session.Account.name,
                    dropboxDetails: { dropboxPath: model.isOnDropbox?model.downloadLink:model.driveFsName, pathID: model.uploadPathId }
                });
            }
        }else if(model.isOlympusBoxDir){
            //Check if user confirmed to delete from Drive otherwise continue deleting from olympus only
            if(rmCloud){
                // console.log('Removing Dropbox Directory from Olympus');
                // INodeService.deletedOlympusDropboxDir({
                //     id: inodeId,
                //     model: INodeModel,
                //     replaceFileId: req.param('replaceFileId'),
                //     accountId: req.session.Account.id,
                //     accountName: req.session.Account.name,
                //     dropboxDetails: { dropboxPath: model.isOnDropbox?model.downloadLink:model.driveFsName, pathID: model.uploadPathId }
                // });
            }
        }else if(model.isOnBox || model.isBoxDir){
            //Check if user confirmed to delete from Drive otherwise continue deleting from olympus only
            if(rmCloud){
                INodeService.deletedBoxFileInfo({
                    id: inodeId,
                    model: INodeModel,
                    replaceFileId: req.param('replaceFileId'),
                    accountId: req.session.Account.id,
                    accountName: req.session.Account.name,
                    boxDetails: { boxPath: model.isOnBox?model.downloadLink:model.driveFsName, pathID: model.uploadPathId }
                });
            }
        }else{
            INodeService.deletedFileInfo({
                id: inodeId,
                model: INodeModel,
                replaceFileId: req.param('replaceFileId'),
                accountId: req.session.Account.id,
                accountName: req.session.Account.name,
            });
        }


        var subscribers = INodeModel.roomName(inodeId);
        /*if (INodeModel.name == 'File') {
            var sql = ("Delete from version where FileId = ?");
            sql = Sequelize.Utils.format([sql, inodeId]);
            sequelize.query(sql, null, {
                raw: true
            });
        }*/

        // Make sure the user has sufficient permissions for the delete
        var sourcePermissionClass = (req.param('controller') == "directory" && !req.param('replaceFileId')) ? DirectoryPermission : FilePermission;

        var sourceCriteria = {
            AccountId: req.session.Account.id,
            type: 'admin'
        };

        if (sourcePermissionClass == DirectoryPermission) {
            sourceCriteria.DirectoryId = inodeId;
        } else {
            sourceCriteria.FileId = inodeId;
        }

        sourcePermissionClass.find({
            where: sourceCriteria
        }).success(function (model) {

            if (model === null) {

                return res.json({
                    status: 'error',
                    error: 'PERM_DENIED'
                }, 500);

            } else {

                INodeService.destroy({
                    id: inodeId,
                    model: INodeModel,
                    replaceFileId: req.param('replaceFileId'),
                    accountId: req.session.Account.id,
                    accountName: req.session.Account.name,
                    ipadd: req.param('ipadd'),
                    ip: req.session.Account.ip

                }, function afterDestroy(err) {

                    // Respond and broadcast activity to all sockets subscribed
                    var apiObj = {
                        id: inodeId
                    };

                    if (cb)
                        return cb();
                    else
                        return res.json({
                            status: 'success',
                            obj: apiObj
                        });
                });
            }
        });
    });
};


/*
 * Destroy options
 id
 model
 */
exports.destroy = function (options, cb) {
    var request = require('request');

// Update cached directory size
    if (options.model.identity == 'directory') {

        Directory.find(options.id).error(cb).success(function (directory) {
            if (!directory)
                return cb("No directory found!");

            /*Create logging*/
            var opts = {
                uri: 'http://localhost:1337/logging/register/',
                method: 'POST',
            };

            if (options.platform) {
                var user_platform = options.platform;
            } else {
                var user_platform = "Web Application";
            }

            opts.json = {
                user_id: options.accountId,
                text_message: 'has deleted a directory named ' + directory.name + '.',
                activity: 'delete',
                on_user: options.accountId,
                client_ip: options.ipadd,
                ip: options.ip,
                platform: user_platform,
            };

            request(opts, function (err, response, body) {
                if (err)
                    return res.json({error: err.message, type: 'error'}, response && response.statusCode);

            });
            /*Create logging*/
            
                Directory.updateParentDirectorySizes(directory.DirectoryId, -directory.size, remove);
        });

    } else {

        File.find(options.id).error(cb).success(function (file) {
            if (!file)
                return cb("No file found!");

            
            Directory.find(file.DirectoryId).success(function (dirModel) {
                
                /*Create logging*/
                var opts = {
                    uri: 'http://localhost:1337/logging/register/',
                    method: 'POST',
                };

                if (options.platform) {
                    var user_platform = options.platform;
                } else {
                    var user_platform = "Web Application";
                }
                opts.json = {
                    user_id: options.accountId,
                    text_message: 'has deleted a file named ' + file.name +( dirModel?' located in ' + dirModel.name:'' ),
                    activity: 'delete',
                    on_user: options.accountId,
                    client_ip: options.ipadd,
                    ip: options.ip,
                    platform: user_platform,
                };

                request(opts, function (err, response, body) {
                    // if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
                    //Directory.updateParentDirectorySizes(file.DirectoryId, -file.size, remove);
                });
                /*Create logging*/


            Directory.updateParentDirectorySizes(file.DirectoryId, -file.size, remove);
            });
            

        });

    }

    function remove() {
        options.model.find(options.id).error(cb).success(function (inode) {
            inode.rm(function (err) {
                if (err)
                    return cb(err);
                SocketService.broadcast('ITEM_TRASH', options.model.roomName(options.id), {
                    id: options.id
                });
                cb();
            });
        });
    }

};

/**
 * Return the set of users who are currently viewing the stream
 * -params-
 *      id  -> the target Directory's unique identifier
 */
exports.swarm = function (req, res) {
    var data = getRequestData(req, res);
    var sockets = data.Model.getActiveUsers(data.id),
            // Lookup account IDs from the session in the socket handshake
            accountIds = _.map(sockets, function (v, k) {
                return v.handshake.session.Account.id;
            });
    if (accountIds.length === 0) {
        res.json(APIService.Account.mini([])); // If result set is empty, get out to avoid Sequelize bug
    } else {
        Account.findAll({
            where: {// Get Account models and respond to client with APIService
                id: accountIds
            }
        }).success(function (accounts) {
            res.json(APIService.Account.mini(accounts)); // Send API response
        }).error(function (err) {
            throw new Error(err);
        });
    }
}



/**
 * Return the set of permissions attached to this inode
 */
exports.permissions = function (req, res) {
    var isDir = (req.param('controller') == 'directory');
    var sql = "SELECT *, " + "p.type AS permission " + "FROM " + (isDir ? "directorypermission p " : "filepermission p ") + "INNER JOIN " + "account a " + "ON p.AccountId=a.id " + "WHERE " + (isDir ? "p.DirectoryId=?" : "p.FileId=?");
    sql = Sequelize.Utils.format([sql, req.param('id')]);
    sequelize.query(sql, null, {
        raw: true
    }).success(function (models) {
        res.json(APIService.Permission.mini(models)); // Send API response
    }).error(function (e) {
        throw new Error(e);
    });
};

/**
 * Add a permission
 */
exports.addPermission = function (req, res) {

    var request = require('request');
    var inodeId = req.param('id');

//    console.log(req);

    var INodeModel = ((req.param('controller') == "directory") || (req.param('controller') == "account") || (req.param('controller') == "profile")) ? Directory : File;

//    console.log(INodeModel);

// And broadcast activity to all sockets subscribed
    var subscribers = INodeModel.roomName(inodeId);
    async.waterfall([
        // Get info about the node we're trying to add permissions for
        function (callback) {
            INodeModel.find(inodeId).success(function (inode) {
                callback(null, inode);
            });
        },
        // Now that we have the node, find the account record for the user
        // we want to give the permsission.  If they don't exist, we'll
        // create them.


        function (inode, callback) {

            // If we've been given the email address of a user, attempt to look the up
            if (req.param('email')) {

                var emails_str = req.param('email');
                // emails.split(/,|;/);
                var emails = emails_str.split(/(?:,| |;)+/);

                var accounts = emails.map(function(email) {
                    Account.find({
                        where: {email: email}
                    }).success(function (account) {
                        console.log("CREATING NEW ACCOUNT");
                        // If we find them, move on to the next step (granting the permission)
                        if (account) {
                            callback(null, inode, account);
                        }

                    // Otherwise, create an account using this email, and create a verification
                    // code for them.  Then grant permissions to this new user
                    else {

                        var verificationCode = UUIDGenerator.v1();
                        var password = new Array(8);
                        UUIDGenerator.v1(null, password, 0);
                        password = UUIDGenerator.unparse(password);

                            Account.create({
                                name: email,
                                email: email,
                                password: password,
                                verified: false,
                                verificationCode: verificationCode
                            }).success(function (newAccount) {

                            console.log("ACCOUNT CREATED");
                            console.log(newAccount);

                            //Now account is created after account is verified so that no workgroup is created with email value but only with username
                            /*var options = {
                                uri: 'http://localhost:1337/directory/createWorkgroup/',
                                method: 'POST',
                            };

                            options.json = {
                                account_name: newAccount.name,
                                account_id: newAccount.id
                            };

                                request(options, function (err, response, body) {
                                    if (err)
                                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);                          // res.send(200);
                                });*/
                                callback(null, inode, newAccount);
                            });
                        }
                    });
                });
            }

            // If we were sent the ID of an existing user, look them up and continue
            else {

                sails.log.debug('checking id of existing user');
                sails.log.info('checking owed_by.id: ', req.param('owned_by').id);
                Account.find(req.param('owned_by').id).done(function (err, account) {

                    // if we cannot find the user then pass a
                    if (err) {
                        return callback(err);
                    }
                    callback(null, inode, account);
                });
            }
        },
        // Now that we have a user and an inode, go ahead and grant the permissions




        function (inode, account, callback) {

            // Permit this account
            Account.permit(req.param('permission'), inode, account.id, function (err, permission, alreadyExists, isOrphan) {

                // If this permission already exists, return failure
                if (alreadyExists) {
                    res.json({
                        success: false
                    });
                }

                // Respond and broadcast to client(s)
                else {

                    var apiObj = (req.param('controller') == "directory") ? APIService.Directory.mini(inode) : APIService.File.mini(inode);
                    _.extend(apiObj, {
                        id: inodeId,
                        part_of: {
                            id: inodeId,
                            type: req.param('controller')
                        },
                        owned_by: APIService.Account.mini(account),
                        orphan: isOrphan,
                        permission: req.param('permission') || 'comment',
                        type: 'permission',
                        nodeType: req.param('controller')
                    });


                    // Send an email to the user we granted permissions to.  If they're a new
                    // user, send them the verification link.  Otherwise, just send them an update.
                    var options = {
                        accountName: req.session.Account === undefined ? req.param('name') : req.session.Account.name,
                        account: account,
                        inode: inode,
                        host: req.header('host'),
                        port: req.port,
                        controller: req.param('controller')
                    };

                    // EmailService.sendInviteEmail(options);
                    // EmailService.sendInviteEmailwithNodemailer(options);
                    // EmailService.sendInviteEmailwithSendgrid(options);
                    // EmailServices.sendInviteEmailwithSmtp(options);

                    EmailServices.sendEmail('invite', options);

                    // Create a response function--we're not quite ready with the response object yet though...
                    var respond = function (response) {
                        SocketService.broadcast('COLLAB_ADD_COLLABORATOR', subscribers, apiObj);
                        SocketService.broadcast('COLLAB_ADD_COLLABORATOR', "Account_" + account.id, response);
                        res.json(response);
                    };

                    // If it's a directory that was shared, count up the children that the new user
                    // can see, and add it to the response object so that the directory icon has an
                    // expand arrow in the UI if necessary
                    if (req.param('controller') == 'directory' || req.param('controller') == 'profile') {

                        async.auto({
                            files: function (cb, rs) {
                                File.whoseParentIs({
                                    parentId: inodeId,
                                    accountId: account.id
                                }, cb);
                            },
                            dirs: function (cb, rs) {
                                Directory.whoseParentIs({
                                    parentId: inodeId,
                                    accountId: account.id
                                }, cb);
                            }
                        }, 
                        function (err, results) {
                            apiObj.num_children = results.files.length + results.dirs.length;
                            respond(apiObj);
                        });
                    }

                    // Otherwise if we're just sharing a file, punt it along
                    else {
                        respond(apiObj);
                    }
                }
            });
        }

        // callback for error handling on main async.waterfall method
    ], function (err, result) {
        if (err)
            return console.log(err);
    });

};

/**
 * Update a permission
 augurs
 */
exports.updatePermission = function (req, res) {
    sails.log.info('UpdatePermission:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
    var inodeId = req.param('id');
    var INodeModel = (req.param('controller') == "directory") ? Directory : File;
    var subscribers = INodeModel.roomName(inodeId); // And broadcast activity to all sockets subscribed
    var criteria = {
        AccountId: req.param('AccountId')
    };
    criteria[INodeModel.asForeignKey] = inodeId;
    ((req.param('controller') == 'directory') ? DirectoryPermission : FilePermission)
            .find({where: criteria}).success(function (result) {

        result.type = req.param('permission');
        if (result.AccountId) {
            result.accountId = result.AccountId;
            delete result.AccountId;
        }
        if (result.DirectoryId) {
            result.directoryId = result.DirectoryId;
            delete result.DirectoryId;
        }
        if (result.FileId) {
            result.fileId = result.FileId;
            delete result.FileId;
        }

        result.save().success(function (model) {

            var apiObj = {
                id: inodeId,
                owned_by: {
                    id: req.param('AccountId')
                },
                permission: req.param('permission')
            };

            _.shout("API OBJECT", apiObj);
            SocketService.broadcast('COLLAB_UPDATE_COLLABORATOR', subscribers, apiObj);
            res.json({// Send API response
                success: true
            });
        });
    });
};

/**
 *
 * Remove a permission
 */
exports.removePermission = function (req, res) {
    sails.log.info('RemovePermission:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
    var inodeId = req.param('id');
    var INodeModel = (req.param('controller') == "directory") ? Directory : File;
    var subscribers = INodeModel.roomName(inodeId); // And broadcast activity to all sockets subscribed
    async.waterfall([
        // Get info about the node we're trying to add permissions for


        function (callback) {
            INodeModel.find(inodeId).success(function (inode) {
                callback(null, inode);
            });
        },
        // Now that we have the node, find the account record for the user
        // we want to give the permsission.  If they don't exist, we'll
        // create them.


        function (inode, callback) {
            Account.permit(null, inode, req.param('AccountId'), function (err, result) {
                var apiObj = {
                    id: inodeId,
                    owned_by: {
                        id: req.param('AccountId')
                    }
                };
                SocketService.broadcast('COLLAB_REMOVE_COLLABORATOR', subscribers, apiObj);

                // Send API response
                res.json({
                    success: true
                });
            });
        }]);
},
        /**
         * Mark self as an active user in this directory
         */
        exports.join = function (req, res) {
            if (req.isSocket) {
                var inodeId = req.param('id');
                var INodeModel = (req.param('controller') == "directory") ? Directory : File;
                var subscribers = INodeModel.roomName(inodeId); // And broadcast activity to all sockets subscribed to the comment's parent item
                req.socket.join(INodeModel.activeRoomName(inodeId));
                SocketService.broadcast('ACCOUNT_JOIN', subscribers, _.extend(APIService.Account(req.session.Account), {
                    num_active: INodeModel.getNumActiveUsers(inodeId),
                    part_of: {
                        id: inodeId,
                        type: req.param('controller')
                    }
                }));
            } else {
                SocketService.wrongTransportError(res);
            }
        },
// Remove the logged-in account from the list of active accounts
        exports.leave = function (req, res) {
            if (req.isSocket) {
                var inodeId = req.param('id');
                var INodeModel = (req.param('controller') == "directory") ? Directory : File;
                var subscribers = INodeModel.roomName(inodeId);

                if (!_.isFinite(inodeId)) {
                    //throw new Error("Trying to leave NULL inode!");
                }
                else{
                    // And broadcast activity to all sockets subscribed to the comment's parent item
                    req.socket.leave(INodeModel.activeRoomName(inodeId));
                    SocketService.broadcast('ACCOUNT_LEAVE', subscribers, _.extend(APIService.Account(req.session.Account), {
                        num_active: INodeModel.getNumActiveUsers(inodeId),
                        part_of: {
                            id: inodeId,
                            type: req.param('controller')
                        }
                    }));
                }
            } else {
                SocketService.wrongTransportError(res);
            }
        },
// Add new comment
        exports.addComment = function (req, res) {
            var request = require('request');

            var foreignKey = (req.param('controller') == 'directory') ? 'directoryId' : 'fileId';
            var Model = (req.param('controller') == 'directory') ? Directory : File;
            var properties = {
                payload: req.param('payload'),
                // Get the posting user's account id from the session
                accountId: req.session.Account && req.session.Account.id
            };

            properties[foreignKey] = req.param('id');
            // properties[Model.asForeignKey] = req.param('id');
            Comment.create(properties).success(afterwards);



            // After creating the new comment,


            function afterwards(comment) {


                if (req.isSocket) {
                    var subscribers = Model.roomName(req.param('id'));

                    // TODO: replace this with the version below
                    // Respond with a simple acks and broadcast activity to all
                    // sockets subscribed to the comment's parent item.
                    SocketService.broadcast('COMMENT_CREATE', subscribers, APIService.Comment(_.extend(comment, {
                        ItemId: req.param('id'),
                        avatar_image: req.session.Account && req.session.Account.avatar_image,
                        AccountName: req.session.Account && req.session.Account.name
                    })));

                    // Join active subscriber room for this model
                    req.socket.join(Model.activeRoomName(req.param('id')));

                    // TODO: THIS DOES NOT WORK
                    // Respond with increament to num comments to the same inode with the same id
                    // SocketService.broadcast('ITEM_COMMENT', subscribers, APIService.Comment(_.extend(comment,{
                    //  num_comments: Model.getNumComments(req.param('id')),
                    //  ItemId      : req.param('id')
                    // })));

                    /*Create logging*/
                    Model.find(req.param('id')).success(function (mod) {

                        var options = {
                            uri: 'http://localhost:1337/logging/register/',
                            method: 'POST',
                        };

                        var name = req.param('controller') == 'directory' ? 'directory ' : 'file ';

                        options.json = {
                            user_id: req.session.Account.id,
                            text_message: 'has commented on a ' + name + mod.name,
                            activity: 'comment',
                            on_user: req.session.Account.id,
                            client_ip: req.param('ipadd'),
                            ip: req.session.Account.ip,
                            platform: req.headers.user_platform,
                        };

                        request(options, function (err, response, body) {
                            if (err)
                                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                            res.send(200);
                        });
                    });
                    /*Create logging*/

                }

                res.json({
                    success: true
                });
            }
        };

// Remove comment
exports.removeComment = function (req, res) {
    sails.log.info('RemoveComment:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
    if (!req.param('CommentId')) {
        res.json({
            success: false,
            error: 'No comment id specified!'
        });
        return;
    }
    var target = getRequestData(req, res);
    var criteria = {
        id: req.param('CommentId')
    };
    if (target.modelName == 'directory') {
        criteria.DirectoryId = target.id;
    } else {
        criteria.FileId = req.param('id');
    }
    Comment.findAndDelete(criteria, function (err, comment) {
        res.json({
            success: true
        });
    });
}


// Return the comments
exports.activity = function (req, res, cb) {

    var sql = "SELECT *,c.id AS id, a.avatar_image AS avatar, a.name AS AccountName, " + ((req.param('controller') == 'directory') ? "c.FileId " : "c.DirectoryId ") + "AS ItemId " + "FROM comment c " + "LEFT OUTER JOIN " + "account a " + "ON c.AccountId=a.id " + "WHERE " + ((req.param('controller') == 'directory') ? "c.DirectoryId=?" : "c.FileId=?");
    sql = Sequelize.Utils.format([sql, req.param('id')]);
    sequelize.query(sql, Comment).success(function (comments) {

        var apiObj = APIService.Activity.mini(comments);
        if (!cb) {
            res.json(apiObj); // Send API response
        } else {
            cb(null, apiObj);
        }
    }).error(function (e) {
        if (!cb) {
            throw new Error(e);
        } else {
            cb({
                type: "error",
                status: 500
            });
        }
    });
};

exports.version = function (req, res, cb) {

    Version.find({
        where: ['FileId = ' + req.param('id')]
    }).success(function (ver) {

        if (ver.parent_id != '0') {

            var sql = "SELECT v.*, f.*,a.id AS acc_id,a.name AS acc_name FROM version v INNER JOIN file f ON v.FileId = f.id " +
                    " LEFT JOIN account a ON v.AccountId=a.id " +
                    "WHERE (f.deleted IS NULL OR f.deleted=0) AND v.parent_id=?";
            sql = Sequelize.Utils.format([sql, ver.parent_id]);

            sequelize.query(sql, null, {
                raw: true
            }).success(function (models) {
                res.json(APIService.Version.mini(models));
            }).error(function (e) {
                throw new Error(e);
            });

        }

    });

};

exports.comments = function (req, res) {
    INodeService.activity(req, res, function (err, result) {
        if (err) {
            res.json(err, err.status);
        } else {
            res.json({
                "total_count": result.length,
                "entries": result
            });
        }
    });
}

// Allow stronger privileges to override weaker restrictions
exports.expandPermission = function (action) {
    var type = [];

    switch (action) {
        case "read":
            type.push("read");
            type.push("comment");
            type.push("write");
            type.push("admin");
            break;
        case "comment":
            type.push("comment");
            type.push("write");
            type.push("admin");
            break;
        case "write":
            type.push("write");
            type.push("admin");
            break;
        case "admin":
            type.push("admin");
            break;
        default:
            throw new Error("Checking permission on unknown action type," + action + "!");
    }
    return type;
};

exports.enablePublicLink = function (req, res) {
    // Get the correct class
    if ((modelClass = req.param('controller')) == "directory") {
        modelClass = Directory;
    } else if (modelClass == "file") {
        modelClass = File;
    }
    // Get the INode
    modelClass.find(req.param('id')).success(function (model) {
        // Set the public link to enabled / disabled based on the information
        // received in the request
        model.public_link_enabled = req.param('enable');
        if (model.AccountId) {
            model.accountId = model.AccountId;
            delete model.AccountId;
        }
        if (model.DirectoryId) {
            model.directoryId = model.DirectoryId;
            delete model.DirectoryId;
        }
        if (model.FileId) {
            model.fileId = model.FileId;
            delete model.FileId;
        }
        model.save().success(function (model) {
            var subscribers = modelClass.roomName(req.param('id'));
            // Broadcast a message to everyone watching this INode to update
            // accordingly.
            SocketService.broadcast('PUBLIC_LINK_ENABLE', subscribers, {
                id: req.param('id'),
                enable: req.param('enable')
            });
        });
    });
};

exports.enableLinkPassword = function(req, res) {
    // Get the correct class
    if((modelClass = req.param('controller')) == "directory") {
        modelClass = Directory;
    } else if(modelClass == "file") {
        modelClass = File;
    }
    // Get the INode
    modelClass.find(req.param('id')).success(function(model) {
        // Set the public link to enabled / disabled based on the information
        // received in the request
        model.link_password_enabled = req.param('enable');
    if(model.AccountId) {
            model.accountId = model.AccountId;
            delete model.AccountId;
        }
        if (model.DirectoryId) {
            model.directoryId = model.DirectoryId;
            delete model.DirectoryId;
        }
        if (model.FileId) {
            model.fileId = model.FileId;
            delete model.FileId;
        }
        model.save().success(function(model) {
            var subscribers = modelClass.roomName(req.param('id'));
            // Broadcast a message to everyone watching this INode to update
            // accordingly.
            SocketService.broadcast('LINK_PASSWORD_ENABLE', subscribers, {
                id: req.param('id'),
                enable: req.param('enable')
            });
        });
    });
};

exports.changeLinkPassword = function(req, res) {
    // Get the correct class
    if((modelClass = req.param('controller')) == "directory") {
        modelClass = Directory;
    } else if(modelClass == "file") {
        modelClass = File;
    }
    // Get the INode
    modelClass.find(req.param('id')).success(function(model) {
        // Set the public link to enabled / disabled based on the information
        // received in the request
        model.link_password = req.param('password');
        if(model.AccountId) {
            model.accountId = model.AccountId;
            delete model.AccountId;
        }
        if (model.DirectoryId) {
            model.directoryId = model.DirectoryId;
            delete model.DirectoryId;
        }
        if (model.FileId) {
            model.fileId = model.FileId;
            delete model.FileId;
        }
        model.save().success(function(model) {
            var subscribers = modelClass.roomName(req.param('id'));
            // Broadcast a message to everyone watching this INode to update
            // accordingly.
            SocketService.broadcast('LINK_PASSWORD', subscribers, {
                id: req.param('id'),
                link_password: req.param('link_password')
            });
            res.json({
                "success": true
            });
        });
    });
};


exports.assignPermission = function (req, res) {

    console.log(req);

    sails.log("######################################");
    //sails.log.info('AddPermission:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
    sails.log("######################################");
    var request = require('request');
    var inodeId = req.param('id');
    var INodeModel = ((req.param('controller') == "directory") || (req.param('controller') == "tempaccount")) ? Directory : File;

// And broadcast activity to all sockets subscribed
    var subscribers = INodeModel.roomName(inodeId);

    async.waterfall([
// Get info about the node we're trying to add permissions for
        function (callback) {
            INodeModel.find(inodeId).success(function (inode) {
                callback(null, inode);
            });
        },
// Now that we have the node, find the account record for the user
// we want to give the permsission.  If they don't exist, we'll
// create them.

        function (inode, callback) {

// If we've been given the email address of a user, attempt to look the up

            if (req.param('email')) {
                Account.find({
                    where: {
                        email: req.param('email')
                    }
                }).success(function (account) {

// If we find them, move on to the next step (granting the permission)
                    if (account) {
                        callback(null, inode, account);
                    }
// Otherwise, create an account using this email, and create a verification
// code for them.  Then grant permissions to this new user
                    else {

                        var verificationCode = UUIDGenerator.v1();
                        var password = new Array(8);
                        UUIDGenerator.v1(null, password, 0);
                        password = UUIDGenerator.unparse(password);
                        Account.create({
                            name: req.param('email'),
                            email: req.param('email'),
                            password: password,
                            verified: false,
                            verificationCode: verificationCode,
                            subscription_id: '1'
                        }).success(function (newAccount) {
                            callback(null, inode, newAccount);
                        });
                    }
                });
            }
// If we were sent the ID of an existing user, look them up and continue
            else {

                sails.log.debug('checking id of existing user');
                sails.log.debug(req);
                console.log(req.param('owned_by'));
                // sails.log.info('checking owed_by.id: ', req.param('owned_by').id);
                Account.find({
                    where: {
                        email: req.param('owned_by')
                    }
                }).success(function (account) {

                    console.log(account);

                    Account.find(account.id).done(function (err, account) {
                        // if we cannot find the user then pass a
                        if (err) {
                            return callback(err);
                        }
                        callback(null, inode, account);
                    });
                });
            }
        },
// Now that we have a user and an inode, go ahead and grant the permissions
        function (inode, account, callback) {
// Permit this account
            Account.permit(req.param('permission'), inode, account.id, function (err, permission, alreadyExists, isOrphan) {
// If this permission already exists, return failure
                if (alreadyExists) {
                    res.json({
                        success: false
                    });
                }
// Respond and broadcast to client(s)
                else {
                    var apiObj = (req.param('controller') == "directory") ? APIService.Directory.mini(inode) : APIService.File.mini(inode);
                    _.extend(apiObj, {
                        id: inodeId,
                        part_of: {
                            id: inodeId,
                            type: req.param('controller')
                        },
                        owned_by: APIService.Account.mini(account),
                        orphan: isOrphan,
                        permission: req.param('permission') || 'comment',
                        type: 'permission',
                        nodeType: req.param('controller')
                    });

                    // Send an email to the user we granted permissions to.  If they're a new
                    // user, send them the verification link.  Otherwise, just send them an update.
                    var options = {
                        accountName: req.session.Account.name,
                        account: account,
                        inode: inode,
                        host: req.header('host'),
                        port: req.port,
                        controller: req.param('controller')
                    };
                    // EmailService.sendInviteEmail(options);
                    EmailServices.sendEmail('invite', options);

                    // Create a response function--we're not quite ready with the response object yet though...
                    var respond = function (response) {
                        SocketService.broadcast('COLLAB_ADD_COLLABORATOR', subscribers, apiObj);
                        SocketService.broadcast('COLLAB_ADD_COLLABORATOR', "Account_" + account.id, response);
                        res.json(response);
                    };

                    // If it's a directory that was shared, count up the children that the new user
                    // can see, and add it to the response object so that the directory icon has an
                    // expand arrow in the UI if necessary
                    if (req.param('controller') == 'directory') {
                        async.auto({
                            files: function (cb, rs) {
                                File.whoseParentIs({
                                    parentId: inodeId,
                                    accountId: account.id
                                }, cb);
                            },
                            dirs: function (cb, rs) {
                                Directory.whoseParentIs({
                                    parentId: inodeId,
                                    accountId: account.id
                                }, cb);
                            }
                        }, function (err, results) {
                            apiObj.num_children = results.files.length + results.dirs.length;
                            respond(apiObj);
                        });
                    }

                    // Otherwise if we're just sharing a file, punt it along
                    else {
                        respond(apiObj);
                    }
                }
            });
        }

        // callback for error handling on main async.waterfall method
    ], function (err, result) {
        if (err)
            return console.log(err);
    });

};

// Get data about the request
var getRequestData = exports.getRequestData = function (req, res) {
    var id = req.param('id'),
            Model;
    if ((Model = req.param('controller')) == "directory") {
        Model = Directory;
    } else if (Model == "file") {
        Model = File;
    } else {
        debug.error("Trying to perform inode operation on unknown controller:", Model, "req.params=", req.params);
        throw new Error("Trying to perform inode operation on unknown controller!");
    }

    return {
        // Transport context
        id: id,
        Model: Model,
        modelName: Model.getModelName().toLowerCase(),
        getModelName: Model.getModelName,
        subscribers: Model.roomName(id),
        active: Model.activeRoomName(id)
    };
};