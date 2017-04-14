var MetaController = {
	
	// Optionally identify the controller here
	// Otherwise name will be based off of filename
	// CASE-INSENSITIVE
	id: 'meta',
	
	home: function (req,res) {

		async.auto({
			syncBox: function(cbmain) {

                // UploadPaths.find({where:{isActive:1}}).done(cb);
                console.log('test99999999999999999999999999999999', req.session.Account.id);
				SyncBox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
		            if (err){
		            	console.log(err, ' :ERRROR');
		                return cbmain();
		            }

		            if( tokenrow ){

		                //Set it as Active
		                console.log('Dropbox Token Found: '+tokenrow.access_token);

                		console.log('callback node_dropbox AccessToken');
						access_token = tokenrow.access_token;
						console.log('access-token - '+access_token);

						if( ( typeof access_token ) != 'undefined'){
							console.log('access_token is retrieved');
							//api = node_dropbox.api(access_token);

		                    async.auto({

		                        checkdir: function (cb) {

							        var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dir.OwnerId =? AND dir.isWorkgroup = 1";//where dp.AccountId =?
							        sql = Sequelize.Utils.format([sql, req.session.Account.id]);
							        sequelize.query(sql, null, {
							            raw: true
							        }).success(function (workgroup) {

								        if(workgroup.length > 0){
							                var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dir.DirectoryId = ? AND dir.isOlympusBoxDir = 1";//where dp.AccountId =?
							                sql = Sequelize.Utils.format([sql, workgroup[0].id]);

				                            sequelize.query(sql, null, {
				                                raw: true
				                            }).success(function (directory) {
				                                if(directory.length > 0){
				                                    console.log('directoryFOUNDdirectoryFOUNDdirectoryFOUND');
				                                    cb(null, directory[0]);
				                                }else{
				                                    console.log('creatingDRIVEcreatingDRIVEcreatingDRIVEcreatingDRIVE');
				                                    Directory.create({
				                                        name: 'BOX',
				                                        directoryId: workgroup[0].id,
				                                        isOlympusBoxDir: true,
				                                        isBoxDir: false,
				                                        uploadPathId: tokenrow.id
				                                    }).done(function(err, newdir){

				                                        if(err)
				                                            return res.send(err, 500);

				                                        DirectoryPermission.create({
				                                            type: 'admin',
				                                            accountId: req.session.Account.id,
				                                            directoryId: newdir.id
				                                        }).done(function(donepermission){
                                            // console.log(donepermission);
				                                            cb(null, newdir);
				                                        });
				                                    });
				                                }
				                            }).error(function (e) {
				                                return res.send(e, 500);
				                                // throw new Error(e);
				                            });
				                        }else{
							                return res.send(500, "No Workgroup Found for this account.");
		                                }
		                            }).error(function (e) {
		                                return res.send(e, 500);
		                                // throw new Error(e);
		                            });
		                        },
		                        newDirectory: ['checkdir', function (cb, r) { // Create the new directory
		                            console.log(r.checkdir.id);
		                            parentDir = r.checkdir;

		                            //=============================================================================
		                            //Call Recursive sync function for box
		                            //=============================================================================
		                            console.log(req.session, 'syncBoxRecursive');
		                            MetaController.syncBoxRecursive(req, parentDir, 'root', tokenrow, cbmain);
		                            //cbmain();
		                            //=============================================================================
		                        }]
		                    });
						}else{
							console.log('access token undefined');
							cbmain();
						}
					}else{
						cbmain();
					}
		        });
				//cbmain();
            },
            syncDbox: function(cbmain) {

                // UploadPaths.find({where:{isActive:1}}).done(cb);
                console.log('test99999999999999999999999999999999');
				SyncDbox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
		            if (err)
		                return cbmain();

		            if( tokenrow ){
		            	var node_dropbox = require('node-dropbox');
		            	// Set it as Active
		            	console.log('Dropbox Token Found: '+tokenrow.access_token);
		            	console.log('callback node_dropbox AccessToken');
		            	access_token = tokenrow.access_token;

						if( ( typeof access_token ) != 'undefined'){

							console.log('access_token is retrieved');
							api = node_dropbox.api(access_token);

		                    async.auto({
		                        checkdir: function (cb) {

		                        	var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dir.OwnerId =? AND dir.isWorkgroup = 1";//where dp.AccountId =?
							        sql = Sequelize.Utils.format([sql, req.session.Account.id]);
							        sequelize.query(sql, null, {
							            raw: true
							        }).success(function (workgroup) {

							            if(workgroup.length > 0){
							                var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dir.DirectoryId = ? AND dir.isOlympusDropboxDir = 1";//where dp.AccountId =?
							                sql = Sequelize.Utils.format([sql, workgroup[0].id]);


				                            // console.log(sql);
				                            sequelize.query(sql, null, {
				                                raw: true
				                            }).success(function (directory) {
				                                if(directory.length > 0){
				                                    console.log('directoryFOUNDdirectoryFOUNDdirectoryFOUND');
				                                    cb(null, directory[0]);
				                                }else{
				                                    console.log('creatingDRIVEcreatingDRIVEcreatingDRIVEcreatingDRIVE');
				                                    Directory.create({
				                                        name: 'DROPBOX',
				                                        directoryId: workgroup[0].id,
				                                        isOlympusDropboxDir: true,
				                                        isDropboxDir: false,
				                                        uploadPathId: tokenrow.id
				                                    }).done(function(err, newdir){

				                                        if(err)
				                                            return res.send(err, 500);

				                                        DirectoryPermission.create({
				                                            type: 'admin',
				                                            accountId: req.session.Account.id,
				                                            directoryId: newdir.id
				                                        }).done(function(donepermission){
				                                            // console.log(donepermission);
				                                            cb(null, newdir);
				                                        });
				                                    });
				                                }
				                            }).error(function (e) {
				                                return res.send(e, 500);
				                                // throw new Error(e);
				                            });
				                        }else{
							                return res.send(500, "No Workgroup Found for this account.");
							            }
							        }).error(function (e) {
							            return res.send(e, 500);
							            // throw new Error(e);
							        });
		                        },
		                        newDirectory: ['checkdir', function (cb, r) { // Create the new directory
		                            console.log(r.checkdir.id);
		                            parentDir = r.checkdir;

		                            //=============================================================================
		                            //Call Recursive sync function for dropbox
		                            //=============================================================================
		                            MetaController.syncDbRecursive(req, api, parentDir, 'root', tokenrow, cbmain);
		                            //=============================================================================
		                        }]
		                    });
						}else{
							console.log('access token undefined');
							cbmain();
						}
					}else{
						cbmain();
					}
		        });
            },
            goHome: ['syncBox','syncDbox', function(cbmain, up) {

                var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
				req.session.Account.ip = ip;
				var enterpriseLogo, hideSetting=0; 

				Account.find({
					where: { id: req.session.Account.id }
				}).done(function(err, account) {

					if (err) return res.send(500,err);
					
					Account.find({
						where: { id : account.created_by }
					}).done(function(errs, createdBy){
						
						if(createdBy){
							if(createdBy.enterprise_fsname !== null && createdBy.enterprise_fsname !== '' ){
								if(createdBy.isSuperAdmin !== 1){
									enterpriseLogo = createdBy.enterprise_fsname;
								}else{
									// enterpriseLogo = account.enterprise_fsname;
									enterpriseLogo = createdBy.enterprise_fsname;//Rishabh: For accounts created by superadmin show Logo set by superadmin
								}

							}else{

								if(account.enterprise_fsname !== null && account.enterprise_fsname !== ''){
									enterpriseLogo = account.enterprise_fsname;
								}else{
									enterpriseLogo = '';
								}
							}
							hideSetting= 1;
						}else{

							enterpriseLogo = account.enterprise_fsname;

						}

						if(account.isSuperAdmin){

							Theme.find({
								where : { account_id: req.session.Account.id  }
							}).done(function(err, theme){
								var sql = "SELECT (SUM(size)/1000000000) as total_space_used FROM file";//directory: Rishabh, subfolder size(3gb)+parent folder size(3gb) makes it double the size, so better consider file
								sql = Sequelize.Utils.format([sql]);
								sequelize.query(sql, null, {
									raw: true
								}).success(function(dir) {

									if(theme === null){

										res.view('meta/superadmin',{
											is_super_admin	: '1',
											apps 			: account.created_by,
											email 			: account.email,
											enterprise_logo : enterpriseLogo,
											avatar 			: account.avatar_image,
											setting 		: hideSetting,
											header_color 	 : '#FFFFFF',
											navigation_color : '#4f7ba9',
											body_background  : '#f9f9f9',
											footer_background: '#f9f9f9',
											font_family 	 : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
											font_color 	 	 : '#585858',
											total_space_used : dir[0].total_space_used?parseFloat(dir[0].total_space_used).toFixed(3):"0"
										});

									}else{

										res.view('meta/superadmin',{
											is_super_admin	: '1',
											apps 			: account.created_by,
											email 			: account.email,
											enterprise_logo : enterpriseLogo,
											avatar 			: account.avatar_image,
											setting 		: hideSetting,
											header_color 	 : theme.header_background 	!== '' ? (theme.header_background).replace(/^#*/g, "#") : '#FFFFFF',
											navigation_color : theme.navigation_color 	!== '' ? (theme.navigation_color).replace(/^#*/g, "#") : '#4f7ba9',
											body_background  : theme.body_background 	!== '' ? (theme.body_background).replace(/^#*/g, "#") : '#f9f9f9',
											footer_background: theme.footer_background 	!== '' ? (theme.footer_background).replace(/^#*/g, "#") : '#f9f9f9',
											font_family 	 : theme.font_family 		!== '' ? theme.font_family : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
											font_color 	 	 : theme.font_color 		!== '' ? (theme.font_color).replace(/^#*/g, "#") : '#585858',
			 								total_space_used : dir[0].total_space_used?parseFloat(dir[0].total_space_used).toFixed(3):"0"
										});
									}
								});					});

						}else{

							if(req.session.Account.isAdmin === true){

								Theme.find({
									where : { account_id: req.session.Account.id  }
								}).done(function(err, theme){

									if(theme === null){

									res.view('meta/workgroupadmin',{
										is_super_admin	: '0',
										apps 			 : account.created_by,
										email 			 : account.email,
										enterprise_logo  : enterpriseLogo,
										avatar 			 : account.avatar_image,
										setting 		 : hideSetting, 
										header_color 	 : '#FFFFFF',
										navigation_color : '#4f7ba9',
										body_background  : '#f9f9f9',
										footer_background: '#f9f9f9',
										font_family 	 : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
										font_color 	 	 : '#585858'
									});
			
									}else{
										res.view('meta/workgroupadmin',{
											is_super_admin	: '0',
											apps 			 : account.created_by,
											email 			 : account.email,
											enterprise_logo  : enterpriseLogo,
											avatar 			 : account.avatar_image,
											setting 		 : hideSetting, 
											header_color 	 : theme.header_background 	!== '' ? (theme.header_background).replace(/^#*/g, "#") : '#FFFFFF',
											navigation_color : theme.navigation_color 	!== '' ? (theme.navigation_color).replace(/^#*/g, "#") : '#4f7ba9',
											body_background  : theme.body_background 	!== '' ? (theme.body_background).replace(/^#*/g, "#") : '#f9f9f9',
											footer_background: theme.footer_background 	!== '' ? (theme.footer_background).replace(/^#*/g, "#") : '#f9f9f9',
											font_family 	 : theme.font_family 		!== '' ? theme.font_family : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
											font_color 	 	 : theme.font_color 		!== '' ? (theme.font_color).replace(/^#*/g, "#") : '#585858'
										});
									}
								});


							}else{
		/******profile condition******/
								var sql = "SELECT au.*,p.* FROM adminuser au JOIN profile p on "+
								"au.admin_profile_id=p.id WHERE user_id=?";
								sql = Sequelize.Utils.format([sql, account.id]);
								sequelize.query(sql, null, {
									raw: true
								}).success(function(adminuser) {


									Theme.find({
										where : { account_id: account.created_by  }
									}).done(function(err, theme){
										
										if(theme === null){

											res.view('meta/home',{
												is_super_admin	: '0',
												apps 			 : account.created_by,
												email 			 : account.email,
												enterprise_logo  : enterpriseLogo,
												avatar 			 : account.avatar_image,
												profile			 : adminuser,		
												setting 		 : hideSetting, 
												header_color 	 : '#FFFFFF',
												navigation_color : '#4f7ba9',
												body_background  : '#f9f9f9',
												footer_background: '#f9f9f9',
												font_family 	 : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
												font_color 	 	 : '#585858'
											});
			
										}else{
											
											res.view('meta/home',{
												is_super_admin	: '0',
												apps 			 : account.created_by,
												email 			 : account.email,
												enterprise_logo  : enterpriseLogo,
												avatar 			 : account.avatar_image,
												profile			 : adminuser,
												setting 		 : hideSetting, 
												header_color 	 : theme.header_background 	!== '' ? (theme.header_background).replace(/^#*/g, "#") : '#FFFFFF',
												navigation_color : theme.navigation_color 	!== '' ? (theme.navigation_color).replace(/^#*/g, "#") : '#4f7ba9',
												body_background  : theme.body_background 	!== '' ? (theme.body_background).replace(/^#*/g, "#") : '#f9f9f9',
												footer_background: theme.footer_background 	!== '' ? (theme.footer_background).replace(/^#*/g, "#") : '#f9f9f9',
												font_family 	 : theme.font_family 		!== '' ? theme.font_family : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
												font_color 	 	 : theme.font_color 		!== '' ? (theme.font_color).replace(/^#*/g, "#") : '#585858'
											});
										}
									});
			
									// res.view('meta/home',{
									// 	apps			: account.created_by,
									// 	email			: account.email,
									// 	profile			: adminuser,
									// 	enterprise_logo: enterpriseLogo,
									// 	avatar: account.avatar_image,
									// 	setting: hideSetting 

									// });
			
								}).error(function(e) {
									throw new Error(e);
								});
		/******end profile condition******/
							}
						}	
					});
				});
            }]
        });
	},

	syncBoxRecursive: function (req, parentDir, boxDir, SyncBox, cbmain) {
		console.log('boxDirboxDirboxDirboxDirboxDir');
		//console.log(tokens);
		// box.content.folder.items((boxDir == 'root') ? 0 : boxDir, { tokens: tokens }, function(err, res, tokens) {

		var folderID = (boxDir == 'root') ? 0 : boxDir;
		var uri = 'https://api.box.com/2.0'+'/'+'folders'+'/'+folderID+'/items';

		// if (fields) {
		// 	uri += '?fields=' + fields +'&offset=' + offset + '&limit='+ limit;
		// } else {
		// 	uri += '?offset=' + offset + '&limit='+ limit;
		// }

		var superagent = require('superagent');
		var boxreq = superagent.get(uri);
		boxreq.set('Authorization', 'Bearer '+ SyncBox.access_token);
		boxreq.end(function (err, boxres) {

			if (boxres && boxres.error) {
				// return callback('Error: ' + boxres.error.message);
				console.log('Error: ' + boxres.error.message);
				return cbmain();
			}

			//callback(null, boxres.body);

			// var result = JSON.parse(boxres.body.text);
			//console.log(result);

			//console.log(result.total_count);
			//console.log(result.entries);


			if(boxres && typeof boxres.text != 'undefined'){
				var result = JSON.parse(boxres.text);
				var boxnodes = result.entries;
				var accountId = req.session.Account.id;
				if(result.total_count > 0){
					async.forEach(boxnodes, function (boxnode, dbItemCallback){
						console.log( boxnode, 'boxnode.name' );
						if(boxnode.type == 'folder'){
							console.log('parent_id :'+parentDir.id+' & folder_name : '+boxnode.name);

							Directory.findAll({where:{
		                        // 'name': boxnode.name,
		                        'DirectoryId': parentDir.id,//drivenode.parentId
		                        'driveFsName': boxnode.id,
		                        'isBoxDir' : 1,
		                        // 'md5checksum': drivenode.md5checksum
		                    }}).done(function(err, dirModel){
		                    	//console.log('Deepak check.');return cbmain();
		                        if(err)
		                            dbItemCallback();//return res.send(err, 500);

		                        if(dirModel && dirModel.length){
		                            console.log('Folder already exists.');//If directory with same name and parent id exists do not create another
		                            // dbItemCallback();// tell async that the iterator has completed
		                            //console.log(dirModel);
		                            console.log('syncDbRecursivesyncDbRecursivesyncDbRecursivesyncDbRecursive');
		                            MetaController.syncBoxRecursive(req, dirModel[0], boxnode.id, SyncBox, dbItemCallback);
		                        }else{
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
		                                    UniqueNameService.unique(Directory, boxnode.name, parentDir.id, cb);
		                                },
		                                newDirectory: ['metadata', function (cb, r) { // Create the new directory
		                                        Directory.create({
		                                            name: r.metadata.fileName,
		                                            directoryId: parentDir.id,
		                                            isBoxDir: true,
		                                            uploadPathId: SyncBox.id,
		                                            driveFsName: boxnode.id,
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
		                                // dbItemCallback();// tell async that the iterator has completed
		                                MetaController.syncBoxRecursive(req, results.newDirectory, boxnode.id, SyncBox, dbItemCallback);
		                            });



		                        }


		                    });



						}
						else
						{
							console.log('boxnode.id', boxnode.id);
							// var options = {tokens: tokens};
							// box.content.file.get(boxnode.id, options, function(err, res, tokens) {
							superagent
						    .get('https://api.box.com/2.0'+'/'+'files'+'/'+boxnode.id)
						    .set('Authorization', 'Bearer '+ SyncBox.access_token)
						    .end(function(err, boxfile){

						    	console.log(err, boxfile, err, 'boxfile222');
								//console.log(err);console.log(res);
								if (boxfile && boxfile.error) {
									// return callback('Error: '+res.error.message);
									console.log('Error: '+boxfile.error.message);
									dbItemCallback();
								}
								else if(typeof boxfile.body != 'undefined')
								{
									if(boxfile.body.size)
									{
										File.findAll({where:{
					                        // 'fsName': dropboxnode.rev,//Do not depend on revision, gets updated on file rename and move also
					                        'downloadLink': boxfile.body.id,
					                        'isOnBox' : 1,
					                        // 'md5checksum': dropboxnode.md5checksum
					                    }}).done(function(err, fileModel){
					                        if(err){
					                        	console.log(err);
					                            return dbItemCallback();//return res.send(err, 500);
					                        }

					                        if(fileModel.length > 0){
					                            //var apiResponse = APIService.File.mini(fileModel);
					                            //apiResponse_entries.push(apiResponse);

					                            console.log('apiResponse.entriesapiResponse.entriesapiResponse.entries');
					                            dbItemCallback();// tell async that the iterator has completed
					                            // console.log(apiResponse);
					                            // apiResponse.parent.id = options.parentId;
					                        }else{
					                        	var UUIDGenerator = require('node-uuid');
					                        	var fsName = UUIDGenerator.v1();
					                            File.handleUpload({
					                                name: boxnode.name,
					                                size: boxfile.body.size,
					                                //type: dropboxnode.mime_type,
					                                fsName: boxnode.name,
					                                oldFile: 0,
					                                version: 0,//dropboxnode.version,
					                                parentId: parentDir.id,//parsedFormData.parent.id,
					                                // replaceFileId: req.param('replaceFileId'),
					                                account_id: req.session.Account.id, // AF
					                                //thumbnail: dropboxnode.thumb_exists,//"0",
					                                // md5checksum: dropboxnode.md5checksum,

					                                md5checksum: null,
					                                uploadPathId: SyncBox.id,
					                                isOnBox: 1,
					                                // viewLink: drivenode.webViewLink,
					                                downloadLink: boxfile.body.id,
					                                //iconLink: dropboxnode.icon,
					                            }, function (err, resultSet) {

					                                if (err)
					                                    dbItemCallback();//return res.send(err, 500);
					                                // var response = {
					                                //     total_count: resultSet.length,
					                                //     entries: resultSet
					                                // };
					                                dbItemCallback();
					                                // return res.json(response);
					                            });
					                        }
					                    });
									}
									else
									{
										console.log('ignored 0 byte file: ');
									}
								}

							});


						}

						dbItemCallback();
					}, function(err) {
					    console.log('iterating done');

		                console.log('responseresponseresponseresponseresponse');
		                // console.log(response);
		                // return res.json(response);
		                // console.log(dropboxnodes);
						cbmain();
					});

				}
				else
				{
					console.log('222222222222');
					cbmain();
				}



			}
			else
			{
				console.log('3333333333');
				return cbmain();
			}
			//cbmain();




		});
		// api.getMetadata( (boxDir == 'root') ? '' : boxDir, function(err, res, boxroot) {


  //       });

	},

	syncDbRecursive: function (req, api, parentDir, dbxDir, SyncDbox, cbmain) {
		console.log('dbxDirdbxDirdbxDirdbxDirdbxDirdbxDirdbxDirdbxDirdbxDirdbxDir');
		console.log(dbxDir);
		api.getMetadata( (dbxDir == 'root') ? '' : dbxDir, function(err, res, dboxroot) {

			if(err)
				cbmain();

			if(typeof dboxroot != 'undefined'){

				if(dboxroot.error){
					console.log(dboxroot.error);
					return cbmain();
				}

				var dropboxnodes = dboxroot.contents;
				var accountId = req.session.Account.id;
console.log(dboxroot);
				// console.log();
				var request = require('request');
				console.log('dropboxnode LENGTH: ', dropboxnodes.length);



		        if(dropboxnodes.length > 0){
		            var apiResponse_entries = [];

		            async.forEach(dropboxnodes, function (dropboxnode, dbItemCallback){

		            	//get last segment from path(.split("/").pop())
		            	var dropboxnode_name = dropboxnode.path.split("/").pop();//.replace(/\//g,'');

					    if(dropboxnode.is_dir){//is Directory

		            		console.log(' : is_dir: '+dropboxnode.path);
		            		// dbItemCallback();// tell async that the iterator has completed

		            		Directory.findAll({where:{
		                        'name': dropboxnode_name,
		                        'DirectoryId': parentDir.id//drivenode.parentId
		                        // 'md5checksum': drivenode.md5checksum
		                    }}).done(function(err, dirModel){
		                        if(err)
		                            dbItemCallback();//return res.send(err, 500);

		                        if(dirModel && dirModel.length){
		                            console.log('Folder already exists.');//If directory with same name and parent id exists do not create another
		                            // dbItemCallback();// tell async that the iterator has completed
		                            console.log(dirModel);
		                            console.log('syncDbRecursivesyncDbRecursivesyncDbRecursivesyncDbRecursive');
		                            MetaController.syncDbRecursive(req, api, dirModel[0], dirModel[0].driveFsName, SyncDbox, dbItemCallback);
		                        }else{
		                            console.log('Creating Folder: '+dropboxnode_name+' , DirectoryId: '+parentDir.id);
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
		                                    UniqueNameService.unique(Directory, dropboxnode_name, parentDir.id, cb);
		                                },
		                                newDirectory: ['metadata', function (cb, r) { // Create the new directory
		                                        Directory.create({
		                                            name: r.metadata.fileName,
		                                            directoryId: parentDir.id,
		                                            isDropboxDir: true,
		                                            uploadPathId: SyncDbox.id,
		                                            driveFsName: dropboxnode.path,
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
		                                // dbItemCallback();// tell async that the iterator has completed
		                                MetaController.syncDbRecursive(req, api, results.newDirectory, results.newDirectory.driveFsName, SyncDbox, dbItemCallback);
		                            });
		                        }
		                    });
						}else if( parseInt(dropboxnode.bytes) == 0 ){

		                    console.log('ignored 0 byte file: '+dropboxnode.path);
		                    //0 bytes file ignored in olympus
		            	}else{
		            		console.log(' : is_file: '+dropboxnode.path);
		            		console.log(' >>> ', dropboxnode, ' <<<');
		                    File.findAll({where:{
		                        // 'fsName': dropboxnode.rev,//Do not depend on revision, gets updated on file rename and move also
		                        'downloadLink': dropboxnode.path,
		                        'isOnDropbox' : "1",
		                        // 'md5checksum': dropboxnode.md5checksum
		                    }}).done(function(err, fileModel){
		                        if(err){
		                        	console.log(err);
		                            return dbItemCallback();//return res.send(err, 500);
		                        }

		                        if(fileModel.length > 0){
		                            var apiResponse = APIService.File.mini(fileModel);
		                            apiResponse_entries.push(apiResponse);

		                            console.log('apiResponse.entriesapiResponse.entriesapiResponse.entries');
		                            dbItemCallback();// tell async that the iterator has completed
		                            // console.log(apiResponse);
		                            // apiResponse.parent.id = options.parentId;
		                        }else{
		                        	var UUIDGenerator = require('node-uuid');
		                        	var fsName = UUIDGenerator.v1();
		                            File.handleUpload({
		                                name: dropboxnode_name,
		                                size: dropboxnode.bytes,
		                                type: dropboxnode.mime_type,
		                                fsName: dropboxnode.rev,
		                                oldFile: 0,
		                                version: 0,//dropboxnode.version,
		                                parentId: parentDir.id,//parsedFormData.parent.id,
		                                // replaceFileId: req.param('replaceFileId'),
		                                account_id: req.session.Account.id, // AF
		                                thumbnail: dropboxnode.thumb_exists,//"0",
		                                // md5checksum: dropboxnode.md5checksum,

		                                md5checksum: null,
		                                uploadPathId: SyncDbox.id,
		                                isOnDropbox: "1",
		                                // viewLink: drivenode.webViewLink,
		                                downloadLink: dropboxnode.path,
		                                iconLink: dropboxnode.icon,
		                            }, function (err, resultSet) {

		                                if (err)
		                                    dbItemCallback();//return res.send(err, 500);
		                                // var response = {
		                                //     total_count: resultSet.length,
		                                //     entries: resultSet
		                                // };
		                                dbItemCallback();
		                                // return res.json(response);
		                            });
		                        }
		                    });
						}

					}, function(err) {
					    console.log('iterating done');
					    var response = {
		                    total_count: apiResponse_entries.length,
		                    entries: apiResponse_entries
		                };

		                console.log('responseresponseresponseresponseresponse');
		                // console.log(response);
		                // return res.json(response);
		                // console.log(dropboxnodes);
						cbmain();
					});
		        }else{
		        	console.log('test');
				    cbmain();
		        }



		    }else{
		    	console.log('test');
		    	cbmain();
		    }
        });
	},

	error: function (req,res) {
		res.view('500', {
			title: 'Error (500)'
		});
	},

	notfound: function (req,res) {
		res.view('404', {
			title: 'Not Found (404)'
		});
	},

	denied: function (req,res) {
		res.view('403', {
			title: 'Access Denied (403)'
		});
	},

	syncBox: function (req,res) {
		var access_token;
		if(!req.session.Account || !req.query.code)
		{
			return res.redirect('/');
		}
		else
		{
			SiteOptions.find({where: {id: 1}}).done(function (err, credentials) {

                if (err)
                    return res.json({error: err, type: 'error'});

                if(credentials.boxSync){
					var superagent = require('superagent');
					superagent
				    .post('https://app.box.com/api' + '/oauth2/token')
				    .type('application/x-www-form-urlencoded')
				    .send('grant_type=authorization_code')
				    .send('code='+req.query.code)
				    .send('client_id='+credentials.boxClientId)
				    .send('client_secret='+credentials.boxClientSecret)
				    .end(function (err, boxres) {

						console.log('checkcheckcheckcheckcheckcheckcheckcheckcheckcheckcheck',boxres);
						if(boxres.status != 200) {
							console.log(err);
							return;
							// return callback('Error: '+res.error.message);
						}

						// self.updateAccessToken(res.body.access_token);
						console.log('res.body.access_token', boxres.body.access_token,'res.body.refresh_token', boxres.body.refresh_token);
						//Find Adapter with same configuration
				        SyncBox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
				            if (err)
				                return res.redirect('/');// res.json({success: false, error: err});

				            if(tokenrow){
				                //Set it as Active
				                console.log('already exists : ');
				                tokenrow.access_token = boxres.body.access_token;
				                tokenrow.refresh_token = boxres.body.refresh_token;
				                tokenrow.save().done(function(err) {
				                    return res.redirect('/');
				                });
				            }else{
				                console.log('New BOX.NET Token Being Added for account ID : '+req.session.Account.id);
				                SyncBox.create({

				                    account_id			: req.session.Account.id,
				                    access_token		: boxres.body.access_token,
				                    refresh_token		: boxres.body.refresh_token

				                }).done(function foundAdapter (err, tokenrow) {
				                	return res.redirect('/');
				                });
				            }
				        });
				    });

		    		/*var box = require('node-box-sdk');
					box.configure({
					  client_id: 'cbev0e1mrb9jrmvc90gdvwmyworca1nx',             // REQUIRED
					  client_secret: 'UHa0J0epfLX0WoYOQ1JCmYpxvGLyDv8k',     // REQUIRED
					  api_key: 'cbev0e1mrb9jrmvc90gdvwmyworca1nx',              // REQUIRED
					  encrypt: { password: '' }        // OPTIONAL
					});

					box.generateToken({ authorization_code: req.query.code }, function(err, tokens) {
					  	console.log(tokens); console.log(err);
					  	if (err){
		            		console.log(':::::777777777777777777777777777');
		            		return res.redirect('/');
		            	}

		        		access_token = tokens;

		        		box.content.folder.get(0, { tokens: tokens }, function(err1, res1, tokens1) {
		        			console.log(res1.req._headers);
		        			//console.log(res.text);
		        			var access_token_1 = res1.req._headers.authorization.split("Bearer ").pop();
		        			//console.log(access_token_1);

		        			console.log('boxboxbox');
							console.log(req.query.code);

							//Find Adapter with same configuration
					        SyncBox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
					            if (err)
					                return res.redirect('/');// res.json({success: false, error: err});

					            if(tokenrow){
					                //Set it as Active
					                console.log('already exists : ');
					                tokenrow.access_token = access_token;
					                tokenrow.access_token_2 = access_token_1;
					                tokenrow.save().done(function(err) {
					                    return res.redirect('/');
					                });
					            }else{
					                console.log('New BOX.NET Token Being Added for account ID : '+req.session.Account.id);

					                SyncBox.create({

					                    account_id			: req.session.Account.id,
					                    access_token		: access_token,
					                    access_token_2		: access_token_1,
										//token_type      	: body.token_type,
									    //uid             	: body.uid,
									    //dbxaccount_id   	: body.account_id

					                }).done(function foundAdapter (err, tokenrow) {
					                	return res.redirect('/');
					                });




					            }
					        });
		        		});





					});*/
				}else{
					console.log('Box details misconfigured');
					return res.redirect('/');
				}
			});
		}

	},

	syncDbox: function (req,res) {
		console.log('test99999999999999999999999999999999');
		// console.log(req.query.code);

		SiteOptions.find({where: {id: 1}}).done(function (err, credentials) {

            if (err)
                return res.json({error: err, type: 'error'});

            if(credentials.dropboxSync){
				//Find Adapter with same configuration
		        SyncDbox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
		            if (err)
		                return res.redirect('/');// res.json({success: false, error: err});

		            if(tokenrow){
		                //Set it as Active
		                tokenrow.access_code = req.query.code;
		                tokenrow.save().done(function(err) {
		                    return res.redirect('/');
		                });
		            }else{
		                console.log('New Dropbox Token Being Added for account ID : '+req.session.Account.id);

		                var node_dropbox = require('node-dropbox');
		                //Set it as Active
		                // console.log('Dropbox Token Found: '+tokenrow.access_code);

		                node_dropbox.AccessToken(credentials.dropboxClientId, credentials.dropboxClientSecret, req.query.code, 'https://'+sails.config.host+'/syncdbox', function(err, body) {

		                	if (err || (body && body.error == 'invalid_grant') ){
		                		console.log(err || (body && body.error == 'invalid_grant'));
		                		return res.redirect('/');
		                	}

		            		console.log('test555555555555555555555555555555555');
		                	// console.log(body);
							access_token = body.access_token;

							SyncDbox.create({

			                    account_id			: req.session.Account.id,
			                    access_token		: body.access_token,
								token_type      	: body.token_type,
							    uid             	: body.uid,
							    dbxaccount_id   	: body.account_id

			                }).done(function foundAdapter (err, tokenrow) {
			                	return res.redirect('/');
			                });
						});
		            }
		        });
			}else{
				console.log('Dropbox App misconfigured.');
				return res.redirect('/');
			}
		});
	}
};
_.extend(exports,MetaController);
