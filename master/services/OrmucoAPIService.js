var assert = require('assert');
var amazonS3 = require('awssum-amazon-s3');
var MultiPartUpload 	= require('knox-mpu');
var knox 		= require('knox');

// Validate configuration
// Get keys from config or environment
// var config = {
// 	accessKeyId: sails.config.fileAdapter.s3.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
// 	secretAccessKey: sails.config.fileAdapter.s3.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
// 	// awsAccountId: sails.config.fileAdapter.s3.awsAccountId || process.env.AWS_ACCOUNT_ID,
// 	bucket: sails.config.fileAdapter.s3.bucket || process.env.AWS_BUCKET,
// 	region: require('awssum-amazon')[sails.config.fileAdapter.s3.region || process.env.AWS_REGION]
// };

// Immediately instantiate this service using API credentials. 
// var s3 = new amazonS3.S3(config);

module.exports.getLastOrmucoToken = function getLastOrmucoToken (receiverinfo, callback) {


	console.log('test111111111111111111');
	console.log(typeof SiteOptions);
	
	// SiteOptions.find({where:{id:1}}).done(function(err, siteoptionsrow){

	// console.log('test2222222222222222222222222222');

	// 	if(err){
	// 		console.log('ERROR: OrmucoReceiver.getLastOrmucoToken::');
	// 		console.log(err);
	// 		return err;
	// 	}

		siteoptionsrow = receiverinfo;
		if(siteoptionsrow.ormucoLastToken && siteoptionsrow.ormucoTimestamp){
			console.log('Ormuco Token Exists.');
			var currenttime = Date.now || function() { return +new Date; };

			// console.log('currenttime() - siteOptions.ormucoTimestamp: ', (currenttime() - siteoptionsrow.ormucoTimestamp) > 84000);

        	if( ( currenttime() - siteoptionsrow.ormucoTimestamp ) < 84000*1000){//used 84000 in place of 86400 so that token is refreshed some time before 24hrs.
        		console.log('Using Last Token');
        		callback(siteoptionsrow.ormucoLastToken);//return last token;
        		// return siteoptionsrow.ormucoLastToken;//return last token;
        	}else{
        		console.log('Ormuco Token expired. Refreshing....');
        		OrmucoAPIService.refreshOrmucoToken(receiverinfo, callback);
        		// callback(OrmucoReceiver.refreshOrmucoToken(receiverinfo));//Generate new token
				// return OrmucoReceiver.refreshOrmucoToken(receiverinfo)//Generate new token
        	}
		}else{
			console.log('No token Found.');
			OrmucoAPIService.refreshOrmucoToken(receiverinfo, callback);
			// callback(OrmucoReceiver.refreshOrmucoToken(receiverinfo));//Generate Ormuco token for the first time
			// return OrmucoReceiver.refreshOrmucoToken(receiverinfo);//Generate Ormuco token for the first time
		}
	// });
};

module.exports.refreshOrmucoToken = function refreshOrmucoToken (receiverinfo, callback) {

	var http = require('https');

	console.log('refreshing Token...................');

	post_data = '{"username":"'+receiverinfo.accessKeyId+'","password":"'+receiverinfo.secretAccessKey+'","dual_key":null}';

	var options = {
	  host: 'cloud.ormuco.com',
	  port: 443,
	  // json: true,
	  path: '/auth/login',
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Accept': 'application/json',
	    'Content-Length': post_data.length
	  },
	  rejectUnauthorized: false
	};

	post_req = http.request(options, function(auth_res) {
	  // console.log('STATUS: ' + auth_res.statusCode);
	  // console.log('HEADERS: ' + JSON.stringify(auth_res.headers));
	  // auth_res.setEncoding('utf8');

	  auth_res.on('error', function (err) {
	    console.log('ERROR: ' + err);
	  });
	  var body = '';
	  auth_res.on('data', function (chunk) {
	    body += chunk;
	  });
	  auth_res.on('end', function () {
	    
	    resbody = JSON.parse(body);
	    // return resbody.access.token.id;

	    UploadPaths.find({where:{id:receiverinfo.id}}).done(function (err, uploadpathrow) {

            // Make sure an Account exists with that ID
            if (!uploadpathrow) return res.json({
                error: 'No Account found with that ID',
                type: 'error'
            }, 400);

            var currenttime = Date.now || function() { return +new Date; };

            console.log(currenttime());
            // Update Model Values
            uploadpathrow.ormucoLastToken = resbody.access.token.id;
            uploadpathrow.ormucoTimestamp = currenttime();

            console.log('siteoptionsrow',uploadpathrow);
            // Save the Account, returning a 200 response
            uploadpathrow.save().done(function (err) {
                if (err) callback(null);
                
                callback(resbody.access.token.id);
                // return '33b99af5955a44528777aad6afa05fba';
            });

        }).fail(function (err) {
        	console.log(err);
        	callback(null);
        });
	  });
	});

	post_req.on('error', function(e) {
	    console.log('problem with request: ' + e.message);
	    callback(null);
	});

	post_req.write(post_data);
	post_req.end();
};

/**
 * Upload a local file
 *	@options
 *		@name
 *		@contentLength
 *		@payload
 *	@cb
 */
module.exports.upload = function(options, cb) {

	// creation of bucket was ok, now let's put an object into it
	s3.PutObject({
		BucketName: config.bucket,
		ObjectName: options.name,
		ContentLength: options.contentLength,
		Body: options.payload
	}, function(err, data) {
		cb(err, data);
	});
};

/**
 * Download a file
 */
module.exports.download = function(options, finalCallback) {

	async.auto({
        getOrmucoToken: function(cb) {

        	console.log('OrmucoAPIService.uploadProfile:::2222');

        	// console.log(sails);
        	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
        	OrmucoAPIService.getLastOrmucoToken(options.current_receiverinfo, function(ormucoToken){
        		// console.log('ormucoToken::'+ormucoToken);
            	if(ormucoToken){
            		// console.log('ormucoTokenormucoTokenormucoTokenormucoTokenormucoToken');
            		cb(null, ormucoToken);
            	}else{
            		// console.log('ENOENTENOENTENOENTENOENTENOENTENOENTENOENTENOENTENOENT')
            		cb(null, 'ENOENT');
            	}
        	});
            // File.findOne({where:{fsName:(req.param('id')).replace('thumbnail-','')}}).done(cb);
        },
        downloadTask: ['getOrmucoToken', function(cb, up) {

        	var ormucoToken        = up.getOrmucoToken;
        	var fsx        		   = require('fs-extra');

            if(ormucoToken == 'ENOENT'){
            	// return 404
			  	return emitter__.emit('notfound', {
	  				name: '__newFile.filename'
	  			});
            }

			var http = require('https');
			var url = 'objects.ormuco.com';

			var imgOptions = {
			  host: url,
			  port: 443,
			  path: '/swift/v1/'+options.current_receiverinfo.bucket+'/'+options.name,
			  method: 'GET',
			  headers: { //We can define headers too
			    'X-Auth-Token': ormucoToken//'8c0dad7ea7b64812acedfc2ace952b7e'//'9d3f0e39c220458b83c43c85c8a7b2da'
			  },
			  rejectUnauthorized: false
			};

			http.request(imgOptions, function(resOrmuco) {
			  console.log('STATUS: ' + resOrmuco.statusCode);
			  console.log('HEADERS: ' + JSON.stringify(resOrmuco.headers));
			  // resOrmuco.setEncoding('utf8');
			  // resOrmuco.on('data', function (chunk) {
			  //   console.log('BODY: ' + chunk);
			  // });
			  // console.log(options);
			  // if (options.stream) {
			  // 	console.log('options.streamoptions.streamoptions.streamoptions.stream:TRUE'+options.name);
		   //      return resOrmuco.pipe(fsx.createWriteStream(('files/')+""+options.name)).pipe(options.stream);
		   //    }
			  // resOrmuco.on('error', function (err) {
			  //   console.log('ERROR: ' + err);
			  //   emitter__.emit('error', err);
			  // });
			  // resOrmuco.pipe(emitter__);
			  console.log('finalCallbackfinalCallbackfinalCallbackfinalCallback');
			  finalCallback(null, null, null, resOrmuco);
			}).end();
		}]//async.auto::downloadTask()
    });

	/*console.log(options);
	var config = {
		accessKeyId: options.current_receiverinfo.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: options.current_receiverinfo.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
		// awsAccountId: sails.config.fileAdapter.s3.awsAccountId || process.env.AWS_ACCOUNT_ID,
		bucket: options.current_receiverinfo.bucket || process.env.AWS_BUCKET,
		region: require('awssum-amazon')[options.current_receiverinfo.region || process.env.AWS_REGION]
	};

	var s3 = new amazonS3.S3(config);
	// creation of bucket was ok, now let's put an object into it
	// s3.GetObject({
	// 	BucketName: config.bucket,
	// 	ObjectName: options.name
	// }, {stream: true}, function(err, data) {
	// 	cb(err, null, null, data.Stream);
	// });

	process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

	s3.GetObject({
		BucketName: config.bucket,
		ObjectName: options.name
	},  {stream: true}, function(err, data) {
		if(err != null && err.StatusCode){
			cb(err, null, null, null);
		}else{
			cb(err, null, null, data.Stream);
		}
	});*/

};

module.exports.uploadProfile = function(options, cb) {

	console.log('OrmucoAPIService.uploadProfile:::11111');

    async.auto({
        getOrmucoToken: function(cb) {

        	console.log('OrmucoAPIService.uploadProfile:::2222');

        	// console.log(sails);
        	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
        	OrmucoAPIService.getLastOrmucoToken(options.receiverinfo, function(ormucoToken){
        		// console.log('ormucoToken::'+ormucoToken);
            	if(ormucoToken){
            		// console.log('ormucoTokenormucoTokenormucoTokenormucoTokenormucoToken');
            		cb(null, ormucoToken);
            	}else{
            		// console.log('ENOENTENOENTENOENTENOENTENOENTENOENTENOENTENOENTENOENT')
            		cb(null, 'ENOENT');
            	}
        	});
            // File.findOne({where:{fsName:(req.param('id')).replace('thumbnail-','')}}).done(cb);
        },
        downloadTask: ['getOrmucoToken', function(cb, up) {

        	console.log('OrmucoAPIService.uploadProfile:::3333'+options.name);

            var ormucoToken        = up.getOrmucoToken;

            if(ormucoToken == 'ENOENT'){
            	// return 404
			  	return emitter__.emit('notfound', {
	  				name: '__newFile.filename'
	  			});
            }

			var http = require('https');
			var url = 'objects.ormuco.com';
			// var request = require("request");
			// var progress = require('progress-stream');
			var fs = require('fs');
			 
			// var stat = fs.statSync(filename);

			// var ormucoToken = '8c0dad7ea7b64812acedfc2ace952b7e';//'74835fd50fef42799c924a2e80fd5110';//'9d3f0e39c220458b83c43c85c8a7b2da';

			var OrmucoUploadReq = http.request({
			  host: url,
			  port: 443,
			  path: '/swift/v1/'+options.receiverinfo.bucket+'/'+options.name,//__newFile.filename,
			  method   : 'PUT',
			  headers: { //We can define headers too
			    'X-Auth-Token': ormucoToken
			  },
			  rejectUnauthorized: false
			}, function(res) {

			  // console.log('STATUS: ' + res.statusCode);
			  console.log('HEADERS: ' + JSON.stringify(res.headers));
			  console.log('=============================================================================');
			  console.log(res.statusCode);
			  console.log('=============================================================================');
			  if(res.statusCode == 200 || res.statusCode == 201){
			 //  	__newFile.extra = res.headers?{'hash':res.headers.etag}:{};//{};//body;
				// __newFile.extra.fsName = options.name;

				console.log('__newFile.extra');
				// console.log(__newFile.extra);

				// log(('Receiver: Finished writing `'+__newFile.filename+'`').grey);
				// next();
			  }else if(res.statusCode == 401){
				// log(('Receiver: Error writing `'+__newFile.filename+'`:: '+ res.statusCode+' :: Cancelling upload and cleaning up already-written bytes...').red);
				receiver__.emit('error', res.statusCode);
				return;
			  }
			});

			OrmucoUploadReq.on('error', function(e) {
			  console.log('problem with request: ' + e.message);
			});

			// sails.config.appPath + "/public/images/profile/" + enterpriseName 
			fs.createReadStream(sails.config.appPath + "/public/images/profile/" + options.name ).pipe(OrmucoUploadReq);
		}]//downloadTask
	});
};

module.exports.uploadLogo = function(options, cb) {

	console.log('OrmucoAPIService.uploadProfile:::11111');

    async.auto({
        getOrmucoToken: function(cb) {

        	console.log('OrmucoAPIService.uploadProfile:::2222');

        	// console.log(sails);
        	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
        	OrmucoAPIService.getLastOrmucoToken(options.receiverinfo, function(ormucoToken){
        		// console.log('ormucoToken::'+ormucoToken);
            	if(ormucoToken){
            		// console.log('ormucoTokenormucoTokenormucoTokenormucoTokenormucoToken');
            		cb(null, ormucoToken);
            	}else{
            		// console.log('ENOENTENOENTENOENTENOENTENOENTENOENTENOENTENOENTENOENT')
            		cb(null, 'ENOENT');
            	}
        	});
            // File.findOne({where:{fsName:(req.param('id')).replace('thumbnail-','')}}).done(cb);
        },
        downloadTask: ['getOrmucoToken', function(cb, up) {

        	console.log('OrmucoAPIService.uploadProfile:::3333'+options.name);

            var ormucoToken        = up.getOrmucoToken;

            if(ormucoToken == 'ENOENT'){
            	// return 404
			  	return emitter__.emit('notfound', {
	  				name: '__newFile.filename'
	  			});
            }

			var http = require('https');
			var url = 'objects.ormuco.com';
			// var request = require("request");
			// var progress = require('progress-stream');
			var fs = require('fs');
			 
			// var stat = fs.statSync(filename);

			// var ormucoToken = '8c0dad7ea7b64812acedfc2ace952b7e';//'74835fd50fef42799c924a2e80fd5110';//'9d3f0e39c220458b83c43c85c8a7b2da';

			var OrmucoUploadReq = http.request({
			  host: url,
			  port: 443,
			  path: '/swift/v1/'+options.receiverinfo.bucket+'/'+options.name,//__newFile.filename,
			  method   : 'PUT',
			  headers: { //We can define headers too
			    'X-Auth-Token': ormucoToken
			  },
			  rejectUnauthorized: false
			}, function(res) {

			  // console.log('STATUS: ' + res.statusCode);
			  console.log('HEADERS: ' + JSON.stringify(res.headers));
			  console.log('=============================================================================');
			  console.log(res.statusCode);
			  console.log('=============================================================================');
			  if(res.statusCode == 200 || res.statusCode == 201){
			 //  	__newFile.extra = res.headers?{'hash':res.headers.etag}:{};//{};//body;
				// __newFile.extra.fsName = options.name;

				console.log('__newFile.extra');
				// console.log(__newFile.extra);

				// log(('Receiver: Finished writing `'+__newFile.filename+'`').grey);
				// next();
			  }else if(res.statusCode == 401){
				// log(('Receiver: Error writing `'+__newFile.filename+'`:: '+ res.statusCode+' :: Cancelling upload and cleaning up already-written bytes...').red);
				receiver__.emit('error', res.statusCode);
				return;
			  }
			});

			OrmucoUploadReq.on('error', function(e) {
			  console.log('problem with request: ' + e.message);
			});

			// sails.config.appPath + "/public/images/profile/" + enterpriseName 
			fs.createReadStream(sails.config.appPath + "/public/images/enterprises/" + options.name ).pipe(OrmucoUploadReq);
		}]//downloadTask
	});
};