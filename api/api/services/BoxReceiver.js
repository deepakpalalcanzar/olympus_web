var fsx 		= require('fs-extra');
var MultiPartUpload 	= require('knox-mpu');
var knox 		= require('knox');
var UUIDGenerator 	= require('node-uuid');
var easyimg 		= require('easyimage');
var path 		= require('path');
var https 		= require('https');

module.exports = {


	/**
	 * Build a mock readable stream that emits incoming files.
	 * (used for file downloads)
	 *
	 * @return {Stream.Readable}
	 */
	newEmitterStream: function newEmitterStream (options) {

		sails.log('Downloading '+options.id+' using from S3.');

		var client = knox.createClient({
			key: options.receiverinfo.accessKeyId,//sails.config.adapters.s3.apiKey,
			secret: options.receiverinfo.secretAccessKey,//sails.config.adapters.s3.apiSecret,
			bucket: options.receiverinfo.bucket//sails.config.adapters.s3.bucket
		});

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

		console.log('75757575757575757575757575757575757575757575');

		client.getFile(options.id, function( err, s3res ) {

			if (err) {
				console.log('7676767676767676767676767676767676767676767676');
				emitter__.emit('error', err);
			}

			console.log('78787878787878787878787878787878787878787878');
	            if (options.stream) {
	               return s3res.pipe(options.stream);
	            }

			s3res.pipe(emitter__);
		});



		return emitter__;
	},





	/**
		* Build a mock readable stream that emits incoming files.
		* (used for file downloads)
		* @return {Stream.Readable}
	*/

	newThumbEmitterStream: function newThumbEmitterStream (options) {

		sails.log('Downloading '+options.id+' using from S3.');

		/*File.update({
            fsName: options.id
        }, {
            md5checksum         : 'checkingup'
        }).exec(function(err, file){
        	console.log('S3ReceiverS3ReceiverS3ReceiverS3Receiver');
        	console.log(file)
        	console.log('S3ReceiverS3ReceiverS3ReceiverS3Receiver');
        });*/

		var client = knox.createClient({
			key: options.receiverinfo.accessKeyId,//sails.config.adapters.s3.apiKey,
			secret: options.receiverinfo.secretAccessKey,//sails.config.adapters.s3.apiSecret,
			bucket: options.receiverinfo.bucket//sails.config.adapters.s3.bucket
		});

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

		client.getFile('thumbnails/thumbnail-'+options.id, function( err, s3res ) {

			if (err) {
				emitter__.emit('error', err);
			}
			if(s3res.statusCode == 200){
				s3res.pipe(emitter__)
				.pipe(fsx.createWriteStream(('files/')+"thumbnail-"+options.id));//cache image in local server(so that next time it will be picked from Disk)
			}else if(s3res.statusCode == 404){

				client.getFile(options.id, function( err, s3res ) {

					if (err) {
						emitter__.emit('error', err);
					}

		            if (options.stream) {

						var fileWrite = s3res.pipe(fsx.createWriteStream(('files/')+""+options.id));
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




					            			console.log('THUMB image THUMB image THUMB image THUMB image');
					            			console.log(image);

					            			var mpu = new MultiPartUpload(
										            {
										                client: client,
										                objectName: 'thumbnails/'+image.name, // Amazon S3 object name
										                file: image.path// path to the file
										            },
										            // Callback handler
										            function(err, body) {

										            	console.log('mpuBodympuBodympuBodympuBodympuBodympuBodympuBodympuBody');
										            	if (err) {
										            		console.log(err);
										            	}
										            	console.log(body);
										                // If successful, will return body, containing Location, Bucket, Key, ETag and size of the object

										                  // {
										                  //     Location: 'http://Example-Bucket.s3.amazonaws.com/destination.txt',
										                  //     Bucket: 'Example-Bucket',
										                  //     Key: 'destination.txt',
										                  //     ETag: '"3858f62230ac3c915f300c664312c11f-9"',
										                  //     size: 7242880
										                  // }

										            }
										        );

					            			fsx.unlink(('files/')+""+options.id);
					            		},
					                	function (err) {
					                		console.log(err);
					                		return s3res.pipe(options.stream);
					                	}
					                );
					            },
					            function (err) {
					                console.log(err);
					                return s3res.pipe(options.stream);
					            }
					        );
				            // return s3res.pipe(options.stream);//Rishabh: possible bug of returning raw image first time instead of thumbnail
						});
			        }
					s3res.pipe(emitter__);
				});
			}
			console.log('s3ress3ress3ress3ress3ress3ress3ress3ress3ress3res');
		});

		return emitter__;
	},

	newProfileEmitterStream: function newThumbEmitterStream (options) {

		console.log('newProfileEmitterStreamnewProfileEmitterStreamnewProfileEmitterStream');
		sails.log('Downloading '+options.id+' using from S3.');

		/*File.update({
            fsName: options.id
        }, {
            md5checksum         : 'checkingup'
        }).exec(function(err, file){
        	console.log('S3ReceiverS3ReceiverS3ReceiverS3Receiver');
        	console.log(file)
        	console.log('S3ReceiverS3ReceiverS3ReceiverS3Receiver');
        });*/

		var client = knox.createClient({
			key: options.receiverinfo.accessKeyId,//sails.config.adapters.s3.apiKey,
			secret: options.receiverinfo.secretAccessKey,//sails.config.adapters.s3.apiSecret,
			bucket: options.receiverinfo.bucket//sails.config.adapters.s3.bucket
		});

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

		client.getFile('profile/'+options.id, function( err, s3res ) {

			// if (err) {
			// 	emitter__.emit('error', err);
			// }
			console.log('errerrerrerrerrerrerrerrerrerrerrerrerrerrerrerrerr');
			console.log(err);
			if(s3res.statusCode == 200){
				s3res.pipe(emitter__)
				.pipe(fsx.createWriteStream( sails.config.appPath + ('/../master/public/images/profile/') +options.id));//cache image in local server(so that next time it will be picked from Disk)
			}else if(s3res.statusCode == 404){
				emitter__.emit('risherror', {
					name: '__newFile.filename'
				});
				return false;
			}
			console.log('s3ress3ress3ress3ress3ress3ress3ress3ress3ress3res');
		});

		return emitter__;
	},

	newLogoEmitterStream: function newLogoEmitterStream (options) {

		console.log('newLogoEmitterStreamnewLogoEmitterStreamnewLogoEmitterStreamnewLogoEmitterStream');
		sails.log('Downloading '+options.id+' using from S3.');

		/*File.update({
            fsName: options.id
        }, {
            md5checksum         : 'checkingup'
        }).exec(function(err, file){
        	console.log('S3ReceiverS3ReceiverS3ReceiverS3Receiver');
        	console.log(file)
        	console.log('S3ReceiverS3ReceiverS3ReceiverS3Receiver');
        });*/

		var client = knox.createClient({
			key: options.receiverinfo.accessKeyId,//sails.config.adapters.s3.apiKey,
			secret: options.receiverinfo.secretAccessKey,//sails.config.adapters.s3.apiSecret,
			bucket: options.receiverinfo.bucket//sails.config.adapters.s3.bucket
		});

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

		client.getFile('enterprises/'+options.id, function( err, s3res ) {

			// if (err) {
			// 	emitter__.emit('error', err);
			// }
			console.log('errerrerrerrerrerrerrerrerrerrerrerrerrerrerrerrerr');
			console.log(err);
			if(s3res.statusCode == 200){
				s3res.pipe(emitter__)
				.pipe(fsx.createWriteStream( sails.config.appPath + ('/../master/public/images/enterprises/') +options.id));//cache image in local server(so that next time it will be picked from Disk)
			}else if(s3res.statusCode == 404){
				emitter__.emit('risherror', {
					name: '__newFile.filename'
				});
				return false;
			}
			console.log('s3ress3ress3ress3ress3ress3ress3ress3ress3ress3res');
		});

		return emitter__;
	},

	/**
		* Build a mock readable stream that emits incoming files.
		* (used for file downloads)
		* @return {Stream.Readable}
	*/

	md5EmitterStream: function md5EmitterStream (options,cb) {

		var crypto = require('crypto');
		sails.log('Downloading '+options.id+' using from S3.');

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
		//return receiver__;

		sails.log('Created new Dropbox receiver.');

		var log = sails.log;

		var fs 			= require('fs');
		//var google 		= require('googleapis');

		var Writable = require('stream').Writable;
		var receiver__ = Writable({objectMode: true});
		//return receiver__;

		 console.log('testong');

		receiver__._write = function onFile (__newFile, encoding, next) {

			// Create a unique(?) filename
		    var fsName = UUIDGenerator.v1();
		    __newFile.extra = {fsName:fsName};

			//return receiver__;
			log(('Receiver: Received file `'+__newFile.filename+'` from an Upstream.').grey);

			var dbxpath 	= __newFile.filename;
			var dbxToken 	= options.receiverinfo.auth.access_token;


						var progress = require('progress-stream');
						var fs = require('fs');

						// var stat = fs.statSync(filename);
						var str = progress({
						    length: options.totalUploadSize,//stat.size,
						    time: 100
						});

						str.on('progress', function(data) {
			    console.log('Box: '+data.percentage);

						    if(data.percentage == 100){
						    	console.log('TRUEE data.percentage == : ',data.percentage);

			  		// fs.chmodSync('test', 0755);
					// fs.chmodSync('test', '755');
					fs.chmodSync(sails.config.appPath + '/../master/public/images/'+__newFile.filename, 0755);
								// var stream = fs.createReadStream('files/email.jpg');
					var stream = fs.createReadStream(sails.config.appPath + '/../master/public/images/'+__newFile.filename);

								var superagent = require('superagent');
					boxRequest = superagent
								.post('https://upload.box.com/api/2.0'+'/'+'files'+'/content')
								.set('Authorization', 'Bearer '+options.receiverinfo.auth.access_token)//this.options.auth
								.attach('filename', stream)

								// If file is to be uploaded with same name as in the disk
								// .field('parent_id', 0)
					// .attach('filename', __newFile.filename)
								// If file is to be uploaded with different name as in the disk
								.field('attributes', JSON.stringify({
								  parent: {
					    id: options.receiverinfo.boxpath
								  },
					  name: __newFile.filename
					}));

					BoxReceiver.doBoxRequest(options.receiverinfo.auth, boxRequest,function onBoxComplete (err, boxfile) {

                        if(err && ( err.status != 200 || err.status != 201) ){//refresh token expired too
							console.log('boxfile', err, 'boxfile');
                        	receiver__.emit('error', err.status);
                        }else{
                        	console.log('Box File Uploaded successfully' );
                        	__newFile.extra = boxfile.body && boxfile.body.entries.length ?boxfile.body.entries[0]:{};//{};//body;
							__newFile.extra.fsName = fsName;
							__newFile.extra.Code = 'boxUpload';
							console.log('__newFile.extra');
							console.log(__newFile.extra);
							log(('Receiver: Finished writing `'+__newFile.filename+'`').grey);
							next();
								  }


                    });

						    }
						    receiver__.emit('progress', {
								name: __newFile.filename,
								written: data.transferred,//data.written,
								total: data.length,//data.total,
								percent: Math.round(data.percentage,2),//data.percent
							});
						});

					/*var http = require('https');
					var OrmucoUploadReq = http.request({
					  host: 'upload.box.com',
					  port: 443,
					  path: '/api/2.0'+'/'+'files'+'/content',
					  method   : 'POST',
					  headers: { //We can define headers too
					    'Authorization': 'Bearer 7Munnbfn9YTbxlACPrxsbigkL0BHEXhv',//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
					  },
					  body:    formData,
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

					__newFile.pipe(str).pipe(OrmucoUploadReq);*/

			// __newFile.pipe(str).pipe(fsx.createWriteStream(('files/')+""+"olympus.png"));//Unsupported content with type: image/jpeg dropbox
			__newFile.pipe(str).pipe(fsx.createWriteStream(sails.config.appPath + '/../master/public/images/'+__newFile.filename));//Unsupported content with type: image/jpeg dropbox
			// __newFile.pipe(str).pipe(dropboxUploadReq);//verify if it provides the correct progress

		}//end receiver write
		console.log('step-4');

		return receiver__;
	},
	doBoxRequest: function(tokenrow, boxRequest, callback){
	    console.log('typeof boxRequest : ', boxRequest);
	    boxRequest
	    .end(function(err, boxfile){
	    	console.log(err && err.status == 401);
	    	console.log(tokenrow && tokenrow.refresh_token);
	        if( err && err.status == 401 && tokenrow && tokenrow.refresh_token ){//Try Refreshing the tokens once
	        	console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', tokenrow.refresh_token);
	            var superagent = require('superagent');
	            superagent
	            .post('https://app.box.com/api' + '/oauth2/token')
	            .field('grant_type', "refresh_token")
	            .field('client_id', 'cbev0e1mrb9jrmvc90gdvwmyworca1nx')
	            .field('client_secret', 'UHa0J0epfLX0WoYOQ1JCmYpxvGLyDv8k')
	            .field('refresh_token', tokenrow.refresh_token)
	            .end(function (errRefresh, resRefresh) {
	                console.log('checkcheckcheckcheckcheckcheckcheckcheckcheckcheckcheck');
	                if(resRefresh.status == 200 && typeof resRefresh.body.access_token != 'undefined' || typeof resRefresh.body.refresh_token != 'undefined')
	                {
	                    // self.updateAccessToken(res.body.access_token);
	                    console.log('res.body.access_token', resRefresh.body.access_token,'res.body.refresh_token', resRefresh.body.refresh_token);
	                    tokenrow.access_token     = resRefresh.body.access_token;
	                    tokenrow.refresh_token    = resRefresh.body.refresh_token;
	                    tokenrow.save(function(err) {
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
	        	console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
	            callback(err, boxfile);
	        }
	        // console.log(boxfile, err, 'boxfile');
	        // console.log('Box '+INodeModelType+':'+boxFileId+' Renamed successfully to '+newName );
	    });
	},

	/**
	 * Build a mock readable stream that emits incoming files.
	 * (used for file downloads)
	 *
	 * @return {Stream.Readable}
	 */
	deleteobject: function newEmitterStream (options,cb) {

		sails.log('Deleting '+options.id+' using from S3.');

		sails.log(options);

		var client = knox.createClient({
			key: options.receiverinfo.accessKeyId,
			secret: options.receiverinfo.secretAccessKey,
			bucket: options.receiverinfo.bucket
		});

		client.deleteFile(options.id, function(err, res) {

			if(err){
				sails.log(err);
				// return res.send(500);
			}
			// return res.send(200);throwing TypeError: Object #<IncomingMessage> has no method 'send'

			client.deleteFile( 'thumbnails/thumbnail-' + options.id, function(err, res) {

				cb();

				if(err){
					sails.log(err);
					// return res.send(500);
				}
				// return res.send(200);throwing TypeError: Object #<IncomingMessage> has no method 'send'

	        });

        });
	},

	deleteAll: function newEmitterStream (options,cb) {

		sails.log('Deleting '+options.id+' using from S3.');

		// sails.log(options);

		var client = knox.createClient({
			key: options.receiverinfo.accessKeyId,
			secret: options.receiverinfo.secretAccessKey,
			bucket: options.receiverinfo.bucket
		});

		function deleteFiles(files, callback){
		   	if (files.length==0) callback();
		   	else {
		   	  	// console.log(files);
		      	var f = files.pop();

		      	// fsx.unlink((options.receiverinfo.path||sails.config.appPath + '/files/')+'' + f, function(err){
		          	// if (err) console.log(err);

		          	fsx.unlink((options.receiverinfo.path||sails.config.appPath + '/files/')+'thumbnail-' + f, function(err){
			          // if (err) console.log(err);
			        });
			        fsx.unlink((options.receiverinfo.path||sails.config.appPath + '/files/')+'thumbnail-thumbnail-' + f, function(err){
			          // if (err) console.log(err);
			        });
			        // fs.unlink(sails.config.linuxPath+'master/public/images/thumbnail/'+fileModel.name, function(err){
			          // if (err) console.log(err);
			        // });
			        fsx.unlink('/var/www/html/master/public/images/thumbnail-thumbnail-'+f, function(err){
			          // if (err) console.log(err);
			        });

			        // if (err) callback(err);
			        // else {
			            console.log(f + ' thumbnails deleted from disk.');
			            deleteFiles(files, callback);
			        // }
		        // });
		   	}
		}

		// sails.log(options);
		if(options.ids != ''){
			deleteFiles(options.ids.split(','), function(){//delete thumbs from local

				sails.log('Deleting '+options.ids+' using from S3.');

				client.deleteMultiple(options.ids.split(','),function (err, res) {//delete files from s3
					if(err){
						console.log(err);
						cb();
					}

					console.log('Deleting thumbnails from S3.');
					var img_array = options.ids.split(',');

					console.log(img_array);

					for(var i=0;i<img_array.length;i++){
					    img_array[i]= "thumbnails/thumbnail-" + img_array[i];
					}

					client.deleteMultiple(img_array,function (err, res) {//delete thumbnail files from s3
						if(err){
							console.log(err);
							cb();
						}

				    	cb();//final callback
				    });
			    });
			});
		}else{
			cb();
		}
	}

};
