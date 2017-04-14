var TrashController = {

	restore: function(req, res){

		var options = {
			file_id 	 : req.param('file_id'),
			type 		 : req.param('type'),
			directory_id : req.param('directory_id')
		};

		if(req.param('type') === 'file'){
			
			DeletedList.restore(options, function(err, account){
				if(err) return;
				return res.json(account, 200);
			});

		}else if (req.param('type') === 'directory'){

			DeletedList.find({
                deleted_id  : req.param('file_id'), 
                type        : 2 
            }).then(function (deletedlist) {
            	
				Directory.update({
	                id: deletedlist[0].deleted_id
	            }, {
	                deleted         : null,
	                deleteDate      : null,
	                DirectoryId     : (options.directory_id)?options.directory_id:deletedlist[0].directory_id
				}).exec(function(err, dir){

					deletedlist.forEach(function (deletedlist) {
						//console.log(deletedlist);
                        DirectoryPermission.create({
                            type        : deletedlist.permission,
                            orphan      : null,
                            AccountId   : deletedlist.account_id,
                            DirectoryId : deletedlist.deleted_id
                        }).then(function (perm) {
                            // return perm;
                        });

                        DeletedList.update({
                            id: deletedlist.id
                        }, {
                            deleted_id   : null,
                            directory_id : null 
                        }).then(function(per){

                        });

                        
                    });

					DeletedList.restoreParent(options, function(err, account){
						if(err) return;
						return res.send(200);
					});
				});

			});

		}
	},

	deletePermanent: function(req, res){

		var options = {
			file_id 	 : req.param('file_id'),
			type 		 : req.param('type'),
			directory_id : req.param('directory_id'),
		};

		console.log('--------------------------deleting file in api Trash--------------------------');

		console.log(options);

		if(req.param('type') === 'file'){
			
			// DeletedList.restore(options, function(err, account){
			// 	if(err) return;
			// 	return res.json(account, 200);
			// });
			async.auto({
	            getAdapterId: function(cb) {

	                File.findOne({where:{fsName:req.param('fsName')}}).done(cb);
	            },
	            getAdapter: ['getAdapterId', function(cb, up) {

	                if(typeof up.getAdapterId != 'undefined'){
		                uploadPaths.findOne({where:{id:up.getAdapterId.uploadPathId}}).done(cb);
		            }else{
		                cb(null, 'NO_ADAPTER_FOUND');
		            }
	            }],
	            downloadTask: ['getAdapter', function(cb, up) {

	            	if(typeof up.getAdapter != 'undefined' && up.getAdapter != 'NO_ADAPTER_FOUND'){
		                var current_receiver        = up.getAdapter.type;
		                var current_receiverinfo    = up.getAdapter;
		                console.log('File ReceiverTrash: '+current_receiver);

						var receiver = global[current_receiver + 'Receiver'].deleteobject({
			                id: req.param('fsName'),
			                receiverinfo: current_receiverinfo
			            },function(err,data){
			            	console.log(err);
			            	console.log(data);
			            });
					}else{
						// res.send(404);
					}
				}]
			});

			return res.end(JSON.stringify({success: 'dashgdjashgdjsajdg'}), 'utf8');

		}else if (req.param('type') === 'directory'){

			console.log('dvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdvdv');
			DeletedList.find({
                deleted_id  : req.param('file_id'), 
                type        : 2 ,
                permission 	: 'admin'
            }).then(function (response) {
            	
				Directory.update({
	                id: response[0].deleted_id
	            }, {
	                deleted         : null,
	                deleteDate      : null,
	                DirectoryId     : response[0].directory_id
				}).exec(function(err, dir){

					response.forEach(function (deletedlist) {
						console.log(deletedlist);
                        // DirectoryPermission.create({
                        //     type        : deletedlist.permission,
                        //     orphan      : null,
                        //     AccountId   : deletedlist.account_id,
                        //     DirectoryId : deletedlist.deleted_id
                        // }).then(function (perm) {
                        //     // return perm;
                        // });

                        DeletedList.destroy({
                            id: deletedlist.id
                        }).then(function(per){

                        });

                        Directory.destroy({
		                    id: deletedlist.deleted_id
		                });

                        
                    });

					DeletedList.deleteParent(options, function(err, account){
						if(err) return;

						console.log('API deleteParent callback called');
						return res.send(200);
					});
				});

			});

		}
	},

	emptyTrash: function(req, res){

		var options = {
			// file_id 	 : req.param('file_id'),
			// type 		 : req.param('type'),
			// directory_id : req.param('directory_id'),
		};
		account = req.param('account');
		// console.log(account);

		console.log('--------------------------Empty Trash in api--------------------------');
		if(typeof account !== 'undefined'){
			async.auto({

	            deletefiles: function(cb){

	            	console.log('--------------Deleting All Files of Account '+account.id+'-------------------');

	                DeletedList.query("SELECT file.uploadPathId,up.type,up.path,up.accessKeyId,up.secretAccessKey,up.bucket,up.region,GROUP_CONCAT( file.id \
						SEPARATOR ',' ) AS fileids, GROUP_CONCAT( file.fsName \
						SEPARATOR ',' ) AS filefsnames \
						FROM deletedlist AS dl \
						INNER JOIN file ON dl.deleted_id = file.id \
						INNER JOIN uploadpaths AS up ON file.uploadPathId = up.id \
						WHERE dl.account_id="+account.id+" and dl.type =1 and dl.permission = 'admin' \
						GROUP BY file.uploadPathId", function(err, results) {
						
						if (err){
							console.log('TRASHLOG: Some error occured in trash CRON: '+err);
							cb();
							return;
						}

						if(typeof results != 'undefined' && results.length){
						  	// console.log(results);

						  	async.forEach(results, function (adapterdetails, callback){ 

						  		//console.log('adapterdetails.fileids & filefsnames: '+adapterdetails.type);
						  		//console.log(adapterdetails);
						  		// console.log(adapterdetails.filefsnames);

						  		var current_receiver        = adapterdetails.type;
				                var current_receiverinfo    = {
				                	id 				: adapterdetails.uploadPathId,
								    type 			: adapterdetails.type,
								    path 			: adapterdetails.path,
								    accessKeyId		: adapterdetails.accessKeyId,
								    secretAccessKey	: adapterdetails.secretAccessKey,
								    bucket			: adapterdetails.bucket,
								    region			: adapterdetails.region,
				                };
				                
				                console.log('File ReceiverTrash: '+current_receiver);

							  	var receiver = global[current_receiver + 'Receiver'].deleteAll({
					                ids: adapterdetails.filefsnames,
					                receiverinfo: current_receiverinfo
					            },function(err,data){

					            	if(err)
					            		callback();

					            	DeletedList.destroy({
				                        deleted_id: adapterdetails.fileids.split(',')
				                    }).then(function(per){
										console.log('current_receiver '+current_receiver+' DeletedList.destroy');
										callback();
				                    });
					            	console.log(err);
					            	console.log(data);
					            });

							}, function(err) {
							    console.log('iterating done');
							    cb();
							});  
						}else{
							cb();
						}
					});
	            }, 

	            deletedirs:function(cb){

	                console.log('--------------Deleting All Folders of Account '+account.id+'-------------------');
					DeletedList.find({
		                // deleted_id  : req.param('file_id'), 
		                type        : 2, 
		                account_id	: account.id,//req.session.Account && req.session.Account.id,
		                permission 	: 'admin'
		            }).then(function (response) {

		            	var deletelistids = [];
		            	var deldirlistids = [];
						response.forEach(function (deletedlist) {
							// console.log(deletedlist);
							deletelistids.push(deletedlist.id);
							deldirlistids.push(deletedlist.deleted_id);

							// DeletedList.destroy({
							//     id: deletedlist.id
							// }).then(function(per){
							// 	console.log('//////////////////1111')
							// });

							// Directory.destroy({
							//     id: deletedlist.deleted_id
							// }).then(function(per2){
							// 	console.log('//////////////////2222')
							// });
		                    
		                });

		                console.log('//////////////////4444');
		                console.log(deletelistids);
		                console.log(deldirlistids);

		                async.auto({

	            			destroydl: function(cbdeldirs){
	            				DeletedList.destroy({
				                    id: deletelistids
				                }).then(function(per){
									console.log('//////////////////1111');
									cbdeldirs();
				                });
	            			},
	            			destroydr: function(cbdeldirs){
	            				Directory.destroy({
				                    id: deldirlistids
				                }).then(function(per2){
				                	console.log('//////////////////2222');
				                	cbdeldirs();
				                });
	            			}
	            		}, cb);
					});
	            }
	        }, function(err, result){
	        	if(err){
	        		console.log(err);
	        		return res.end(JSON.stringify({success: false}), 'utf8');
	        	}

	            return res.end(JSON.stringify({success: true}), 'utf8');
	        });
		}else{
			return res.end(JSON.stringify({success: false}), 'utf8');
		}
	},

	demo: function(req, res){
		console.log('testIIIIIIIIIIIIIIIIIItestIIIIIIIIIIIIIIIIIItestIIIIIIIIIIIIIIIIIItestIIIIIIIIIIIIIIIIII');
		console.log(req);
		console.log('testIIIIIIIIIIIIIIIIIItestIIIIIIIIIIIIIIIIIItestIIIIIIIIIIIIIIIIIItestIIIIIIIIIIIIIIIIII');
		return res.send({'success':200});
	},

	deleteTrashContent : function(){

		function pad (str, max) {
		  return str.length < max ? pad("0" + str, max) : str;
		}
        console.log('do something very cool here API Controller.');
        var date = new Date();

        //requires moment.js
        // var _date = new Date(moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');
        // console.log(_date);

		var current_hour = date.getHours();
		var date_str = date.getFullYear()+'-'+pad(date.getMonth()+1, 2)+'-'+date.getDate()+' '+date.getHours()+':'+pad(date.getMinutes(),2)+':'+date.getSeconds();
		console.log(date_str);

        /*DeletedList.find({
                createdAt  : { '<': date_str }
                // createdAt  : { '>': start, '<': end }
            }).then(function (res) {
            	console.log('2deleteTrashContentdeleteTrashContentdeleteTrashContent');
            	console.log(res);
            	console.log('2deleteTrashContentdeleteTrashContentdeleteTrashContent');
            });*/

        DeletedList.query("SELECT dl.deleted_id,dl.type,dl.createdAt,dl.directory_id,file.fsname FROM deletedlist as dl LEFT JOIN file ON dl.deleted_id=file.id where dl.createdAt < '"+date_str+"'", function(err, results) {
		  if (err){
		   console.log('TRASHLOG: Some error occured in trash CRON: '+err);
		   return;
		  }

		  if(typeof results != 'undefined' && results.length){
		  	console.log('dldldldldldldldldldldldldldldldldldldl');
		  	var trash_files = new Array();
		  	var trash_dirs  = new Array();
		  	_.each(results,function(dl, i){

		  		if(dl.type == '1' && dl.fsname){
		  			trash_files.push(dl.fsname);
		  		}

		  		var options = {};

		  		if(dl.type == '1' && dl.fsname){
					// console.log(sails.config.receiver + 'Receiver');

					async.auto({
			            getAdapterId: function(cb) {

			                File.findOne({where:{fsName:dl.fsname}}).done(cb);
			            },
			            getAdapter: ['getAdapterId', function(cb, up) {

			                uploadPaths.findOne({where:{id:up.getAdapterId.uploadPathId}}).done(cb);
			            }],
			            downloadTask: ['getAdapter', function(cb, up) {

			                var current_receiver        = up.getAdapter.type;
			                var current_receiverinfo    = up.getAdapter;
			                console.log('File ReceiverTrash2: '+current_receiver);

							var receiver = global[current_receiver + 'Receiver'].deleteobject({
				                id: dl.fsname,
				                receiverinfo: current_receiverinfo
				            },function(err,data){

				            	console.log('File deleted by cron: '+dl.fsname);
				            	DeletedList.destroy({
			                        deleted_id: dl.deleted_id
			                    }).then(function(per){

			                    });

			                    File.destroy({
				                    id: dl.deleted_id
				                });
				            	console.log(err);
				            	console.log(data);
				            });
				        }]
				    });

				}else if (dl.type == '2' && dl.deleted_id){

					DeletedList.destroy({
                        deleted_id: dl.deleted_id
                    }).then(function(per){

                    });

                    Directory.destroy({
	                    id: dl.deleted_id
	                });

				}

		  		if(dl.type == '2'){
		  			trash_dirs.push(dl.deleted_id);
		  		}
		  	});

		  	console.log('trash_files:');
		  	console.log(trash_files);
		  	console.log('trash_dirs:');
		  	console.log(trash_dirs);
		  	console.log('DLDLDLDLDLDLDLDLDLDLDLDLDLDLDLDLDLDLDLDLDLDL');
		  }else{
		  	console.log('TRASHLOG: No item in trash to be deleted.');
		  }
		  return;
		});
    }
	
};

module.exports = TrashController;