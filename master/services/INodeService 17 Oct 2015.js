// In lieu of true relational inheritance, herein lies shared logic for
// DirectoryController and FileController
var UUIDGenerator = require('node-uuid');

exports.rename = function(req, res, cb) {
	var request = require('request');

	sails.log.info('Rename:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
	var inodeId = req.param('id');
	var INodeModel = (req.param('controller') == "directory") ? Directory : File;
	var subscribers = INodeModel.roomName(inodeId); // And broadcast activity to all sockets subscribed
	// Make sure the user has sufficient permissions for the delete
	var sourcePermissionClass = (req.param('controller') == "directory") ? DirectoryPermission : FilePermission;
	var sourceCriteria = {
		AccountId: req.session.Account.id,
		type: ['admin', 'write']
		// isLocked: false
	};
	
	if(sourcePermissionClass == DirectoryPermission) {
		sourceCriteria.DirectoryId = inodeId;
	} else {
		sourceCriteria.FileId = inodeId;
	}

	sourcePermissionClass.findAll({
		where: sourceCriteria
	}).success(function(models) {
		if(models.length === 0) {
			res.json({
				status: 'error',
				error: 'PERM_DENIED'
			}, 500);
			return;
		} else {
			// Get the model we're trying to rename
			INodeModel.find(inodeId).success(function(model) {
				// Check for a node with the same type, name and location
				// which is not deleted
				var prvName = model.name;
				
				INodeModel.find({
					where: {
						name: req.param('name'),
						DirectoryId: model.DirectoryId,
						deleted: null
					}
				}).success(function(retrievedFile) {
					// If there is none, proceed with the rename
					if(retrievedFile === null) {
						model.directoryId = model.DirectoryId;
						model.rename(req.param('name'), function(err, model) {
							var apiObj = APIService.File.mini(model);
							SocketService.broadcast('ITEM_RENAME', subscribers, apiObj);
							if (!cb) {
							
							/*Create logging*/
							if(req.param('controller') == "directory"){

								var options = {
									uri: 'http://localhost:1337/logging/register/' ,
									method: 'POST',
	    						};

								options.json =  {
	    							user_id		: req.session.Account.id,
	    							text_message: 'has renamed a directory from '+ prvName + ' to '+ model.name +'.',
	    							activity  	: 'rename',
	    							on_user		: req.session.Account.id,
	    							client_ip   : req.param('ipadd'),
									ip   		: req.session.Account.ip

	    						};

								request(options, function(err, response, body) {
								if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
	      							res.json(apiObj);
	    						});

							}else{

								Directory.find(model.DirectoryId).success(function(dirModel) {
									var options = {
										uri: 'http://localhost:1337/logging/register/' ,
										method: 'POST',
	    							};


                                    options.json =  {
	    								user_id		: req.session.Account.id,
	    								text_message: 'has renamed a file from '+ prvName + ' to '+ model.name +' located in '+dirModel.name+'.',
	    								activity  	: 'rename',
	    								on_user		: req.session.Account.id,
	    								client_ip   : req.param('ipadd'),
										ip   		: req.session.Account.ip

	    							};


									request(options, function(err, response, body) {
									if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
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
								status: 'success',
								obj: apiObj
							});
						} else {
							cb({
								type:"error",
								status:409,
								code:"conflict",
								message:"Can't rename node; node with same type and name exists in this location"
							});
						}
					}
				});
			});
		}
	});
},

/**
 * Move a file or folder into another directory
 */
exports.move = function(req, res, cb) {
	sails.log.info('Move:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
	// Get the source model class
	var sourceModelClass = (req.param('controller') == "directory") ? Directory : File;
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
	if(sourcePermissionClass == DirectoryPermission) {
		sourceCriteria.DirectoryId = sourceId;
	} else {
		sourceCriteria.FileId = sourceId;
	}

	async.auto({

		getSourcePermissions: function(cb) {
			sourcePermissionClass.find({
				where: sourceCriteria
			}).success(_.unprefix(cb));
		},

		getDestPermissions: function(cb) {
			DirectoryPermission.find({
				where: {
					AccountId: req.session.Account.id,
					DirectoryId: destId,
					type: 'admin'
				}
			}).success(_.unprefix(cb));
		}
		
	}, function(err, response) {
		if(response.getSourcePermissions === null) {
			if (!cb) {
				res.send(403);
			} else {
				cb({
					type:"error",
					status:403,
					code:"forbidden",
					message:"Insufficient permissions on source node"
				});
			}
			return;
		}
		if(response.getDestPermissions === null) {
			if (!cb) {
				res.send(403);
			} else {
				cb({
					type:"error",
					status:403,
					code:"forbidden",
					message:"Insufficient permissions on destination node"
				});
			}
			return;
		}

		// Find the source model
		sourceModelClass.find(req.param('id')).success(function(INodeModel) {
			// Check for a file in the destination directory with the same name
			sourceModelClass.find({
				where: {
					name: INodeModel.name,
					directoryId: destId
				}
			}).success(function(dupModel) {
				if(dupModel !== null) { /* TODO */
					/* Do something if a file with the same name exists in the destination */
					sails.log.debug("File with same name exists in destination; aborting...");
					if (!cb) {
						return res.send(409);
					}
					cb({
						type:"error",
						status:409,
						code:"conflict",
						message:"Can't move node; node with same type and name exists in this location"
					});
				} else {
					// Get the current parent directory of the node we're moving, so
					// that it can update its UI if necessary.
					var sourceDirectoryId = INodeModel.DirectoryId;
					// Call the "mv" method of the source model
					INodeModel.mv(destId, function(err, obj) {
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
			});
		});
	});

},


/**
	@alcanzar
	Create new records entry in the table
	Whenever someone try to delete the file and directory
*/
exports.deletedFileInfo = function(options, cb) {

	var dt 		= new Date();
	var datetime= dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+" "+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds();

	if(options.model.name == "Directory"){

		DirectoryPermission.findAll({
			where: {  DirectoryId : options.id  } 
		}).success(function(directorypermission) {
			directorypermission.forEach(function(dirpermission)  {
				var sql 	= "Insert into deletedlist ( type, deleted_id, createdAt, updatedAt, user_id, account_id ) VALUES ( '"+ 2 +"', '"+ dirpermission.DirectoryId +"', '"+ datetime +"', '"+ datetime +"',  '"+ options.accountId +"', '"+ dirpermission.AccountId +"')";
				sql 		= Sequelize.Utils.format([sql]);
				sequelize.query( sql, null, { raw: true } );
			});
		}).error(function(err) {
			throw new Error(err);
		});


	}else if(options.model.name == "File"){

		FilePermission.findAll({
			where: {  FileId : options.id  } 
		}).success(function(filepermission) {	
			filepermission.forEach(function(filepermission)  {
				var sql 	= "Insert into deletedlist ( type, deleted_id, createdAt, updatedAt, user_id, account_id ) VALUES ( '"+ 1 +"', '"+ filepermission.FileId +"', '"+ datetime +"', '"+ datetime +"',  '"+ options.accountId +"', '"+ filepermission.AccountId +"')";
				sql 		= Sequelize.Utils.format([sql]);
				console.log(sql);
				sequelize.query( sql, null, { raw: true } );
			});
		}).error(function(err) {
			throw new Error(err);
		});
	}

}


/**
	* Delete the specified inode
*/

exports['delete'] = function(req, res, cb) {

	var request 	= require('request');
	var inodeId 	= req.param('replaceFileId') || req.param('id');
	var INodeModel;	
	
	if(req.param('controller') == "account"){
		var INodeModel 		= Directory;
		INodeModel.identity = "directory";
	}else{
		var INodeModel 		= (req.param('controller') == "directory" && !req.param('replaceFileId')) ? Directory : File;
		INodeModel.identity = (req.param('controller') == "directory" && !req.param('replaceFileId')) ? "directory" : "file";
	}

	sails.log.info('Delete:' + inodeId + ' [User:' + req.session.Account.id + ']');

	INodeService.deletedFileInfo({

		id 				: inodeId,
		model 			: INodeModel,
		replaceFileId 	: req.param('replaceFileId'),
		accountId   	: req.session.Account.id,
		accountName   	: req.session.Account.name,

	});

	var subscribers = INodeModel.roomName(inodeId);

	if(INodeModel.name == 'File'){
		var sql = ("Delete from version where FileId = ?");
   		sql = Sequelize.Utils.format([sql, inodeId]);
    	sequelize.query(sql, null, {
      		raw: true
    	});
    }

	// Make sure the user has sufficient permissions for the delete
	var sourcePermissionClass = (req.param('controller') == "directory" && !req.param('replaceFileId')) ? DirectoryPermission : FilePermission;

	var sourceCriteria = {
		AccountId: req.session.Account.id,
		type: 'admin'
		// isLocked: false
	};

	if(sourcePermissionClass == DirectoryPermission) {
		sourceCriteria.DirectoryId = inodeId;
	} else {
		sourceCriteria.FileId = inodeId;
	}

	sourcePermissionClass.find({
		where: sourceCriteria
	}).success(function(model) {

		if(model === null) {
			
			return res.json({
				status: 'error',
				error: 'PERM_DENIED'
			}, 500);

		} else {

			INodeService.destroy({

				id: inodeId,
				model: INodeModel,
				replaceFileId: req.param('replaceFileId'),
				accountId   	: req.session.Account.id,
				accountName   	: req.session.Account.name,
                ipadd           : req.param('ipadd'),
                ip          	: req.session.Account.ip

			}, function afterDestroy(err) {

				// Respond and broadcast activity to all sockets subscribed
				var apiObj = {
					id: inodeId
				};

				if(cb) return cb();
				else return res.json({
					status: 'success',
					obj: apiObj
				});
			});
		}
	});
};


/*
* Destroy options
	id
	model
*/
exports.destroy = function(options, cb) {
	var request = require('request');

// Update cached directory size
	if(options.model.identity == 'directory') {

		Directory.find(options.id).error(cb).success(function(directory) {
			if (!directory) return cb("No directory found!");

			/*Create logging*/
			var opts = {
				uri: 'http://localhost:1337/logging/register/' ,
				method: 'POST',
	    	};

			opts.json =  {
	    		user_id		: options.accountId,
	    		text_message: 'has deleted a directory named '+directory.name+'.',
	    		activity  	: 'delete',
	    		on_user		: options.accountId,
	    		client_ip   : options.ipadd,
	    		ip   		: options.ip
	    	};

			request(opts, function(err, response, body) {
				if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
	      		
	      		Directory.updateParentDirectorySizes(directory.DirectoryId, -directory.size, remove);
	    	});	

	    	/*Create logging*/
			
		});

	} else {

		File.find(options.id).error(cb).success(function(file) {
			if (!file) return cb("No file found!");

			/*Create logging*/
			Directory.find(file.DirectoryId).success(function(dirModel) {
				var opts = {
					uri: 'http://localhost:1337/logging/register/' ,
					method: 'POST',
	    		};

                opts.json =  {
	    			user_id		: options.accountId,
	    			text_message: 'has deleted a file named '+file.name+' located in '+dirModel.name,
	    			activity  	: 'delete',
	    			on_user		: options.accountId,
	    			client_ip   : options.ipadd,
	    			ip   		: options.ip
	    		};

				request(opts, function(err, response, body) {
					// if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
	      			
	      			Directory.updateParentDirectorySizes(file.DirectoryId, -file.size, remove);
	    		});
			});
			/*Create logging*/
			
		});

	}

	function remove() {
		options.model.find(options.id).error(cb).success(function(inode) {
			inode.rm(function(err) {
				if (err) return cb(err);
				SocketService.broadcast('ITEM_TRASH', options.model.roomName(options.id), {
					id: options.id
				});
				cb();
			});
		});
	}

};

/*
	* Temp Remove Data 
*/

/*exports.tempRemove = function(req, res) {



};*/

/**
 * Return the set of users who are currently viewing the stream
 * -params-
 *		id	-> the target Directory's unique identifier
 */
exports.swarm = function(req, res) {
	var data = getRequestData(req, res);
	var sockets = data.Model.getActiveUsers(data.id),
		// Lookup account IDs from the session in the socket handshake
		accountIds = _.map(sockets, function(v, k) {
			return v.handshake.session.Account.id;
		});
	if(accountIds.length === 0) {
		res.json(APIService.Account.mini([])); // If result set is empty, get out to avoid Sequelize bug
	} else {
		Account.findAll({
			where: { // Get Account models and respond to client with APIService
				id: accountIds
			}
		}).success(function(accounts) {
			res.json(APIService.Account.mini(accounts)); // Send API response
		}).error(function(err) {
			throw new Error(err);
		});
	}
}



/**
 * Return the set of permissions attached to this inode
 */
exports.permissions = function(req, res) {
	var isDir = (req.param('controller') == 'directory');
	var sql = "SELECT *, " + "p.type AS permission " + "FROM " + (isDir ? "directorypermission p " : "filepermission p ") + "INNER JOIN " + "account a " + "ON p.AccountId=a.id " + "WHERE " + (isDir ? "p.DirectoryId=?" : "p.FileId=?");
	sql = Sequelize.Utils.format([sql, req.param('id')]);
	sequelize.query(sql, null, {
		raw: true
	}).success(function(models) {
		res.json(APIService.Permission.mini(models)); // Send API response
	}).error(function(e) {
		throw new Error(e);
	});
};

/**
 * Add a permission
 */
exports.addPermission = function(req, res) {

	var request = require('request');
	var inodeId = req.param('id');

	console.log(req);

	var INodeModel = ((req.param('controller') == "directory") || (req.param('controller') == "profile")) ? Directory : File;

	console.log(INodeModel);

// And broadcast activity to all sockets subscribed
	var subscribers = INodeModel.roomName(inodeId);
	async.waterfall([
	// Get info about the node we're trying to add permissions for
	function(callback) {
		INodeModel.find(inodeId).success(function(inode) {
			callback(null, inode);
		});
	},

	// Now that we have the node, find the account record for the user
	// we want to give the permsission.  If they don't exist, we'll
	// create them.


	function(inode, callback) {

		// If we've been given the email address of a user, attempt to look the up
		if(req.param('email')) {
			
			Account.find({
				where: { email: req.param('email') }
			}).success(function(account) {
				console.log("CREATING NEW ACCOUNT");
				// If we find them, move on to the next step (granting the permission)
				if(account) {
					callback(null, inode, account);
				}

				// Otherwise, create an account using this email, and create a verification
				// code for them.  Then grant permissions to this new user
				else {

					var verificationCode 	= UUIDGenerator.v1();
					var password 			= new Array(8);
					UUIDGenerator.v1(null, password, 0);
					password = UUIDGenerator.unparse(password);

					Account.create({
						name: req.param('email'),
						email: req.param('email'),
						password: password,
						verified: false,
						verificationCode: verificationCode
					}).success(function(newAccount) {

						console.log("ACCOUNT CREATED");
						console.log(newAccount);

						var options = {
							uri: 'http://localhost:1337/directory/createWorkgroup/' ,
							method: 'POST',
						};

						options.json =  {
		    				account_name : newAccount.name,
		    				account_id   : newAccount.id
			    		};
				    		
						request(options, function(err, response, body) {
							if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode); 			      			// res.send(200);
			    		});
						callback(null, inode, newAccount);
					});
				}
			});
		}

		// If we were sent the ID of an existing user, look them up and continue
		else {

			sails.log.debug('checking id of existing user');
			sails.log.info('checking owed_by.id: ', req.param('owned_by').id);
			Account.find(req.param('owned_by').id).done(function(err, account) {

				// if we cannot find the user then pass a
				if(err) {
					return callback(err);
				}
				callback(null, inode, account);
			});
		}
	},

	// Now that we have a user and an inode, go ahead and grant the permissions


	function(inode, account, callback) {

		// Permit this account
		Account.permit(req.param('permission'), inode, account.id, function(err, permission, alreadyExists, isOrphan) {

			// If this permission already exists, return failure
			if(alreadyExists) {
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

				EmailService.sendInviteEmail(options);

				// Create a response function--we're not quite ready with the response object yet though...
				var respond = 	function(response) {
									SocketService.broadcast('COLLAB_ADD_COLLABORATOR', subscribers, apiObj);
									SocketService.broadcast('COLLAB_ADD_COLLABORATOR', "Account_" + account.id, response);
									res.json(response);
								};

				// If it's a directory that was shared, count up the children that the new user
				// can see, and add it to the response object so that the directory icon has an
				// expand arrow in the UI if necessary
				if(req.param('controller') == 'directory' || req.param('controller') == 'profile') {

					async.auto({
						files: function(cb, rs) {
							File.whoseParentIs({
								parentId: inodeId,
								accountId: account.id
							}, cb);
						},
						dirs: function(cb, rs) {
							Directory.whoseParentIs({
								parentId: inodeId,
								accountId: account.id
							}, cb);
						}
					}, function(err, results) {
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
	], function(err, result) {
		if(err) return console.log(err);
	});

};

/**
 * Update a permission
 augurs
 */
exports.updatePermission = function(req, res) {
	sails.log.info('UpdatePermission:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
	var inodeId = req.param('id');
	var INodeModel = (req.param('controller') == "directory") ? Directory : File;
	var subscribers = INodeModel.roomName(inodeId); // And broadcast activity to all sockets subscribed
	var criteria = {
		AccountId: req.param('AccountId')
	};
	criteria[INodeModel.asForeignKey] = inodeId;
	((req.param('controller') == 'directory') ? DirectoryPermission : FilePermission)
	.find({where: criteria}).success(function(result) {

		result.type = req.param('permission');
		if(result.AccountId) {
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

		result.save().success(function(model) {

			var apiObj = {
				id: inodeId,
				owned_by: {
					id: req.param('AccountId')
				},
				permission: req.param('permission')
			};

			_.shout("API OBJECT", apiObj);
			SocketService.broadcast('COLLAB_UPDATE_COLLABORATOR', subscribers, apiObj);
			res.json({ // Send API response
				success: true
			});
		});
	});
};

/**
 *
 * Remove a permission
 */
exports.removePermission = function(req, res) {
	sails.log.info('RemovePermission:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
	var inodeId = req.param('id');
	var INodeModel = (req.param('controller') == "directory") ? Directory : File;
	var subscribers = INodeModel.roomName(inodeId); // And broadcast activity to all sockets subscribed
	async.waterfall([
	// Get info about the node we're trying to add permissions for


	function(callback) {
		INodeModel.find(inodeId).success(function(inode) {
			callback(null, inode);
		});
	},
	// Now that we have the node, find the account record for the user
	// we want to give the permsission.  If they don't exist, we'll
	// create them.


	function(inode, callback) {
		Account.permit(null, inode, req.param('AccountId'), function(err, result) {
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
exports.join = function(req, res) {
	if(req.isSocket) {
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
exports.leave = function(req, res) {
	if(req.isSocket) {
		var inodeId = req.param('id');
		var INodeModel = (req.param('controller') == "directory") ? Directory : File;
		var subscribers = INodeModel.roomName(inodeId);

		if(!_.isFinite(inodeId)) {
			throw new Error("Trying to leave NULL inode!");
		}

		// And broadcast activity to all sockets subscribed to the comment's parent item
		req.socket.leave(INodeModel.activeRoomName(inodeId));
		SocketService.broadcast('ACCOUNT_LEAVE', subscribers, _.extend(APIService.Account(req.session.Account), {
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

// Add new comment
exports.addComment = function(req, res) {
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
		res.json({
			success: true
		});


		if(req.isSocket) {
			var subscribers = Model.roomName(req.param('id'));

			// TODO: replace this with the version below
			// Respond with a simple acks and broadcast activity to all
			// sockets subscribed to the comment's parent item.
			SocketService.broadcast('COMMENT_CREATE', subscribers, APIService.Comment(_.extend(comment, {
				ItemId: req.param('id'),
				AccountName: req.session.Account && req.session.Account.name
			})));

			// Join active subscriber room for this model
			req.socket.join(Model.activeRoomName(req.param('id')));

			// TODO: THIS DOES NOT WORK
			// Respond with increament to num comments to the same inode with the same id
			// SocketService.broadcast('ITEM_COMMENT', subscribers, APIService.Comment(_.extend(comment,{
			// 	num_comments: Model.getNumComments(req.param('id')),
			// 	ItemId      : req.param('id')
			// })));
			
			/*Create logging*/
			Model.find(req.param('id')).success(function(mod) {
				
				var options = {
					uri: 'http://localhost:1337/logging/register/' ,
					method: 'POST',
	    		};

	    		var name = req.param('controller') == 'directory' ? 'directory ' : 'file ';

                options.json =  {
	    			user_id		: req.session.Account.id,
	    			text_message: 'has commented on a '+name+mod.name,
	    			activity  	: 'comment',
	    			on_user		: req.session.Account.id,
	    			client_ip   :  req.param('ipadd'),
					ip   		: req.session.Account.ip
	    		};

				request(options, function(err, response, body) {
					if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
	      			res.send(200);
	    		});
			});
	    	/*Create logging*/

		}
	}
};

// Remove comment
exports.removeComment = function(req, res) {
	sails.log.info('RemoveComment:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
	if(!req.param('CommentId')) {
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
	if(target.modelName == 'directory') {
		criteria.DirectoryId = target.id;
	} else {
		criteria.FileId = req.param('id');
	}
	Comment.findAndDelete(criteria, function(err, comment) {
		res.json({
			success: true
		});
	});
}


// Return the comments
exports.activity = function(req, res, cb) {

	var sql = "SELECT *,c.id AS id, a.avatar_image AS avatar, a.name AS AccountName, " + ((req.param('controller') == 'directory') ? "c.FileId " : "c.DirectoryId ") + "AS ItemId " + "FROM comment c " + "LEFT OUTER JOIN " + "account a " + "ON c.AccountId=a.id " + "WHERE " + ((req.param('controller') == 'directory') ? "c.DirectoryId=?" : "c.FileId=?");
	sql = Sequelize.Utils.format([sql, req.param('id')]);
	sequelize.query(sql, Comment).success(function(comments) {

		var apiObj = APIService.Activity.mini(comments);
		if (!cb) {
			res.json(apiObj); // Send API response
		} else {
			cb(null, apiObj);
		}
	}).error(function(e) {
		if (!cb) {
			throw new Error(e);
		} else {
			cb({
				type:"error",
				status:500
			});
		}
	});
};

exports.version= function(req, res, cb){

	Version.find({
		where: ['FileId = '+ req.param('id')]
	}).success(function(ver){

		if(ver.parent_id != '0'){

			var sql = "SELECT v.*, f.*,a.id AS acc_id,a.name AS acc_name FROM version v INNER JOIN file f ON v.FileId = f.id "+
				" LEFT JOIN account a ON v.AccountId=a.id "+
				"WHERE (f.deleted IS NULL OR f.deleted=0) AND v.parent_id=?";
			sql = Sequelize.Utils.format([sql, ver.parent_id]);

			sequelize.query(sql, null, {
				raw: true
			}).success(function(models) {
				res.json(APIService.Version.mini(models));
			}).error(function(e) {
				throw new Error(e);
			});

		}

	});

};

exports.comments = function(req, res) {
	INodeService.activity(req, res, function(err, result) {
		if (err) {
			res.json(err, err.status);
		} else {
			res.json({
				"total_count":result.length,
				"entries":result
			});
		}
	});
}

// Allow stronger privileges to override weaker restrictions
exports.expandPermission = function(action) {
	var type = [];

	switch(action) {
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

exports.enablePublicLink = function(req, res) {
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
		model.public_link_enabled = req.param('enable');
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
			SocketService.broadcast('PUBLIC_LINK_ENABLE', subscribers, {
				id: req.param('id'),
				enable: req.param('enable')
			});
		});
	});
};




exports.assignPermission = function(req, res) {

	sails.log("######################################");
	sails.log.info('AddPermission:' + req.param('id') + ' [User:' + req.session.Account.id + ']');
	sails.log("######################################");
	var request = require('request');
	var inodeId 	= req.param('id');
	var INodeModel 	= ((req.param('controller') == "directory") || (req.param('controller') == "tempaccount")) ? Directory : File;

// And broadcast activity to all sockets subscribed
	var subscribers = INodeModel.roomName(inodeId);
	async.waterfall([
	
// Get info about the node we're trying to add permissions for
		function(callback) {
			INodeModel.find(inodeId).success(function(inode) {
				callback(null, inode);
			});
		},

// Now that we have the node, find the account record for the user
// we want to give the permsission.  If they don't exist, we'll
// create them.

		function(inode, callback) {

// If we've been given the email address of a user, attempt to look the up

			if(req.param('email')) {
				Account.find({
					where: {
						email: req.param('email')
				}
			}).success(function(account) {

// If we find them, move on to the next step (granting the permission)
				if(account) {
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
					}).success(function(newAccount) {

						console.log("alskdalsdalskdjalskdjalksdjaslkdjaslkdjalksdkasllksj");
				    		console.log(newAccount);
						
callback(null, inode, newAccount);
					});
				}
			});
		}
// If we were sent the ID of an existing user, look them up and continue
		else {
			sails.log.debug('checking id of existing user');
			sails.log.info('checking owed_by.id: ', req.param('owned_by').id);
			Account.find(req.param('owned_by').id).done(function(err, account) {

				// if we cannot find the user then pass a
				if(err) {
					return callback(err);
				}
				callback(null, inode, account);
			});
		}
	},

// Now that we have a user and an inode, go ahead and grant the permissions
	function(inode, account, callback) {
// Permit this account
		Account.permit(req.param('permission'), inode, account.id, function(err, permission, alreadyExists, isOrphan) {
// If this permission already exists, return failure
			if(alreadyExists) {
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
				EmailService.sendInviteEmail(options);

				// Create a response function--we're not quite ready with the response object yet though...
				var respond = function(response) {
						SocketService.broadcast('COLLAB_ADD_COLLABORATOR', subscribers, apiObj);
						SocketService.broadcast('COLLAB_ADD_COLLABORATOR', "Account_" + account.id, response);
						res.json(response);
					};

				// If it's a directory that was shared, count up the children that the new user
				// can see, and add it to the response object so that the directory icon has an
				// expand arrow in the UI if necessary
				if(req.param('controller') == 'directory') {
					async.auto({
						files: function(cb, rs) {
							File.whoseParentIs({
								parentId: inodeId,
								accountId: account.id
							}, cb);
						},
						dirs: function(cb, rs) {
							Directory.whoseParentIs({
								parentId: inodeId,
								accountId: account.id
							}, cb);
						}
					}, function(err, results) {
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
	], function(err, result) {
		if(err) return console.log(err);
	});

};

// Get data about the request
var getRequestData = exports.getRequestData = function(req, res) {
		var id = req.param('id'),
			Model;
		if((Model = req.param('controller')) == "directory") {
			Model = Directory;
		} else if(Model == "file") {
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

			//		// Request/response transport
			//		req				: req,
			//		res				: res,
			//		isSocket		: req.isSocket,
			//		// This user's id, from session
			//		who				: {
			//			id				: req.session && req.session.Account.id,
			//			name			: 'test'+(req.session && req.session.Account.id),
			//			avatarSrc		: '/images/'+(req.session && req.session.Account.id)+".png"
			//		},
			// Rooms
			subscribers: Model.roomName(id),
			active: Model.activeRoomName(id)
		};
	};
