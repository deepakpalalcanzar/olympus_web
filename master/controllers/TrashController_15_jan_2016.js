var mime = require('mime');

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
		Deletedlist.restore({
	        file_id : req.param('id'),
			type 	: req.param('type')
        }, function(err, result){

        	if (err)
	            return res.json({error: err.message, type: 'error'}, response && response.statusCode);

        	res.json(200);
        });

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
            if(typeof body === 'undefined'){
                return res.json(err);
            }else{
            	Deletedlist.restore({
    	            file_id : options.json.file_id,
    	            type 	: options.json.type,
                }, function(err, result){
    	        	if (err)
        	            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                	res.json(body, response && response.statusCode);
                });
            }
        });

	},

    checkForFile : function(){

    }

};
_.extend(exports, TrashController);