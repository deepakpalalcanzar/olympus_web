var fsx 		= require('fs-extra');
var MultiPartUpload 	= require('knox-mpu');
var knox 		= require('knox');
var UUIDGenerator 	= require('node-uuid');
var easyimg 		= require('easyimage');
var path 		= require('path');

module.exports = {

	getLastOrmucoToken: function getLastOrmucoToken (receiverinfo, callback) {

		// SiteOptions.findOne({where:{id:1}}).done(function(err, siteoptionsrow){

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
            		OrmucoReceiver.refreshOrmucoToken(receiverinfo, callback);
            		// callback(OrmucoReceiver.refreshOrmucoToken(receiverinfo));//Generate new token
					// return OrmucoReceiver.refreshOrmucoToken(receiverinfo)//Generate new token
            	}
			}else{
				console.log('No token Found.');
				OrmucoReceiver.refreshOrmucoToken(receiverinfo, callback);
				// callback(OrmucoReceiver.refreshOrmucoToken(receiverinfo));//Generate Ormuco token for the first time
				// return OrmucoReceiver.refreshOrmucoToken(receiverinfo);//Generate Ormuco token for the first time
			}
		// });
	},

	refreshOrmucoToken: function refreshOrmucoToken (receiverinfo, callback) {

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

		    uploadPaths.findOne({where:{id:receiverinfo.id}}).then(function (uploadpathrow) {

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

	            console.log('uploadpathrow',uploadpathrow);
	            // Save the Account, returning a 200 response
	            uploadpathrow.save(function (err) {
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
	},

	/**
	 * Build a mock readable stream that emits incoming files.
	 * (used for file downloads)
	 * 
	 * @return {Stream.Readable}
	 */
	newEmitterStream: function newEmitterStream (options) {

		sails.log('Downloading '+options.id+' using from Ormuco.');

		var Duplex = require('stream').Duplex;
		var emitter__ = Duplex();		

		emitter__._write = function (chunk, encoding, next) {
			emitter__.push(chunk, encoding);
			next();
			return true;
		}

		emitter__._read = function(size) {
			return;
		}

		async.auto({
            getOrmucoToken: function(cb) {

            	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
            	OrmucoReceiver.getLastOrmucoToken(options.receiverinfo, function(ormucoToken){
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
				  path: '/swift/v1/'+options.receiverinfo.bucket+'/'+options.id,
				  method: 'GET',
				  headers: { //We can define headers too
				    'X-Auth-Token': ormucoToken//'8c0dad7ea7b64812acedfc2ace952b7e'//'9d3f0e39c220458b83c43c85c8a7b2da'
				  },
				  rejectUnauthorized: false
				};

				http.request(imgOptions, function(resOrmuco) {
				  // console.log('STATUS: ' + resOrmuco.statusCode);
				  // console.log('HEADERS: ' + JSON.stringify(resOrmuco.headers));
				  // resOrmuco.setEncoding('utf8');
				  // resOrmuco.on('data', function (chunk) {
				  //   console.log('BODY: ' + chunk);
				  // });
				  console.log(options);
				  if (options.stream) {
			        return resOrmuco.pipe(options.stream);
			      }
				  // resOrmuco.on('error', function (err) {
				  //   console.log('ERROR: ' + err);
				  //   emitter__.emit('error', err);
				  // });
				  resOrmuco.pipe(emitter__);
				}).end();
			}]//async.auto::downloadTask()
        });

		return emitter__;
	},





	/**
		* Build a mock readable stream that emits incoming files.
		* (used for file downloads)
		* @return {Stream.Readable}
	*/

	newThumbEmitterStream: function newThumbEmitterStream (options) {

		sails.log('Downloading '+options.id+' using from Ormuco.');
		
		var Duplex = require('stream').Duplex;
		var emitter__ = Duplex();		

		emitter__._write = function (chunk, encoding, next) {
			emitter__.push(chunk, encoding);
			next();
			return true;
		}

		emitter__._read = function(size) {
			return;
		}

		var http = require('https');
		var url = 'objects.ormuco.com';


		async.auto({
            getOrmucoToken: function(cb) {

            	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
            	OrmucoReceiver.getLastOrmucoToken(options.receiverinfo, function(ormucoToken){
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

                if(ormucoToken == 'ENOENT'){

                	console.log('return 404');
                	// return 404
				  	return emitter__.emit('notfound', {
		  				name: '__newFile.filename'
		  			});
                }

				var thumboptions = {
				  host: url,
				  port: 443,
				  path: '/swift/v1/'+options.receiverinfo.bucket+'/thumbnail-'+options.id,
				  method: 'GET',
				  headers: { //We can define headers too
				    'X-Auth-Token': ormucoToken,//'8c0dad7ea7b64812acedfc2ace952b7e'//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
				  },
				  rejectUnauthorized: false
				};

				http.request(thumboptions, function(ormucoRes) {
				  console.log('STATUS: ' + ormucoRes.statusCode);
				  console.log('HEADERS: ' + JSON.stringify(ormucoRes.headers));
				  // res.setEncoding('utf8');
				  if(ormucoRes.statusCode == 200){
				  	console.log('returning chunk', ormucoRes.statusCode);
				    ormucoRes.pipe(emitter__)//pipe to current request
				    .pipe(fsx.createWriteStream(('files/')+"thumbnail-"+options.id));//cache image in local server(so that next time it will be picked from Disk)
				    
				  }else{

				  	// ELSE: return 404
				  	// emitter__.emit('notfound', {
		  			// 	name: '__newFile.filename'
		  			// });

					var fileoptions = {
					  host: url,
					  port: 443,
					  path: '/swift/v1/'+options.receiverinfo.bucket+'/'+options.id,
					  method: 'GET',
					  headers: { //We can define headers too
					    'X-Auth-Token': ormucoToken,//'8c0dad7ea7b64812acedfc2ace952b7e'//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
					  },
					  rejectUnauthorized: false
					};

					http.request(fileoptions, function(ormucoFileRes) {
					  console.log('STATUS: ' + ormucoFileRes.statusCode);
					  console.log('HEADERS: ' + JSON.stringify(ormucoFileRes.headers));
					  // res.setEncoding('utf8');
					  if(ormucoFileRes.statusCode == 200){
					  	console.log('returning chunk', ormucoFileRes.statusCode);
					    // ormucoFileRes.pipe(emitter__);

					    var fileWrite = ormucoFileRes.pipe(fsx.createWriteStream(('files/')+""+options.id));
						fileWrite.on('finish', function(){

							easyimg.resize({
								src: ('files/')+''+options.id, 
								dst: ('files/')+'thumbnail-'+options.id, width: 150, height: 150
							}).then(
								
								function(image) {
									easyimg.resize({
					                	src: ('files/')+''+options.id, 
					                	dst: sails.config.appPath + '/../master/public/images/thumbnail-'+options.id, width: 150, height: 150
					            	}).then(function(image){

					            			// console.log('THUMB image THUMB image THUMB image THUMB image', image);

					            			// var ormucoToken = '8c0dad7ea7b64812acedfc2ace952b7e';//'74835fd50fef42799c924a2e80fd5110';//'9d3f0e39c220458b83c43c85c8a7b2da';

											var OrmucoUploadReq = http.request({
											  host: url,
											  port: 443,
											  path: '/swift/v1/'+options.receiverinfo.bucket+'/thumbnail-'+options.id,//__newFile.filename,
											  method   : 'PUT',
											  headers: { //We can define headers too
											    'X-Auth-Token': ormucoToken
											  },
											  rejectUnauthorized: false
											}, function(res) {
											  if(res.statusCode == 200 || res.statusCode == 201){
											  	console.log('uploading thumbnail-'+options.id+' uploaded to Ormuco: DONE');
											  }else if(res.statusCode == 401){
											  	console.log('uploading thumbnail-'+options.id+' uploaded to Ormuco: FAILED.');
												return;
											  }
											});

											OrmucoUploadReq.on('error', function(e) {
											  console.log('problem with request: ' + e.message);
											});
											// var thumbstream = fsx.createWriteStream(('files/')+"thumbnail-"+options.id);
											var s = fsx.createReadStream((sails.config.appPath + '/files/' || 'files/')+'thumbnail-' + options.id);
						                    // s.on('readable', function () {
						                    // }).on('end', function () {
						                    // }).on('error', function(e){
						                    //     console.log('firstFileError');
						                    //     console.log(e);
						                    //     cb(null, 'ENOENT');
						                    // });
											s.pipe(OrmucoUploadReq);

					            			fsx.unlink(('files/')+""+options.id);
					            			return s.pipe(options.stream);
					            		},
					                	function (err) {
					                		console.log(err);
					                		return ormucoFileRes.pipe(options.stream);//return the original image
					                	}
					                );
					            },
					            function (err) {
					                console.log(err);
					                return ormucoFileRes.pipe(options.stream);//return the original image
					            }
					        );
				            // return ormucoFileRes.pipe(emitter__);//Rishabh: possible bug of returning raw image first time instead of thumbnail
						});
					  }else{//if(ormucoFileRes.statusCode == 404)
					  	console.log('Thumbnail for `'+options.id+'` could not be generated, raw image could not be retrieved.')
					  	emitter__.emit('notfound', {
			  				name: '__newFile.filename'
			  			});
					  }
					}).end();
				  }
				}).end();
            }]//async.auto::downloadTask()
        });

		return emitter__;
	},

	newProfileEmitterStream: function newThumbEmitterStream (options) {

		console.log('newProfileEmitterStreamnewProfileEmitterStreamnewProfileEmitterStream');
		sails.log('Downloading '+options.id+' using from Ormuco.');
		
		var Duplex = require('stream').Duplex;
		var emitter__ = Duplex();		

		emitter__._write = function (chunk, encoding, next) {
			emitter__.push(chunk, encoding);
			next();
			return true;
		}

		emitter__._read = function(size) {
			return;
		}

		var http = require('https');
		var url = 'objects.ormuco.com';


		async.auto({
            getOrmucoToken: function(cb) {

            	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
            	OrmucoReceiver.getLastOrmucoToken(options.receiverinfo, function(ormucoToken){
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

                if(ormucoToken == 'ENOENT'){
                	// return 404
				  	return emitter__.emit('notfound', {
		  				name: '__newFile.filename'
		  			});
                }

				var thumboptions = {
				  host: url,
				  port: 443,
				  path: '/swift/v1/'+options.receiverinfo.bucket+'/'+options.id,
				  method: 'GET',
				  headers: { //We can define headers too
				    'X-Auth-Token': ormucoToken,//'8c0dad7ea7b64812acedfc2ace952b7e'//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
				  },
				  rejectUnauthorized: false
				};

				http.request(thumboptions, function(ormucoRes) {
				  console.log('STATUS: ' + ormucoRes.statusCode);
				  console.log('HEADERS: ' + JSON.stringify(ormucoRes.headers));
				  // res.setEncoding('utf8');
				  if(ormucoRes.statusCode == 200){
				  	console.log('returning chunk', ormucoRes.statusCode);
				    ormucoRes.pipe(emitter__)//pipe to current request
				    .pipe(fsx.createWriteStream( sails.config.appPath + ('/../master/public/images/profile/') +options.id));//cache image in local server(so that next time it will be picked from Disk)
				    
				  }else{

				  	// ELSE: return 404
				  	emitter__.emit('notfound', {
		  				name: '__newFile.filename'
		  			});
				  }
				}).end();
            }]//async.auto::downloadTask()
        });

		return emitter__;
	},

	newLogoEmitterStream: function newLogoEmitterStream (options) {

		console.log('newProfileEmitterStreamnewProfileEmitterStreamnewProfileEmitterStream');
		sails.log('Downloading '+options.id+' using from Ormuco.');
		
		var Duplex = require('stream').Duplex;
		var emitter__ = Duplex();		

		emitter__._write = function (chunk, encoding, next) {
			emitter__.push(chunk, encoding);
			next();
			return true;
		}

		emitter__._read = function(size) {
			return;
		}

		var http = require('https');
		var url = 'objects.ormuco.com';


		async.auto({
            getOrmucoToken: function(cb) {

            	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
            	OrmucoReceiver.getLastOrmucoToken(options.receiverinfo, function(ormucoToken){
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

                if(ormucoToken == 'ENOENT'){
                	// return 404
				  	return emitter__.emit('notfound', {
		  				name: '__newFile.filename'
		  			});
                }

				var thumboptions = {
				  host: url,
				  port: 443,
				  path: '/swift/v1/'+options.receiverinfo.bucket+'/'+options.id,
				  method: 'GET',
				  headers: { //We can define headers too
				    'X-Auth-Token': ormucoToken,//'8c0dad7ea7b64812acedfc2ace952b7e'//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
				  },
				  rejectUnauthorized: false
				};

				http.request(thumboptions, function(ormucoRes) {
				  console.log('STATUS: ' + ormucoRes.statusCode);
				  console.log('HEADERS: ' + JSON.stringify(ormucoRes.headers));
				  // res.setEncoding('utf8');
				  if(ormucoRes.statusCode == 200){
				  	console.log('returning chunk', ormucoRes.statusCode);
				    ormucoRes.pipe(emitter__)//pipe to current request
				    .pipe(fsx.createWriteStream( sails.config.appPath + ('/../master/public/images/enterprises/') +options.id));//cache image in local server(so that next time it will be picked from Disk)
				    
				  }else{

				  	// ELSE: return 404
				  	emitter__.emit('notfound', {
		  				name: '__newFile.filename'
		  			});
				  }
				}).end();
            }]//async.auto::downloadTask()
        });

		return emitter__;
	},

	/**
		* Build a mock readable stream that emits incoming files.
		* (used for file downloads)
		* @return {Stream.Readable}
	*/

	md5EmitterStream: function md5EmitterStream (options,cb) {//No need in Ormuco, as Ormuco itself provides md5 hash for the files

		var crypto = require('crypto');
		sails.log('Downloading '+options.id+' using from Ormuco.');

		var client = knox.createClient({
			key: options.receiverinfo.accessKeyId,//sails.config.adapters.s3.apiKey, 
			secret: options.receiverinfo.secretAccessKey,//sails.config.adapters.s3.apiSecret,
			bucket: options.receiverinfo.bucket//sails.config.adapters.s3.bucket
		});

		client.getFile(options.id, function( err, s3res ) {

			if (err) {
				cb(null, 'ENOENT');
			}

            if (options.stream) {

				var fileWrite = s3res.pipe(fsx.createWriteStream(('files/')+""+options.id));
				fileWrite.on('finish', function(){

					var hash = crypto.createHash('md5');
                    console.log('cbfirstcbfirstcbfirstcbfirstcbfirstcbfirst');
                    // console.log(cb);
                    var s = fsx.createReadStream((sails.config.appPath + '/files/' || 'files/')+'' + options.id);
                    s.on('readable', function () {
                        console.log('firstFileReadable');
                        var chunk;
                        while (null !== (chunk = s.read())) {
                            hash.update(chunk);
                        }
                    }).on('end', function () {
                        console.log('firstFileEnd');
                        // console.log(cb);
                        // encryptedData["first"] = hash.digest('hex');
                        fileHash = hash.digest('hex')

                        //Unlink the file now
						fsx.unlink(('files/')+""+options.id);

                    	if(typeof cb != 'undefined')
				        	cb(null, fileHash);

                    }).on('error', function(e){
                        console.log('firstFileError');
                        console.log(e);
                        cb(null, 'ENOENT');
                    });
		            // return s3res.pipe(options.stream);
				});
	        }
			// s3res.pipe(emitter__);
		});
		// return emitter__;
	},

	/**
	 * Build a mock writable stream that handles incoming files.
	 * (used for file uploads)
	 * 
	 * @return {Stream.Writable}
	 */
	
	newReceiverStream: function newReceiverStream (options) {

		sails.log('Created new Ormuco receiver.');

		var log = sails.log;

		var Writable = require('stream').Writable;
		var receiver__ = Writable({objectMode: true});
		// var client = knox.createClient({
		// 	key: options.receiverinfo.accessKeyId,//sails.config.adapters.s3.apiKey, 
		// 	secret: options.receiverinfo.secretAccessKey,//sails.config.adapters.s3.apiSecret,
		// 	bucket: options.receiverinfo.bucket,//sails.config.adapters.s3.bucket
		// });

		receiver__._write = function onFile (__newFile, encoding, next) {

		    // Create a unique(?) filename
		    var fsName = UUIDGenerator.v1();
			log(('Receiver: Received file `'+__newFile.filename+'` from an Upstream.').grey);

			async.auto({
	            getOrmucoToken: function(cb) {

	            	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
	            	OrmucoReceiver.getLastOrmucoToken(options.receiverinfo, function(ormucoToken){
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

	                if(ormucoToken == 'ENOENT'){
	                	// return 404
					  	return emitter__.emit('notfound', {
			  				name: '__newFile.filename'
			  			});
	                }

					var http = require('https');
					var url = 'objects.ormuco.com';
					// var request = require("request");
					var progress = require('progress-stream');
					var fs = require('fs');
					 
					// var stat = fs.statSync(filename);
					var str = progress({
					    length: options.totalUploadSize,//stat.size,
					    time: 100
					});
					 
					str.on('progress', function(data) {
					    console.log('ormuco: '+data.percentage);

					    receiver__.emit('progress', {
							name: __newFile.filename,
							written: data.transferred,//data.written,
							total: data.length,//data.total,
							percent: Math.round(data.percentage,2),//data.percent
						});
					});

					// var ormucoToken = '8c0dad7ea7b64812acedfc2ace952b7e';//'74835fd50fef42799c924a2e80fd5110';//'9d3f0e39c220458b83c43c85c8a7b2da';

					var OrmucoUploadReq = http.request({
					  host: url,
					  port: 443,
					  path: '/swift/v1/'+options.receiverinfo.bucket+'/'+fsName,//__newFile.filename,
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
					  	__newFile.extra = res.headers?{'hash':res.headers.etag}:{};//{};//body;
						__newFile.extra.fsName = fsName;

						console.log('__newFile.extra');
						console.log(__newFile.extra);

						log(('Receiver: Finished writing `'+__newFile.filename+'`').grey);
						next();
					  }else if(res.statusCode == 401){
						log(('Receiver: Error writing `'+__newFile.filename+'`:: '+ res.statusCode+' :: Cancelling upload and cleaning up already-written bytes...').red);
						receiver__.emit('error', res.statusCode);
						return;
					  }
					});

					OrmucoUploadReq.on('error', function(e) {
					  console.log('problem with request: ' + e.message);
					});

					__newFile.pipe(str).pipe(OrmucoUploadReq);

					/*var fileWrite = __newFile.pipe(str).pipe(OrmucoUploadReq).pipe(fsx.createWriteStream(('files/')+""+options.id));
					fileWrite.on('finish', function(){

						easyimg.resize({
							src: ('files/')+''+options.id, 
							dst: ('files/')+'thumbnail-'+options.id, width: 150, height: 150
						}).then(
							
							function(image) {

								console.log('image resized');
								// easyimg.resize({
				    //             	src: ('files/')+''+options.id, 
				    //             	dst: '/var/www/html/olympus/master/public/images/thumbnail-'+options.id, width: 150, height: 150
				    //         	}).then(function(image){




				    //         			console.log('THUMB image THUMB image THUMB image THUMB image');
				    //         			console.log(image);

				    //         			var mpu = new MultiPartUpload(
								// 	            {
								// 	                client: client,
								// 	                objectName: 'thumbnails/'+image.name, // Amazon S3 object name
								// 	                file: image.path// path to the file
								// 	            },
								// 	            // Callback handler
								// 	            function(err, body) {

								// 	            	console.log('mpuBodympuBodympuBodympuBodympuBodympuBodympuBodympuBody');
								// 	            	if (err) {
								// 	            		console.log(err);
								// 	            	}
								// 	            	console.log(body);
								// 	                // If successful, will return body, containing Location, Bucket, Key, ETag and size of the object
									                
								// 	                  // {
								// 	                  //     Location: 'http://Example-Bucket.s3.amazonaws.com/destination.txt',
								// 	                  //     Bucket: 'Example-Bucket',
								// 	                  //     Key: 'destination.txt',
								// 	                  //     ETag: '"3858f62230ac3c915f300c664312c11f-9"',
								// 	                  //     size: 7242880
								// 	                  // }
									                
								// 	            }
								// 	        );

				    //         			fsx.unlink(('files/')+""+options.id);
				    //         		},
				    //             	function (err) {
				    //             		console.log(err);
				    //             	}
				    //             );
				            },
				            function (err) {
				                console.log(err);
				            }
				        );
			            return s3res.pipe(options.stream);
					});*/
					// fsx.createReadStream('somefile.zip').pipe(req);
				}]//downloadTask
			});
		};
		
		return receiver__;
	},

	/**
	 * Build a mock readable stream that emits incoming files.
	 * (used for file downloads)
	 * 
	 * @return {Stream.Readable}
	 */
	deleteobject: function newEmitterStream (options,serviceCallback) {

		sails.log('Deleting '+options.id+' using from Ormuco.');

		// sails.log(options);

		async.auto({
            getOrmucoToken: function(cb) {

            	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
            	OrmucoReceiver.getLastOrmucoToken(options.receiverinfo, function(ormucoToken){
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

				var http = require('https');

				var url = 'objects.ormuco.com';

				var reqOptions = {
				  host: url,
				  port: 443,
				  path: '/swift/v1/'+options.receiverinfo.bucket+'/'+options.id,
				  method: 'DELETE',
				  headers: { //We can define headers too
				    'X-Auth-Token': ormucoToken//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
				  },
				  rejectUnauthorized: false
				};

				http.request(reqOptions, function(res) {
				  console.log('STATUS11: ' + res.statusCode);
				  if( res.statusCode != 204 && res.statusCode != 404 ){
					sails.log('res.statusCode11: ', res.statusCode);
				  	serviceCallback();
				  }else{
				  	// cb();

				  	//Delete Thumbnails
				  	fsx.unlink((options.receiverinfo.path||sails.config.appPath + '/files/')+'thumbnail-' + options.id, function(err){
			          // if (err) console.log(err);
			        });
			        fsx.unlink((options.receiverinfo.path||sails.config.appPath + '/files/')+'thumbnail-thumbnail-' + options.id, function(err){
			          // if (err) console.log(err);
			        });
			        fsx.unlink( sails.config.appPath + '/../master/public/images/thumbnail-thumbnail-'+options.id, function(err){
			          // if (err) console.log(err);
			        });
				  	var thumbOptions = {
					  host: url,
					  port: 443,
					  path: '/swift/v1/'+options.receiverinfo.bucket+'/thumbnail-'+options.id,
					  method: 'DELETE',
					  headers: { //We can define headers too
					    'X-Auth-Token': ormucoToken//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
					  },
					  rejectUnauthorized: false
					};

					http.request(thumbOptions, function(res) {
					  console.log('STATUS22: ' + res.statusCode);
					  if( res.statusCode != 204 && res.statusCode != 404 ){
					  	sails.log('res.statusCode22: ', res.statusCode);
					  	serviceCallback();
					  }else{
					  	serviceCallback();
					  }
					}).end();
				  }
				}).end();
			}]
		});
	},

	deleteAll: function newEmitterStream (options, finalCallback) {

		sails.log('Deleting '+options.id+' using from Ormuco.');

		var ormucoToken;
		var http = require('https');

		var url = 'objects.ormuco.com';

		// sails.log(options);
		function deleteFiles(files, callback){
		   	if (files.length==0) callback();
		   	else {
		   	  	// console.log(files);
		      	var f = files.pop();

		      	console.log('files.pop', options.receiverinfo.bucket, ' f: ', f, 'ormucoToken', ormucoToken);

		      	var reqOptions = {
				  host: url,
				  port: 443,
				  path: '/swift/v1/'+options.receiverinfo.bucket+'/'+f,
				  method: 'DELETE',
				  headers: { //We can define headers too
				    'X-Auth-Token': ormucoToken//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
				  },
				  rejectUnauthorized: false
				};

				http.request(reqOptions, function(res) {
				  console.log('STATUS: ' + res.statusCode);
				  if( res.statusCode != 204 && res.statusCode != 404 ){
					sails.log('res.statusCode: ', res.statusCode);
			        deleteFiles(files, callback);
				  }else{
				  	// deleteFiles(files, callback);

				  	//Delete Thumbnails
				  	fsx.unlink((options.receiverinfo.path||sails.config.appPath + '/files/')+'thumbnail-' + f, function(err){
			          // if (err) console.log(err);
			        });
			        fsx.unlink((options.receiverinfo.path||sails.config.appPath + '/files/')+'thumbnail-thumbnail-' + f, function(err){
			          // if (err) console.log(err);
			        });
			        fsx.unlink(sails.config.appPath + '/../master/public/images/thumbnail-thumbnail-'+f, function(err){
			          // if (err) console.log(err);
			        });
				  	var thumbOptions = {
					  host: url,
					  port: 443,
					  path: '/swift/v1/'+options.receiverinfo.bucket+'/thumbnail-'+f,
					  method: 'DELETE',
					  headers: { //We can define headers too
					    'X-Auth-Token': ormucoToken//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
					  },
					  rejectUnauthorized: false
					};

					http.request(thumbOptions, function(res) {
					  console.log('STATUS: ' + res.statusCode);
					  if( res.statusCode != 204 && res.statusCode != 404 ){
					  	sails.log('res.statusCode: ', res.statusCode);
			            deleteFiles(files, callback);
					  }else{
					  	console.log(f + ' thumbnails deleted from disk.');
			            deleteFiles(files, callback);
					  }
					}).end();
				  }
				}).end();
		   	}
		}

		async.auto({
            getOrmucoToken: function(cb) {

            	// console.log('getOrmucoTokengetOrmucoTokengetOrmucoTokengetOrmucoToken');
            	OrmucoReceiver.getLastOrmucoToken(options.receiverinfo, function(ormucoToken){
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

                ormucoToken        = up.getOrmucoToken;

				// sails.log(options);
				if(options.ids != ''){
					console.log("options.ids.split(',') :", options.ids.split(','));
					deleteFiles(options.ids.split(','), function(){//delete thumbs from local

						sails.log('Deleting files '+options.ids+' using from Ormuco.');
						
						// client.deleteMultiple(options.ids.split(','),function (err, res) {//delete files from Ormuco
						// 	if(err){
						// 		console.log(err);
						// 		finalCallback();
						// 	}
							finalCallback();
						// });
					});	
				}else{
					finalCallback();
				}
			}]
		});
	}

};
