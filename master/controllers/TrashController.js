var mime = require('mime');
var fs = require('fs');

var path = require('path');
var anchor = require('anchor');
var request = require('request')

var TrashController = {

	deletedList : function (req, res, cb){

        async.auto({
            files: childrenOf(File),
            // Get this directory's files
            directories: childrenOf(Directory) // Get this directory's directories
        }, afterwards);

        function childrenOf(model) {
            return function (cb, rs) {
                Deletedlist.whoseParentIs({
                    directory_id: req.param('id'),
                    account_id: req.session.Account && req.session.Account.id
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

	deletePermanent : function(req, res){
        console.log(req.param('type'));
        console.log(req.param('type') === 'directory');
        console.log('NMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNMNM');
        // console.log('deleting file from '+sails.config.uploadPath);
        // console.log(req.param('file_id'));

        // console.log(sails.config.fileAdapter.adapter);

        if (req.param('type') === 'file'){
            File.find(req.param('id')).success(function (fileModel) {
                if (fileModel) {

                    var request = require('request');
                    var options = {
                        uri: 'http://localhost:1337/trash/deletePermanent/',
                        method: 'POST',
                    };

                    options.json = {
                        file_id : req.param('id'),
                        type    : req.param('type'),
                        directory_id    : req.param('directory_id'),
                        fsName  : fileModel.fsName
                    };

                    // console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");
                    // console.log(options);
                    console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");

                    request(options, function (err, response, body) {
                        console.log('CVCVCVCVCVCVCVCVCVCVCVCVCVCVCVCVCV');

                        Deletedlist.restore({
                         file_id : req.param('id'),
                         type    : req.param('type')
                        }, function(err, result){
                            if (err)
                                return res.json({error: err.message, type: 'error'}, response && response.statusCode);

                            fs.unlink(sails.config.appPath + '/../api/files/' + fileModel.fsName, function(err){
                              // if (err) console.log(err);
                            });
                            fs.unlink(sails.config.appPath + '/../api/files/thumbnail-' + fileModel.fsName, function(err){
                              // if (err) console.log(err);
                            });
                            fs.unlink(sails.config.appPath + '/../api/files/thumbnail-thumbnail-' + fileModel.fsName, function(err){
                              // if (err) console.log(err);
                            });
                            fs.unlink(sails.config.appPath + '/public/images/thumbnail/'+fileModel.name, function(err){
                              // if (err) console.log(err);
                            });
                            fs.unlink(sails.config.appPath + '/public/images/thumbnail-thumbnail-'+fileModel.fsName, function(err){
                              // if (err) console.log(err);
                            });

                            res.json(200);
                        });

                        console.log('CVCVCVCVCVCVCVCVCVCVCVCVCVCVCVCVCV');

                        res.json(200);
                    });

                    // FileAdapter.deletefile({
                    //     name: fileModel.fsName
                    // }, function (err, data) {

                    //     // TODO: delete the tmp file
                    //     console.log('kashdkashdkashdkasjdlkasjldkjasldjlasdjl');
                    //     console.log(err);
                    //     console.log(data);
                    //     console.log('kashdkashdkashdkasjdlkasjldkjasldjlasdjl');
                    //     cb(err, data);
                    // });
                }else{
                    // res.json({
                    //     success: false,
                    //     error: 'File could not be found.',
                    //     message: 'File could not be found.'
                    // });
                    //do nothing
                }
            });
        }else if (req.param('type') === 'directory'){

            console.log("dududududududududududududududududududududududududududududududududududu");

            var request = require('request');
            var options = {
                uri: 'http://localhost:1337/trash/deletePermanent/',
                method: 'POST',
            };

            options.json = {
                file_id         : req.param('id'),
                type            : req.param('type'),
                directory_id    : req.param('directory_id')
            };

            // console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");
            // console.log(options);
            console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");

            request(options, function (err, response, body) {
                console.log('CVCVCVCVCVCVCVCVCVCVCVCVCVCVCVCVCV');

                res.json(200);
            });
        }

	},

	restore : function(req, res){

		var request = require('request');
        var options = {
            uri: 'http://localhost:1337/trash/restore/',
            method: 'POST',
        };

        options.json = {
			file_id : req.param('id'),
            type    : req.param('type'),
			directory_id 	: req.param('directory_id')
		};

        console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");
        console.log(options);
        console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");

        request(options, function (err, response, body) {
            // if(typeof body === 'undefined'){
            //     return res.json(err);
            // }else{
            // 	Deletedlist.restore({
    	       //      file_id : options.json.file_id,
    	       //      type 	: options.json.type,
            //     }, function(err, result){
    	        	if (err)
        	            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                	res.json(body, response && response.statusCode);
            //     });
            // }
        });

	},

    checkForFile : function(){

    },

    restoreFileAPI : function(req,res){
        console.log(req.param('id'));

        // Strip original headers of host and connection status
        var headers = req.headers;
        delete headers.host;
        delete headers.connection;

        var request = require('request');
        var options = {
            uri: 'http://localhost:1337/trash/restore/',
            method: 'POST',
            headers: headers
        };

        options.json = {
            file_id : req.param('id'),
            type    : req.param('type'),
            directory_id : ( req.param('directory_id') != null )? req.param('directory_id') : ''
        };

        console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");
        console.log(options);
        console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");

        request(options, function (err, response, body) {

            if(typeof body === 'undefined'){
                return res.json(err);
            }else{
                Deletedlist.restore({
                    file_id : options.json.file_id,
                    type    : options.json.type,
                }, function(err, result){
                    if (err)
                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    res.json(body, response && response.statusCode);
                });
            }
        });
    },

    file_directory_list: function(req, res){
        // headers = req.headers;

        var AccountId = null;
        var sql = "SELECT c.account_id AS AccountId FROM accountdeveloper c WHERE c.access_token=?";
        sql = Sequelize.Utils.format([sql, req.param('id')]);
        console.log(sql);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (accounts) {
            // console.log(comments[0].AccountId);

            if(typeof accounts[0].AccountId != 'undefined'){
                AccountId = accounts[0].AccountId;

                Deletedlist.deleted({
                    account_id : AccountId,//req.param('id'),
                    // file_id : req.param('id'),
                    // type    : req.param('type')
                }, function(err, result){
                    if (err)
                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);

                    res.json(result, 200);
                    // res.json(200);
                });
            }else{
                res.json(500);
            }
            // res.json(comments, 200);
        });

    },

    emptyTrash : function(req, res){

        console.log('emptyTrashemptyTrashemptyTrashemptyTrashemptyTrashemptyTrashemptyTrash');

        // console.log('deleting file from '+sails.config.uploadPath);
        // console.log(req.param('file_id'));

        // console.log(sails.config.fileAdapter.adapter);

        var request = require('request');
        var options = {
            uri: 'http://localhost:1337/trash/emptyTrash/',
            method: 'POST',
        };

        options.json = {
            account            : req.session.Account
            // file_id         : req.param('id'),
            // type            : req.param('type'),
            // directory_id    : req.param('directory_id')
        };

        // console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");
        // console.log(options);
        console.log("optionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptionsoptions");

        request(options, function (err, response, body) {
            console.log('CVCVCVCVCVCVCVCVCVCVCVCVCVCVCVCVCV');
            console.log(err);
            console.log(response);
            console.log(body);

            res.json(200);
        });

    },

};
_.extend(exports, TrashController);