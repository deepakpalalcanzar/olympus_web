var mime = require('mime');
var easyimg = require('easyimage');
var fsx     = require('fs-extra');
var policy = sails.policies;
var count_img = 0;
var google = require('googleapis');

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
            ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
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


/*

    items: function (req, res) {

        
        var tasks = [];
        // If the "name" is set, attempt to rename the dir
        tasks.push(function (cb) {
            DirectoryController.fileDownload(req, res, cb);
        });

        // If the "parent" is set, attempt a move
        tasks.push(function (cb) {
            DirectoryController.response(req, res, cb);
        });

        // Try to perform all the changes. If an error occurs at any point,
        // the error message will be sent back.  Otherwise, the updated
        // API object will be sent back.
        async.series(tasks, function (err, results) {
            if (err) {
                res.json(err, err.status);
            } else {
                res.json(results, err.status);
            }
        });

        // var response = {
        //     "item_collection": {
        //         "total_count": items.length,
        //         "limit": items.length,
        //         "offset": "0",
        //         "entries": items
        //     }
        // };
        // res.json(response);

       
    },


    response: function(req, res, cb){
        DirectoryController.ls(req, res, function (items) {
            var response = {
                "item_collection": {
                    "total_count": items.length,
                    "limit": items.length,
                    "offset": "0",
                    "entries": items
                }
            };
            cb(response);
        });
    },

    fileDownload: function(req, res, cb){

        var today = new Date();


        DirectoryController.ls(req, res, function (items) {
            async.eachSeries(items, function (item, index) {

                mimetype = item.mimetype;

                if(mimetype == null){
                    return;
                }else{
                    
                    var fileType = mimetype.split("/");

                    if(fileType[0] === 'image'){

                        var imgPath = '/var/www/html/olympus/public/images/demo/'+item.fsName; 
                        var thumbImgPath = '/var/www/html/olympus/public/images/demo/thumbnail-'+item.fsName; 

                        fsx.exists(imgPath , function(exists) { 

                            console.log(exists);
                            if(exists){

                                fsx.exists(thumbImgPath , function(exists) { 
                                    if(exists){
                                        fsx.unlink(imgPath);
                                    }else{
                                        easyimg.resize({
                                            src: sails.config.appPath + "/public/demo/"+item.fsName+"."+fileType[1], 
                                            dst: sails.config.appPath + '/public/demo/thumbnail-'+item.fsName+"."+fileType[1], width: 150, height: 150
                                        }).then(
                                            function(image) {
                                                fsx.unlink(imgPath);
                                                console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
                                            },
                                            function (err) {
                                                console.log(err);
                                            }
                                        );
                                    }
                                });

                            }else{

                                // Download and serve file from s3 and swift
                                FileAdapter.download({
                                    name: item.fsName
                                }, function (err, data, contentLength, stream) {

                                    if (err)
                                        return res.send(500, err);
                                    
                                    var fileMimeType = mime.lookup(item.name);
                                    var mimeFile     = fileMimeType.split("/");

                                    // Set content-length header
                                    res.setHeader('Content-Length', item.size);

                                    // set content-type header
                                    res.setHeader('Content-Type', fileMimeType);

                                    // No data available
                                    if (!data && !stream) {
                                        return res.send(404);
                                    } else if (!data) { // Stream file (Swift)

                                        stream.pipe(fs.createWriteStream(sails.config.appPath + "/public/demo/"+item.fsName+"."+fileType[1]));
                                        stream.on('end', function() {
                                            easyimg.resize({
                                                src: sails.config.appPath + "/public/demo/"+item.fsName+"."+fileType[1], 
                                                dst: sails.config.appPath + '/public/demo/thumbnail-'+item.fsName+"."+fileType[1], width: 150, height: 150
                                            }).then(
                                                function(image) {
                                                    console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
                                                },
                                                function (err) {
                                                    console.log(err);
                                                }
                                            );
                                        });
                                    }
                                });
                            }
                        });
                    }
                }

            }, function(err){
		cb();

		});
        });
    },



    response: function(req, res, cb){
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
*/

    /*response: function(req, res, cb){
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

     items: function (req, res) {

        var today = new Date();
        var count = 0;
        DirectoryController.ls(req, res, function (items) {
		console.log('UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU');
            DirectoryController.check_thumbnail(items[0],function(){
                console.log('YYHYYHYYHYYHYYHYYHYYHYYHYYHYYHYYHYYHYYHYYHYYHYYHYYHYYH');
            });
            _.each(items, function (item, index) {
		 

                mimetype = item.mimetype;
		
                if(mimetype == null){
                    return;
        			count_img++;
        			count++;
        			response_ready(req, res);
                }else{
                    
                    var fileType = mimetype.split("/");

                    if(fileType[0] === 'image'){

                        var imgPath = '/var/www/html/olympus/public/images/demo/'+item.fsName; 
                        var thumbImgPath = '/var/www/html/olympus/public/images/demo/thumbnail-'+item.fsName; 
		
                        fsx.exists(imgPath , function(exists) { 

                            console.log(exists);
                            if(exists){

                                fsx.exists(thumbImgPath , function(exists) { 
                                    if(exists){
                                        fsx.unlink(imgPath);
                                    }else{
                                        easyimg.resize({
                                            src: sails.config.appPath + "/public/demo/"+item.fsName+"."+fileType[1], 
                                            dst: sails.config.appPath + '/public/demo/thumbnail-'+item.fsName+"."+fileType[1], width: 150, height: 150
                                        }).then(
                                            function(image) {
                                                fsx.unlink(imgPath);
                                                console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
                                            },
                                            function (err) {
                                                console.log(err);
                                            }
                                        );
                                    }
                                });
                				count++;
                                count_img++;
                                response_ready(req, res);

                            }else{

                                // Download and serve file from s3 and swift
                                FileAdapter.download({
                                    name: item.fsName
                                }, function (err, data, contentLength, stream) {

                                    if (err)
                                        return res.send(500, err);
                                    
                                    var fileMimeType = mime.lookup(item.name);
                                    var mimeFile     = fileMimeType.split("/");

                                    // Set content-length header
                                    res.setHeader('Content-Length', item.size);

                                    // set content-type header
                                    res.setHeader('Content-Type', fileMimeType);

                                    // No data available
                                    if (!data && !stream) {
                                        return res.send(404);
                                    } else if (!data) { // Stream file (Swift)

                                        stream.pipe(fs.createWriteStream(sails.config.appPath + "/public/demo/"+item.fsName+"."+fileType[1]));
                                        stream.on('end', function() {
                                            easyimg.resize({
                                                src: sails.config.appPath + "/public/demo/"+item.fsName+"."+fileType[1], 
                                                dst: sails.config.appPath + '/public/demo/thumbnail-'+item.fsName+"."+fileType[1], width: 150, height: 150
                                            }).then(
                                                function(image) {
                                                    count++;
                                                    count_img++;
                                                    console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
                        						    console.log(count+'  HH  '+count_img);
                        							//response_ready(req, res);
                                                    if(items.length === (count_img + 1) ){
                                                       console.log("RESPONDING NOW with "+items.length);
                                                       DirectoryController.response(req, res);
                                                        console.log("count is : "+count);
                                                    }
                                                },
                                                function (err) {
                                                    count++;
                                                    count_img++;
                                                    console.log(err);
                                                    console.log(count+'  HH  '+count_img);
                                                    response_ready(req, res);
                                                }
                                            );
                                        });
                                    }
                                });
				
                            }
                        });
			//count++;
			//count_img++;
                    }
                }

		        // console.log("itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems");
          //       console.log(items.length);
          //       console.log("itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems");
          //       console.log(count);
          //       console.log("itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems");
          //       if(items.length === (count + 1) ){
          //           DirectoryController.response(req, res);
          //       }

            });
        });
    },

    check_thumbnail: function(item, cb){
        // _.each(items, function (item, index) {
         
console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                mimetype = item.mimetype;
        
                if(mimetype == null){
                    return;
                    count_img++;
                    count++;
                    response_ready(req, res);
                }else{
                    
                    var fileType = mimetype.split("/");

                    if(fileType[0] === 'image'){

                        var imgPath = '/var/www/html/olympus/public/images/demo/'+item.fsName; 
                        var thumbImgPath = '/var/www/html/olympus/public/images/demo/thumbnail-'+item.fsName; 
        
                        fsx.exists(imgPath , function(exists) { 

                            console.log(exists);
                            if(exists){

                                fsx.exists(thumbImgPath , function(exists) { 
                                    if(exists){
                                        fsx.unlink(imgPath);
                                    }else{
                                        easyimg.resize({
                                            src: sails.config.appPath + "/public/demo/"+item.fsName+"."+fileType[1], 
                                            dst: sails.config.appPath + '/public/demo/thumbnail-'+item.fsName+"."+fileType[1], width: 150, height: 150
                                        }).then(
                                            function(image) {
                                                fsx.unlink(imgPath);
                                                console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
                                            },
                                            function (err) {
                                                console.log(err);
                                            }
                                        );
                                    }
                                });
                                count++;
                                count_img++;
                                response_ready(req, res);

                            }else{

                                // Download and serve file from s3 and swift
                                FileAdapter.download({
                                    name: item.fsName
                                }, function (err, data, contentLength, stream) {

                                    if (err)
                                        return res.send(500, err);
                                    
                                    var fileMimeType = mime.lookup(item.name);
                                    var mimeFile     = fileMimeType.split("/");

                                    // Set content-length header
                                    res.setHeader('Content-Length', item.size);

                                    // set content-type header
                                    res.setHeader('Content-Type', fileMimeType);

                                    // No data available
                                    if (!data && !stream) {
                                        return res.send(404);
                                    } else if (!data) { // Stream file (Swift)

                                        stream.pipe(fs.createWriteStream(sails.config.appPath + "/public/demo/"+item.fsName+"."+fileType[1]));
                                        stream.on('end', function() {
                                            easyimg.resize({
                                                src: sails.config.appPath + "/public/demo/"+item.fsName+"."+fileType[1], 
                                                dst: sails.config.appPath + '/public/demo/thumbnail-'+item.fsName+"."+fileType[1], width: 150, height: 150
                                            }).then(
                                                function(image) {
                                                    count++;
                                                    count_img++;
                                                    console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
                                                    console.log(count+'  HH  '+count_img);
                                                    //response_ready(req, res);
                                                    if(items.length === (count_img + 1) ){
                                                       console.log("RESPONDING NOW with "+items.length);
                                                       DirectoryController.response(req, res);
                                                        console.log("count is : "+count);
                                                    }
                                                },
                                                function (err) {
                                                    count++;
                                                    count_img++;
                                                    console.log(err);
                                                    console.log(count+'  HH  '+count_img);
                                                    response_ready(req, res);
                                                }
                                            );
                                        });
                                    }
                                });
                
                            }
                        });
            //count++;
            //count_img++;
                    }
                }

        //console.log("itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems");
                //console.log(items.length);
                //console.log("itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems");
                //console.log(count);
                //console.log("itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems");
                //if(items.length === (count + 1) ){
                //    DirectoryController.response(req, res);
                //}

            // });
    },

    response_ready: function(req, res){
	   console.log("itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems");
 //        console.log(items.length);
 //        console.log("itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems");
 //        console.log(count_img);
 //        console.log("itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems itemsitemsitems");
        if(items.length === (count_img + 1) ){
	       console.log("RESPONDING NOW with "+items.length);
           DirectoryController.response(req, res);
            console.log("count is : "+count);
        }
    },*/


    items: function (req, res) {
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
    
    syncdriveold: function (req, res) {

console.log('checkedcheckedcheckedcheckedcheckedcheckedcheckedchecked');
        var request = require('request');

        
        var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dir.OwnerId =? AND dir.isWorkgroup = 1";//where dp.AccountId =?
        sql = Sequelize.Utils.format([sql, req.session.Account.id]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (workgroup) {

            if(workgroup.length > 0){
                var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dir.DirectoryId = ? AND dir.name = ?";//where dp.AccountId =?
                sql = Sequelize.Utils.format([sql, workgroup[0].id, 'GOOGLE DRIVE']);

                drivenodearr = req.param('drivenode');
                if(drivenodearr.length > 0){
                    async.auto({
                        checkdir: function (cb) {

                            console.log(sql);
                            sequelize.query(sql, null, {
                                raw: true
                            }).success(function (directory) {
                                if(directory.length > 0){
                                    console.log('directoryFOUNDdirectoryFOUNDdirectoryFOUND');
                                    cb(null, directory[0]);
                                }else{
                                    console.log('creatingDRIVEcreatingDRIVEcreatingDRIVEcreatingDRIVE');
                                    Directory.create({
                                        name: 'GOOGLE DRIVE',
                                        directoryId: workgroup[0].id
                                    }).done(function(err, newdir){

                                        if(err)
                                            return res.send(err, 500);

                                        DirectoryPermission.create({
                                            type: 'admin',
                                            accountId: req.session.Account.id,
                                            directoryId: newdir.id
                                        }).done(function(donepermission){
                                            console.log(donepermission);
                                            cb(null, newdir);
                                        });
                                    });
                                }
                            }).error(function (e) {
                                return res.send(e, 500);
                                // throw new Error(e);
                            });
                        },
                        newDirectory: ['checkdir', function (cb, r) { // Create the new directory
                            console.log(r.checkdir.id);
                            parentDir = r.checkdir;
                            drivenodearr = req.param('drivenode');
                            console.log('drivenodedrivenodedrivenodedrivenode');
                            console.log(drivenodearr.length);
                            console.log('drivenodedrivenodedrivenodedrivenode');

                            if(drivenodearr.length > 0){
                                var apiResponse_entries = [];
                                _.each(drivenodearr, function( drivenode, i ){

                                    File.findAll({where:{
                                        'fsName': drivenode.fsName,
                                        // 'md5checksum': drivenode.md5checksum
                                    }}).done(function(err, fileModel){
                                        if(err)
                                            return res.send(err, 500);

                                        if(fileModel.length > 0){
                                            var apiResponse = APIService.File.mini(fileModel);
                                            apiResponse_entries.push(apiResponse);

                                            console.log('apiResponse.entriesapiResponse.entriesapiResponse.entries');
                                            console.log(apiResponse);
                                            // apiResponse.parent.id = options.parentId;
                                        }else{
                                            File.handleUpload({
                                                name: drivenode.name,
                                                size: drivenode.size,
                                                type: drivenode.mimetype,
                                                fsName: drivenode.fsName,
                                                oldFile: 0,
                                                version: drivenode.version,
                                                parentId: parentDir.id,//parsedFormData.parent.id,
                                                // replaceFileId: req.param('replaceFileId'),
                                                account_id: req.session.Account.id, // AF
                                                thumbnail: "0",
                                                md5checksum: drivenode.md5checksum
                                            }, function (err, resultSet) {

                                                if (err)
                                                    return res.send(err, 500);
                                                var response = {
                                                    total_count: resultSet.length,
                                                    entries: resultSet
                                                };
                                                return res.json(response);

                                            });
                                            console.log('FILE Does not exist');
                                        }

                                        if( i + 1 == drivenodearr.length ) {
                                             // Callback goes here
                                            var response = {
                                                total_count: apiResponse_entries.length,
                                                entries: apiResponse_entries
                                            };

                                            console.log('responseresponseresponseresponseresponse');
                                            console.log(response);
                                            return res.json(response);
                                        }
                                    });
                                    /*File.handleUpload({
                                        name: drivenode.name,
                                        size: drivenode.size,
                                        type: drivenode.mimetype,
                                        fsName: drivenode.fsName,
                                        oldFile: 0,
                                        version: drivenode.version,
                                        parentId: parentDir.id,//parsedFormData.parent.id,
                                        // replaceFileId: req.param('replaceFileId'),
                                        account_id: req.session.Account.id, // AF
                                        thumbnail: "0",
                                        md5checksum: drivenode.md5checksum
                                    }, function (err, resultSet) {

                                        if (err)
                                            return res.send(err, 500);
                                        var response = {
                                            total_count: resultSet.length,
                                            entries: resultSet
                                        };
                                        return res.json(response);

                                    });*/
                                });
                                
                                /*var response = {
                                    total_count: apiResponse_entries.length,
                                    entries: apiResponse_entries
                                };

                                console.log('responseresponseresponseresponseresponse');
                                console.log(response);
                                return res.json(response);*/
                                
                            }
                        }]
                    });
                }
                    
                    if(true){//directory.length > 0
                        // drivedata = req.param('data');
                        // if(drivedata.length > 0){
                        //     _.each(drivedata, function (drivenode) {

                        //         oauth2Client = req.param('oauthToken');

                        //         var drive = google.drive({ version: 'v2', auth: oauth2Client });

                                /*drive.files.create({
                                  resource: {
                                    name: 'Test',
                                    mimeType: 'text/plain'
                                  },
                                  media: {
                                    mimeType: 'text/plain',
                                    body: 'Hello World'
                                  }
                                }, function(datafour, datafive){
                                    console.log('datafourdatafourdatafourdatafour');
                                    console.log(datafour);
                                    console.log(datafive);
                                    console.log('datafivedatafivedatafivedatafive');
                                });*/
console.log('METHOD22222222222222222222222222222');
                                /*google.client.load('drive', 'v2', function(){
                                    var testin = google.client.drive.files.get({
                                      'fileId': drivenode.id
                                    });
                                    testin.execute(function(resp) {
                                      console.log('Title: ' + resp.title);
                                      console.log('Description: ' + resp.description);
                                      console.log('MIME type: ' + resp.mimeType);
                                    });
                                });*/
                                // drivenode

                                /*drivenode = req.param('drivenode');
                                console.log('drivenodedrivenodedrivenodedrivenode');
                                console.log(drivenode);
                                console.log('drivenodedrivenodedrivenodedrivenode');
                                File.handleUpload({
                                    name: drivenode.name,
                                    size: drivenode.size,
                                    type: drivenode.mimetype,
                                    fsName: drivenode.fsName,
                                    oldFile: 0,
                                    version: drivenode.version,
                                    parentId: directory[0].id,//parsedFormData.parent.id,
                                    // replaceFileId: req.param('replaceFileId'),
                                    account_id: req.session.Account.id, // AF
                                    thumbnail: "0",
                                    md5checksum: drivenode.md5checksum
                                }, function (err, resultSet) {

                                    if (err)
                                        return res.send(err, 500);
                                    var response = {
                                        total_count: resultSet.length,
                                        entries: resultSet
                                    };
                                    return res.json(response);

                                });*/
                        //     });
                        // }else{
                        //     return res.send(500, "Drive is empty. Nothing to sync.");
                        // }
                        // res.json(directory[0], 200);
                    }else{//create the 'GOOGLE DRIVE' directory in Workgroup
                        /*Directory.create({
                            name: 'GOOGLE DRIVE',
                            directoryId: workgroup[0].id
                        }).done(function(err, newdir){
                            console.log(newdir);
                            // console.log(datatwo);

                            DirectoryPermission.create({
                                type: 'admin',
                                accountId: req.session.Account.id,
                                directoryId: newdir.id
                            }).done(function(donepermission){
                                console.log(donepermission);
                                res.json(directory, 200);
                            });

                            console.log('dataonedataonedataonedataone');
                            res.json(directory, 200);
                        });*/
                    }
                
            }else{
                return res.send(500, "No Workgroup Found for this account.");
            }
        }).error(function (e) {
            return res.send(e, 500);
            // throw new Error(e);
        });
            /*if (_.isUndefined(req.param('parent').id)) {
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

                // Create logging
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
                        ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                        platform: req.headers.user_platform,
                    };

                    request(options, function (err, response, body) {
                        if (err)
                            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    });
                });
                // Respond with new directory
                res.json(apiResponse);
            });*/
    },

    syncdrive : function(req, res) {
        console.log('TEST33TEST33TEST33TEST33TEST33TEST33TEST33TEST33TEST33TEST33TEST33TEST33');

        // If modifying these scopes, delete your previously saved credentials
        // at ~/.credentials/drive-nodejs-quickstart.json
        // var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
        var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
            process.env.USERPROFILE) + '/.credentials/';
        // var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

        // Load client secrets from a local file.
        // fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {
        //   if (err) {
        //     console.log('Error loading client secret file: ' + err);
        //     return;
        //   }
        //   // Authorize a client with the loaded credentials, then call the
        //   // Drive API.
        //  var credentials = JSON.parse(content);

        SiteOptions.find({where: {id: 1}}).done(function (err, credentials) {

            if (err)
                return res.json({error: err, type: 'error'});

            if(credentials.gdriveSync){
              console.log('========================================================================');
              console.log(req.param('drive_action'));
              // console.log('========================================================================');
              DirectoryController.authorize(req.param('drive_action'), req.session.Account.id, req.param('refresh_token'), credentials, function (auth, driveUploadPathId) {

                if(typeof auth.authorizeUrl != 'undefined' ){

                    return res.json(auth);//auth.authorizeUrl;
                }else{

                    console.log('==================================================');
                    console.log('auth, driveUploadPathId', auth, driveUploadPathId);
                    console.log('==================================================');

                    //string 'olympusNextPageToken' provided to differentiate the undefined case(last page of drive api returns undefined in nextPageToken )  in recursive function to avoid repeating the recursive function from start
                    DirectoryController.fileListDrive(auth, req.session.Account.id, 'olympusNextPageToken', 'root', null, 0, driveUploadPathId, credentials, function(code){

                        if(typeof code.authorizeUrl != 'undefined' ){
                            return res.json(code);//auth.authorizeUrl;
                        }
                        // if(code == 'invalid_grant'){
                        //     DirectoryController.authorize('new_drive_token', req.session.Account.id, req.param('refresh_token'), credentials, function (auth, driveUploadPathId) {

                        //         console.log('new_drive_tokennew_drive_tokennew_drive_tokennew_drive_tokennew_drive_tokennew_drive_token');
                        //         console.log(auth, driveUploadPathId);
                        //         console.log('new_drive_tokennew_drive_tokennew_drive_tokennew_drive_tokennew_drive_tokennew_drive_token');
                        //     });
                        // }

                        console.log('finishedFINISHEDfinishedFINISHEDfinishedFINISHEDfinishedFINISHED');
                    });
                }
              });//authorize
            }else{
                return res.json({error: 'driveSyncDisabled', type: 'error'});
            }
        });
        // });//fs.readFile

        // var google = require('googleapis');
        /*var OAuth2 = google.auth.OAuth2;
        var oauth2Client = new OAuth2(
            '747113141822-fo8de0e6ih03igt34q77l2s4hm20k1rb.apps.googleusercontent.com',//YOUR_CLIENT_ID
            '2cwuJD-_Cdzeq9-qAynrHfXC',//YOUR_CLIENT_SECRET
            'urn:ietf:wg:oauth:2.0:oob'//YOUR_REDIRECT_URL
        );
        var service = google.drive({ version: 'v2', auth: oauth2Client });

        var url = oauth2Client.generateAuthUrl({
          // 'online' (default) or 'offline' (gets refresh_token)
          access_type: 'offline',

          // If you only need one scope you can pass it as string
          scope: scopes
        });*/
    },

    authorize: function (drive_action, accountId, refresh_token, credentials, callback) {

        console.log('save_drive_token1111');
        var googleAuth = require('google-auth-library');

        console.log(credentials);
        // IF json Token file
        // var clientSecret = credentials.installed.client_secret;
        // var clientId = credentials.installed.client_id;
        // var redirectUrl = credentials.installed.redirect_uris[0];

        //If from database
        var clientSecret = credentials.gdriveClientSecret;
        var clientId = credentials.gdriveClientId;
        var redirectUrl = credentials.gdriveRedirectUri;

        var auth = new googleAuth();
        console.log(clientId);
        console.log(clientSecret);
        console.log(redirectUrl);
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        //change for different users
        // var TOKEN_PATH = sails.config.appPath + "/public/drive_tokens/" + 'drive-nodejs-quickstart.json';

        // Check if we have previously stored a token.
        // fs.readFile(TOKEN_PATH, function(err, token) {
        //     if (err) {
        //         console.log('drive_actiondrive_actiondrive_actiondrive_action'+drive_action);
        //         if(drive_action == 'check_drive_token'){
        //             DirectoryController.getNewToken(oauth2Client, callback);
        //         }else if(drive_action == 'save_drive_token'){
        //             DirectoryController.saveToken(refresh_token, oauth2Client, callback);
        //         }
        //     } else {
        //       oauth2Client.credentials = JSON.parse(token);
        //       console.log('oauth2Clientoauth2Clientoauth2Clientoauth2Client : ', oauth2Client);
        //       callback(oauth2Client, 1);
        //     }
        // });
        
        var cloud_options;
        
        if(drive_action == 'file_open_by_pathID' || drive_action == 'file_delete_by_pathID'){
            cloud_options = { id: accountId };//account ID not available to shared account in subscription/pDownload nor do we need to fetch, we can make use of uploadPathId
        }else{
            cloud_options = { accountId: accountId };
        }

        CloudPaths.find({where: cloud_options}).done(function (err, cloudpath) {

            if(err){
                console.log('CloudPaths.find ERROR: ', err);
                return;
            }
            
            if(drive_action == 'save_drive_token' ){
                if(cloudpath){
                    // cloudpath.access_token      = tokens.access_token;
                    // cloudpath.refresh_token     = tokens.refresh_token;
                    // cloudpath.token_type        = tokens.token_type;
                    // cloudpath.expiry_date       = tokens.expiry_date;

                    // cloudpath.save().success(function (model) {
                        
                    //     callback(oauth2Client, cloudpath.id);
                    // });
                    DirectoryController.saveToken(accountId, refresh_token, oauth2Client, cloudpath, callback);
                }else{
                    DirectoryController.saveToken(accountId, refresh_token, oauth2Client, null, callback);
                }
            }

            if(cloudpath){
                oauth2Client.credentials = {
                    "access_token"      : cloudpath.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                    "refresh_token"     : cloudpath.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                    "token_type"        : cloudpath.token_type,//"Bearer",
                    "expiry_date"       : cloudpath.expiry_date,//1481041473357
                };
                // console.log(oauth2Client);
                if(drive_action == 'new_drive_token'){
                    // DirectoryController.refreshToken(accountId, refresh_token, oauth2Client, callback);
                    DirectoryController.refreshToken(oauth2Client, cloudpath, callback);
                    /*oauth2Client.refreshAccessToken(function(err, tokens){

                        if (err) {
                            console.log('Error while trying to refresh token', err);
                            return DirectoryController.getNewToken(oauth2Client, callback);
                            // return;
                        }

                        console.log('Refresh tokens: ', tokens);

                        oauth2Client.credentials = {
                            "access_token"      : tokens.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                            "refresh_token"     : tokens.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                            "token_type"        : tokens.token_type,//"Bearer",
                            "expiry_date"       : tokens.expiry_date,//1481041473357
                        };

                        cloudpath.access_token      = tokens.access_token;
                        cloudpath.refresh_token     = tokens.refresh_token;
                        cloudpath.token_type        = tokens.token_type;
                        cloudpath.expiry_date       = tokens.expiry_date;

                        cloudpath.save().success(function (model) {
                            
                            callback(oauth2Client, cloudpath.id);
                        });

                        // callback(oauth2Client, cloudpath.id);

                        // response.send({
                        //     access_token: tokens.access_token
                        // });
                    });*/
                }else{

                    console.log('oauth2Clientoauth2Clientoauth2Clientoauth2Client : ', oauth2Client);
                    // callback(oauth2Client, cloudpath.id);
                    DirectoryController.verifyToken(oauth2Client, cloudpath, callback);
                }
            }else{
                DirectoryController.getNewToken(oauth2Client, callback);
            }
        });
    },

    //author:Rishabh
    verifyToken: function (oauth2Client, cloudpath, callback){
      // var access_token = 'ya29.Ci-1A8g7K0Se1Kn5hP7agX6BdoRBauY3h2WUBtr5nkFSIKJUuXOe_AksAQG7PrXw7g';

      var http = require('https');
      var url = 'www.googleapis.com';;

      var options = {
        host: url,
        port: 443,
        path: '/oauth2/v1/tokeninfo?access_token='+oauth2Client.credentials.access_token,
        method: 'GET',
        // headers: { //We can define headers too
        //   'X-Auth-Token': 'ade8654ab03e4e1c9e141811310ab7e1'//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
        // },
        rejectUnauthorized: false
      };

      http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        // res.setEncoding('utf8');
        res.on('data', function (chunk) {
          tokenBody = JSON.parse(chunk);
          if(typeof tokenBody.error == 'undefined' && tokenBody.expires_in > 300){
            console.log('DRIVE TOKEN EXPIRES IN: ', tokenBody.expires_in);
            callback(oauth2Client, cloudpath.id);
          }else{
            console.log('DRIVE TOKEN EXPIRED: ', tokenBody.error);
            DirectoryController.refreshToken(oauth2Client, cloudpath, callback);
            /*oauth2Client.refreshAccessToken(function(err, tokens){

                if (err) {
                    console.log('Error while trying to refresh token', err);
                    return DirectoryController.getNewToken(oauth2Client, callback);
                    // return;
                }

                console.log('Refresh tokens: ', tokens);

                oauth2Client.credentials = {
                    "access_token"      : tokens.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                    "refresh_token"     : tokens.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                    "token_type"        : tokens.token_type,//"Bearer",
                    "expiry_date"       : tokens.expiry_date,//1481041473357
                };

                cloudpath.access_token      = tokens.access_token;
                cloudpath.refresh_token     = tokens.refresh_token;
                cloudpath.token_type        = tokens.token_type;
                cloudpath.expiry_date       = tokens.expiry_date;

                cloudpath.save().success(function (model) {
                    
                    callback(oauth2Client, cloudpath.id);
                });

                // callback(oauth2Client, cloudpath.id);

                // response.send({
                //     access_token: tokens.access_token
                // });
            });*/
          }
        });
        res.on('error', function (err) {
          console.log('ERROR: ' + err);
          DirectoryController.getNewToken(oauth2Client, callback);
        });
      }).end();
    },

    //author:Rishabh
    refreshToken: function (oauth2Client, cloudpath, callback){

        oauth2Client.refreshAccessToken(function(err, tokens){

            if (err) {
                console.log('Error while trying to refresh token', err);
                return DirectoryController.getNewToken(oauth2Client, callback);
                // return;
            }

            console.log('Refresh tokens: ', tokens);

            oauth2Client.credentials = {
                "access_token"      : tokens.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                "refresh_token"     : tokens.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                "token_type"        : tokens.token_type,//"Bearer",
                "expiry_date"       : tokens.expiry_date,//1481041473357
            };

            cloudpath.access_token      = tokens.access_token;
            cloudpath.refresh_token     = tokens.refresh_token;
            cloudpath.token_type        = tokens.token_type;
            cloudpath.expiry_date       = tokens.expiry_date;

            cloudpath.save().success(function (model) {
                
                callback(oauth2Client, cloudpath.id);
            });

            // callback(oauth2Client, cloudpath.id);

            // response.send({
            //     access_token: tokens.access_token
            // });
        });
    },

    /**
     * Get new token after prompting for user authorization
     *
     * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback to call with the authorized
     *     client.
     */
    getNewToken: function (oauth2Client, callback) {

        // var readline = require('readline');
        var SCOPES = ['https://www.googleapis.com/auth/drive'];

        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        
        console.log('Authorize this app by visiting this url: ', authUrl);

        callback({'authorizeUrl':authUrl});
        
        // var rl = readline.createInterface({
        //     input: process.stdin,
        //     output: process.stdout
        // });
        
        // rl.question('Enter the code from that page here: ', function(code) {
        //     rl.close();
        //     oauth2Client.getToken(code, function(err, token) {
        //         if (err) {
        //         console.log('Error while trying to retrieve access token', err);
        //         return;
        //         }
        //         oauth2Client.credentials = token;
        //         storeToken(token);
        //         callback(oauth2Client);
        //     });
        // });
    },

    /**
     * Store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     *
     * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback to call with the authorized
     *     client.
     */
    saveToken: function (accountId, code, oauth2Client, cloudpath, callback) {

        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            // DirectoryController.storeToken(accountId, token);
            // callback(oauth2Client);

            if(cloudpath){

                console.log('Updating tokens in DB.');
                cloudpath.access_token      = token.access_token;
                cloudpath.refresh_token     = token.refresh_token;
                cloudpath.token_type        = token.token_type;
                cloudpath.expiry_date       = token.expiry_date;

                cloudpath.save().success(function (model) {
                    
                    callback(oauth2Client, cloudpath.id);
                });
            }else{
                console.log('Inserting tokens in DB.');
                CloudPaths.create({

                    type              : 'drive',
                    access_token      : token.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                    refresh_token     : token.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                    token_type        : token.token_type,//"Bearer",
                    expiry_date       : token.expiry_date,//148
                    accountId         : accountId

                }).done(function foundAdapter (err, tokenrow) {
                    // return res.redirect('/');
                    if(err)
                        console.log('Error in saving Drive Settings for User #'+accountId+' : '+err);

                    console.log('Drive Settings saved for User #'+accountId);
                    callback(oauth2Client, tokenrow.id);
                });
            }
        });
    },

    /**
     * Store token to disk be used in later program executions.
     *
     * @param {Object} token The token to store to disk.
     */
    storeToken: function (accountId, token) {
        /*console.log('uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
        var fs     = require('fs');
        var TOKEN_DIR   = sails.config.appPath + "/public/drive_tokens/"; 
        var TOKEN_PATH  = sails.config.appPath + "/public/drive_tokens/" + 'drive-nodejs-quickstart.json';
        try {
            fs.mkdirSync(TOKEN_DIR);
        } catch (err) {
            if (err.code != 'EEXIST') {
                throw err;
            }
        }
        fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to ' + TOKEN_PATH);*/
    },

    /**
     * Lists the names and IDs of up to 10 files.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    listFiles: function (auth) {

        if(typeof auth.authorizeUrl != 'undefined' ){

            return auth.authorizeUrl;
        }else{
            var service = google.drive('v3');
            service.files.list({
                auth: auth,
                pageSize: 30,
                fields: "nextPageToken, files(id, name)"
            }, function(err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                var files = response.files;
                if (files.length == 0) {
                    console.log('No files found.');
                } else {
                    console.log('Files:');
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        console.log('%s (%s)', file.name, file.id);
                    }
                }
            });
        }
    },

    fileListDrive: function(auth, accountId, nextPageToken, driveFolderID, parentDir, count, driveUploadPathId, credentials, errCallback){
        DirectoryController.recursiveFileListDrive(auth, accountId, nextPageToken, driveFolderID, parentDir, 0, driveUploadPathId, credentials, function(code){
            if(code == 'invalid_grant'){//generate new token
                DirectoryController.authorize('new_drive_token', accountId, nextPageToken, driveFolderID, credentials, function (auth, driveUploadPathId) {

                    console.log('new_drive_tokennew_drive_tokennew_drive_tokennew_drive_tokennew_drive_tokennew_drive_token');
                    console.log(auth, driveUploadPathId);
                    console.log('new_drive_tokennew_drive_tokennew_drive_tokennew_drive_tokennew_drive_tokennew_drive_token');

                    if(typeof auth.authorizeUrl != 'undefined' ){

                        return errCallback(auth);
                        // return res.json(auth);//auth.authorizeUrl;
                    }else{
                        DirectoryController.fileListDrive(auth, accountId, nextPageToken, driveFolderID, parentDir, 0, driveUploadPathId, credentials, errCallback);
                    }
                });
            }
            else if(code == 'ECONNRESET'){
                //Run again

                console.log('Running Again+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=');
                DirectoryController.fileListDrive(auth, accountId, nextPageToken, driveFolderID, parentDir, 0, driveUploadPathId, credentials, errCallback);
            }else{
                console.log('Some Error occurred[fileListDrive]:', code);
            }
        });
    },

    recursiveFileListDrive: function(auth, accountId, nextPageToken, driveFolderID, parentDir, count, driveUploadPathId, credentials, errCallback){
        if(nextPageToken){
            var service = google.drive('v3');
            options = {
                auth: auth,
                pageSize: 5,
                q: "'"+driveFolderID+"' in parents",
                fields: "nextPageToken, files(id, name, mimeType, quotaBytesUsed, hasThumbnail, webViewLink, webContentLink, iconLink, starred, trashed, viewersCanCopyContent, writersCanShare, shared, explicitlyTrashed, version, size, md5Checksum)"
            };
            count = count+1;
            console.log('recursiveFileListDrive CALL: '+count);
            if(nextPageToken && nextPageToken != 'olympusNextPageToken'){//paging token from second api call
                options.pageToken   = nextPageToken;
            }
            service.files.list( options, function(err, response) {
                if (err) {
                    console.log('The API returned an error: ', err);
                    if(err.code == 400){//'invalid_grant', 'Invalid Credentials'
                        return errCallback('invalid_grant');
                    }else if(err.code == 'ECONNRESET'){
                        return errCallback('ECONNRESET');
                    }else{
                        console.log('some error occurred: services.files.list : ', options)
                        return;
                    }
                }

                console.log('response4444response4444response4444response4444response4444');
                // console.log(response);
                
                var files = response.files;
                var nextPageToken = response.nextPageToken;

                if (files.length == 0) {
                    console.log('No files found.');
                } else {
                    console.log('Files:');
                    // console.log(files[0]);
                    // for (var i = 0; i < files.length; i++) {
                    //     var file = files[i];
                    //     console.log('%s (%s)', file.name, file.id);
                    // }

                    // checkDriveandHandleFiles(files);//Beware of not to call any google api in checkDriveandHandleFiles or any of its child function of checkDriveandHandleFiles as we are already calling them in recursiveFileListDrive, if needed then make sure it doesn't cross google request limit


                    var request = require('request');

                    var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dir.OwnerId =? AND dir.isWorkgroup = 1";//where dp.AccountId =?
                    sql = Sequelize.Utils.format([sql, accountId]);
                    sequelize.query(sql, null, {
                        raw: true
                    }).success(function (workgroup) {

                        if(workgroup.length > 0){
                            var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dir.DirectoryId = ? AND dir.name = ?";//where dp.AccountId =?
                            sql = Sequelize.Utils.format([sql, workgroup[0].id, 'GOOGLE DRIVE']);

                            // drivenodearr = req.param('drivenode');
                            drivenodearr = files;
                            if(drivenodearr.length > 0){
                                async.auto({
                                    checkdir: function (cb) {

                                        if(parentDir){//if we already called else block once use previous parent ID
                                            
                                            cb(null, parentDir);
                                        
                                        }else{//runs first time only

                                            console.log(sql);
                                            sequelize.query(sql, null, {
                                                raw: true
                                            }).success(function (directory) {
                                                if(directory.length > 0){
                                                    console.log('directoryFOUNDdirectoryFOUNDdirectoryFOUND');
                                                    cb(null, directory[0]);
                                                }else{
                                                    console.log('creatingDRIVEcreatingDRIVEcreatingDRIVEcreatingDRIVE');
                                                    Directory.create({
                                                        name: 'GOOGLE DRIVE',
                                                        directoryId: workgroup[0].id,
                                                        // isDriveDir: true,
                                                        isOlympusDriveDir: true,
                                                        // driveFsName: 'olympusDrive',
                                                        uploadPathId: driveUploadPathId
                                                    }).done(function(err, newdir){

                                                        if(err)
                                                            return res.send(err, 500);

                                                        DirectoryPermission.create({
                                                            type: 'admin',
                                                            accountId: accountId,//req.session.Account.id,
                                                            directoryId: newdir.id
                                                        }).done(function(donepermission){
                                                            console.log(donepermission);
                                                            cb(null, newdir);
                                                        });
                                                    });
                                                }
                                            }).error(function (e) {
                                                return res.send(e, 500);
                                                // throw new Error(e);
                                            });
                                        }
                                    },
                                    newDirectory: ['checkdir', function (cb, r) { // Create the new directory
                                        console.log(r.checkdir.id);
                                        parentDir = r.checkdir;
                                        // drivenodearr = req.param('drivenode');
                                        DirectoryController.createFilesandFolders(auth, drivenodearr, accountId, parentDir, driveUploadPathId, credentials, errCallback);
                                        //PAGINATION: get next set of files from current folder
                                        DirectoryController.recursiveFileListDrive(auth, accountId, nextPageToken, driveFolderID, parentDir, count, driveUploadPathId, credentials, errCallback);
                                    }]
                                });
                            }
                            
                        }else{
                            return res.send(500, "No Workgroup Found for this account.");
                        }
                    }).error(function (e) {
                        return res.send(e, 500);
                        // throw new Error(e);
                    });
                }
            });
        }else{
            console.log('Final CALL returning');
            return;
        }
    },

    createFilesandFolders: function(auth, drivenodearr, accountId, parentDir, driveUploadPathId, credentials, errCallback){
        console.log('drivenodedrivenodedrivenodedrivenode', drivenodearr.length);
        // console.log(drivenodearr.length);
        // console.log('drivenodedrivenodedrivenodedrivenode');

        if(drivenodearr.length > 0){
            var apiResponse_entries = [];
            _.each(drivenodearr, function( drivenode, i ){

                // console.log(drivenode.mimeType, (drivenode.mimeType == 'application/vnd.google-apps.folder') );
                if( drivenode.mimeType == 'application/vnd.google-apps.folder' ){//'application/vnd.google-apps.folder'

                    console.log('Checking Folder: '+drivenode.name);

                    Directory.findAll({where:{
                        'name': drivenode.name,
                        'DirectoryId': parentDir.id//drivenode.parentId
                        // 'md5checksum': drivenode.md5checksum
                    }}).done(function(err, dirModel){
                        if(err)
                            return res.send(err, 500);

                        if(dirModel && dirModel.length){
                            console.log('Folder already exists. Searching inside: ['+dirModel[0].id+'] '+dirModel[0].name);//If directory with same name and parent id exists do not create another
                            //Try syncing nested folder in drive
                            DirectoryController.fileListDrive(auth, accountId, 'olympusNextPageToken', dirModel[0].driveFsName, dirModel[0], 0, driveUploadPathId, credentials, errCallback);
                        }else{
                            console.log('Creating Folder: '+drivenode.name+' , DirectoryId: '+parentDir.id);
                            async.auto({
                                // Get the permissions linked with the parent directory
                                parentPermissions: function (cb, res) {
                                    DirectoryPermission.findAll({
                                        where: {DirectoryId: parentDir.id}//req.param('parent').id
                                    }).done(cb);
                                },
                                // Make sure the name is unique, or make it so
                                metadata: function (cb) {
                                    // UniqueNameService.unique(Directory, req.param('name'), req.param('parent').id, cb);
                                    UniqueNameService.unique(Directory, drivenode.name, parentDir.id, cb);
                                },
                                newDirectory: ['metadata', function (cb, r) { // Create the new directory
                                        Directory.create({
                                            name: r.metadata.fileName,
                                            directoryId: parentDir.id,
                                            isDriveDir: true,
                                            driveFsName: drivenode.id,
                                            uploadPathId: driveUploadPathId
                                        }).done(cb);
                                    }],
                                // Cascade parent permissions to new directory
                                newPermissions: ['newDirectory', 'parentPermissions', function (cb, res) {
                                        var chainer = new Sequelize.Utils.QueryChainer();
                                        _.each(res.parentPermissions, function (parentPermission, index) {
                                            // The creator always gets admin perms
                                            if (parentPermission.AccountId != accountId) {//req.session.Account.id
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
                                            accountId: accountId,//req.session.Account.id,
                                            directoryId: res.newDirectory.id
                                        }).done(cb);
                                    }]

                            }, function (err, results) {

                                if (err){
                                    console.log('error in creating directory: '+err);
                                    return;// return res.send(500, err);
                                }

                                var apiResponse = APIService.Directory.mini(results.newDirectory);
                                var parentDirRoomName = Directory.roomName(parentDir.id);//req.param('parent').id
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
                                Directory.find(parentDir.id).success(function (dirModel) {
                                    var options = {
                                        uri: 'http://localhost:1337/logging/register/',
                                        method: 'POST',
                                    };

                                    options.json = {
                                        user_id: accountId,//req.session.Account.id,
                                        text_message: 'has created a sub directory named ' + results.newDirectory.name + ' inside root ' + dirModel.name + ' directory.',
                                        activity: 'create',
                                        on_user: accountId,//req.session.Account.id,
                                        // ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                                        platform: 'Web application'//req.headers.user_platform,
                                    };

                                    // request(options, function (err, response, body) {
                                    //     if (err)
                                    //         return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                                    // });
                                });
                                // Respond with new directory
                                // res.json(apiResponse);

                                //Try syncing folder contents(if any) inside this folder from drive
                                console.log('Folder Created. Searching inside: ['+results.newDirectory.id+'] '+results.newDirectory.name);//If directory with same name and parent id exists do not create another
                                DirectoryController.fileListDrive(auth, accountId, 'olympusNextPageToken', results.newDirectory.driveFsName, results.newDirectory, 0, driveUploadPathId, credentials, errCallback);
                            });
                        }
                    });

                }else if( parseInt(drivenode.fileSize) == 0 && parseInt(drivenode.quotaBytesUsed) == 0 ){

                    console.log('ignored 0 byte file: '+drivenode.name);
                    //0 bytes file ignored in olympus

                }else{ 

                    console.log('Creating file: '+drivenode.name);

                    File.findAll({where:{
                        'fsName': drivenode.id,
                        'uploadPathId':driveUploadPathId
                        // 'md5checksum': drivenode.md5checksum
                    }}).done(function(err, fileModel){
                        if(err)
                            return res.send(err, 500);

                        if(fileModel.length > 0){
                            var apiResponse = APIService.File.mini(fileModel);
                            apiResponse_entries.push(apiResponse);

                            console.log('apiResponse.entriesapiResponse.entriesapiResponse.entries');
                            console.log(apiResponse[0]['id']+' : '+apiResponse[0]['name']);
                            // apiResponse.parent.id = options.parentId;
                        }else{
                            File.handleUpload({
                                name: drivenode.name,
                                size: drivenode.size,
                                type: drivenode.mimeType,
                                fsName: drivenode.id,
                                oldFile: 0,
                                version: drivenode.version,
                                parentId: parentDir.id,//parsedFormData.parent.id,
                                // replaceFileId: req.param('replaceFileId'),
                                account_id: accountId,//req.session.Account.id, // AF
                                thumbnail: "0",
                                md5checksum: drivenode.md5checksum,
                                uploadPathId: driveUploadPathId,
                                isOnDrive: "1",
                                viewLink: drivenode.webViewLink,
                                downloadLink: drivenode.webContentLink,
                                iconLink: drivenode.iconLink,
                            }, function (err, resultSet) {

                                if (err)
                                    return res.send(err, 500);
                                var response = {
                                    total_count: resultSet.length,
                                    entries: resultSet
                                };
                                // return res.json(response);

                            });
                            console.log('FILE Does not exist');
                        }

                        if( i + 1 == drivenodearr.length ) {
                             // Callback goes here
                            var response = {
                                total_count: apiResponse_entries.length,
                                entries: apiResponse_entries
                            };

                            // console.log('responseresponseresponseresponseresponse '+response.entries[0]['id']+' : '+response.entries[0]['name']);
                            // console.log(response);
                            // return res.json(response);
                        }
                    });
                }
            });
            
        }
    },

    syncdriveoldtwo: function (req, res) {

        // var fs = require('fs');
        // var readline = require('readline');
        // var google = require('googleapis');
        var googleAuth = require('google-auth-library');


        var oauth2ClientToken = {
            'access_token': req.param('access_token'),
            "token_type":req.param('token_type'),
            "refresh_token": null,//"1/NEOhW9bRnHVmY88LYN84Jo63Q3f7-sFXQ78VaT1S7W4",
            "expiry_date": null,//req.param('expires_at')
        };

        // var google = require('googleapis');
        var OAuth2 = google.auth.OAuth2;
        var oauth2Client = new OAuth2('747113141822-fo8de0e6ih03igt34q77l2s4hm20k1rb.apps.googleusercontent.com', '2cwuJD-_Cdzeq9-qAynrHfXC', 'urn:ietf:wg:oauth:2.0:oob');
        var service = google.drive({ version: 'v2', auth: oauth2Client });

        /*var auth = new googleAuth();
        // // var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        var oauth2Client = new auth.OAuth2('747113141822-fo8de0e6ih03igt34q77l2s4hm20k1rb.apps.googleusercontent.com', '2cwuJD-_Cdzeq9-qAynrHfXC', 'urn:ietf:wg:oauth:2.0:oob');*/
        
        // oauth2Client.credentials = oauth2ClientToken;

        console.log("req.param('code')req.param('code')req.param('code')");
        console.log(req.param('code'));

        oauth2Client.getToken(req.param('code'), function(err, tokens) {
          // Now tokens contains an access_token and an optional refresh_token. Save them.
          if(!err) {
            oauth2Client.setCredentials(tokens);

            // var service = google.drive('v2');
            service.files.list({
                auth: oauth2Client,
                maxResults: 10,
            }, function(err, response) {
                if (err) {
                  console.log('The API returned an error: ' + err);
                  return;
                }
                var files = response.items;
                if (files.length == 0) {
                  console.log('No files found.');
                } else {
                  console.log('Files:');
                  for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    console.log('%s (%s)', file.title, file.id);
                  }
                }
            });

            console.log(oauth2Client);

            console.log('checkedcheckedcheckedcheckedcheckedcheckedcheckedchecked');
          }else{
            console.log(err);
          }
        });
    },

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
                    ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                    platform: req.headers.user_platform,
                };

                request(options, function (err, response, body) {
                    if (err)
                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    // res.send(200);
                });
                /*Create logging*/

                if(apiResponse['modifiedAt']){

                }else{
                    apiResponse['modifiedAt'] = 'a few seconds ago';
                }

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
                        Directory.find(req.param('parent').id).success(function (dirModel) {
                            console.log(dirModel, 'creating Directory creating Directory creating Directory creating Directory: ', r.metadata.fileName, dirModel.isOlympusDriveDir);
                            if(dirModel.isOlympusDriveDir || dirModel.isDriveDir){//This is the 'GOOGLE DRIVE' directory or its subdirectory of olympus

                                // fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {

                                //     if (err) {
                                //         console.log('Error loading client secret file: ' + err);
                                //         return;
                                //     }

                                SiteOptions.find({where: {id: 1}}).done(function (err, credentials) {

                                    if (err)
                                        return res.json({error: err, type: 'error'});

                                    if(credentials.gdriveSync){

                                        sails.controllers.directory.authorize('file_delete_by_pathID', dirModel.uploadPathId, null, credentials, function (auth, driveUploadPathId) {
                                            var google = require('googleapis');

                                            var drive = google.drive({
                                              version: 'v3',
                                              auth: auth
                                            });

                                            console.log('Creating Drive Folder: ',r.metadata.fileName);

                                            var fileMetadata = {
                                              'name' : r.metadata.fileName,
                                              'mimeType' : 'application/vnd.google-apps.folder',
                                              'parents': ( dirModel.isOlympusDriveDir ) ?[ 'root' ]: [dirModel.driveFsName]// parents: [ folderId ]
                                            };
                                            drive.files.create({
                                               resource: fileMetadata,
                                               fields: '*'
                                            }, function(err, driveUpload) {
                                              if(err) {
                                                // Handle error
                                                // TODO: No error comes ever from drive as it generates a untitled FILE when failing to create a FOLDER, however a check can be placed whether it generated a folder or a file
                                                console.log('Error Folder Id: ');
                                                console.log(err);
                                              } else {//now create a directory in olympus corresponding to drive directory
                                                console.log('Drive Folder Id: ', driveUpload.id);
                                                Directory.create({
                                                    name: r.metadata.fileName,
                                                    directoryId: req.param('parent').id,//OR dirModel.id
                                                    isDriveDir: true,
                                                    driveFsName: driveUpload.id,
                                                    uploadPathId: dirModel.uploadPathId,//driveUploadPathId
                                                }).done(cb);
                                              }
                                            });
                                        });
                                    }else{
                                        return res.json({error: 'driveSyncDisabled', type: 'error'});
                                    }
                                });
                                // });//fs.readFile
                            }else if(dirModel.isOlympusDropboxDir || dirModel.isDropboxDir){//This is the 'GOOGLE DRIVE' directory or its subdirectory of olympus

                                SyncDbox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
                                    if (err) {
                                        console.log('Error loading client secret file: ' + err);
                                        return;
                                    }
                                    if( tokenrow ){
                                        var dirNameDbx = ( dirModel.isOlympusDropboxDir ? '' : dirModel.driveFsName )+'/' + r.metadata.fileName;
                                        var node_dropbox = require('node-dropbox');
                                        api = node_dropbox.api(tokenrow.access_token);
                                        api.createDir( dirNameDbx, function(err, res, dbxUpload){
                                          if(err) {
                                            console.log('Error Folder Id: ');
                                            console.log(err);
                                          } else {//now create a directory in olympus corresponding to drive directory
                                            console.log('Dropbox Folder: ', dbxUpload);
                                            Directory.create({
                                                name: r.metadata.fileName,
                                                directoryId: req.param('parent').id,//OR dirModel.id
                                                isDropboxDir: true,
                                                driveFsName: dbxUpload.path,
                                                uploadPathId: tokenrow.id,//dirModel.uploadPathId,//driveUploadPathId
                                            }).done(cb);
                                          }
                                        });
                                    }
                                });
                            }else if(dirModel.isOlympusBoxDir || dirModel.isBoxDir){//This is the 'GOOGLE DRIVE' directory or its subdirectory of olympus
                                SyncBox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
                                    if (err) {
                                        console.log('Error loading client secret file: ' + err);
                                        return;
                                    }
                                    if( tokenrow ){
                                        // var dirNameDbx = ( dirModel.isOlympusBoxDir ? '' : dirModel.driveFsName )+'/' + r.metadata.fileName;
                                        // var node_dropbox = require('node-dropbox');
                                        // api = node_dropbox.api(tokenrow.access_token);
                                        // api.createDir( dirNameDbx, function(err, res, dbxUpload){
                                        //   if(err) {
                                        //     console.log('Error Folder Id: ');
                                        //     console.log(err);
                                        //   } else {//now create a directory in olympus corresponding to drive directory
                                        //     console.log('Dropbox Folder: ', dbxUpload);
                                        //     Directory.create({
                                        //         name: r.metadata.fileName,
                                        //         directoryId: req.param('parent').id,//OR dirModel.id
                                        //         isDropboxDir: true,
                                        //         driveFsName: dbxUpload.path,
                                        //         uploadPathId: tokenrow.id,//dirModel.uploadPathId,//driveUploadPathId
                                        //     }).done(cb);
                                        //   }
                                        // });
                                        var superagent = require('superagent');
                                        var boxRequest = superagent
                                        .post('https://api.box.com/2.0/folders')
                                        .set('Authorization', 'Bearer '+tokenrow.access_token)
                                        .send({ name: r.metadata.fileName, parent: {
                                            id: dirModel.driveFsName?dirModel.driveFsName:0
                                          }
                                        });
                                        INodeService.doBoxRequest(tokenrow, boxRequest,function onBoxComplete (err, boxUpload) {
                                            console.log('boxUploadd.id', boxUpload.body);
                                            if(boxUpload.status != 200 && boxUpload.status != 201) {
                                                if(boxUpload.status == 409){
                                                    console.log('already exists') ;
                                                    //Though we can continue creating it in olympus
                                                }else{
                                                    console.log(boxUpload);
                                                    return;
                                                }
                                            }
                                            Directory.create({
                                                name: r.metadata.fileName,
                                                directoryId: req.param('parent').id,//OR dirModel.id
                                                isBoxDir: true,
                                                driveFsName: boxUpload.body?boxUpload.body.id:null,
                                                uploadPathId: tokenrow.id,//dirModel.uploadPathId,//driveUploadPathId
                                            }).done(cb);
                                        });
                                    }
                                });
                            }else{//Just create a directory in olympus
                                Directory.create({
                                    name: r.metadata.fileName,
                                    directoryId: req.param('parent').id
                                }).done(cb);
                            }
                        });
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
                        ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                        platform: req.headers.user_platform,
                    };

                    request(options, function (err, response, body) {
                        if (err)
                            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
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
