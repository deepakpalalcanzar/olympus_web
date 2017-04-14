/*    var path 	= require('path');
    var mime 	= require('mime');
    var anchor 	= require('anchor');
    var skipper    	= require('skipper'); 
    var request = require('request');

    var FileUploadController = {

    	upload: function(req, res){
    	
    		var headers = req.headers;
	        var options = {
	            uri: 'http://localhost:1337/fileupload/upload' ,
	            method: req.method,
	            headers: headers
	        };

	        var proxyReq = req.pipe(request.post(options));
            proxyReq.on('data', function(data) {
            	console.log("HERE I GO FOR DATA");
            });

            proxyReq.on('end', function(end) {
            	console.log("HERE I GO FOR END DATAAAAAAAAAAa");
            });

            proxyReq.on('error', function(err) {
            	console.log("HERE I GO FOR ERROR");
            });
    	},

    };_.extend(exports, FileUploadController);
*/
