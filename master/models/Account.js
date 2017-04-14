Account = Model.extend({

	tableName: 'account',

	email: {
		type: STRING,
		unique: true
	},
	password: {
		type: STRING,
		validate: {
			len: {
				args: [3, 25],
				msg: "Password must be between 3 and 25 characters."
			}
		}
	},
	name: {
		type: STRING,
		validate: {
			len: {
				args: [3, 25],
				msg: "Name must be between 3 and 25 characters."
			}
		}
	},
	phone: STRING,
	title: STRING,

	verified: BOOLEAN,
	verificationCode: STRING,
	avatar_fname: STRING,
	avatar_mimetype: STRING,
	avatar_image: STRING,
	avatarUploadPathId: INTEGER,
	enpUploadPathId: INTEGER,

	isAdmin: BOOLEAN,
	isLdapUser: BOOLEAN,
	isADUser: BOOLEAN,
	deleted: {
		type: BOOLEAN,
		defaultValue: false
	},

	hasMany: ['Role', 'FilePermission', 'DirectoryPermission'],

	classMethods: {

		// Whether the specified account has the permission
		// to perform the specified action on the specified inode
		can: function(action, inodeId, inodeType, accountId, callback) {
				
			iNodeId= 23;
			_.shout("CAN:", "account:" + accountId, "do: " + action, "to: " + inodeId, "which is a: " + inodeType);
			if (!inodeId) {
				Account.find(accountId).done(function(err, account) {
// If the account is an admin, pass the account back
					callback(null, account && account.isAdmin && account);
				});


			} else {

				async.auto({

					account: function(cb, results) {
						Account.find(accountId).done(cb);
					},

					inode: function(cb, results) {
						if (inodeType != "Directory" && inodeType != "File") {
							cb("Trying to access unknown model!", null);
							return;
						}

						global[inodeType].find(inodeId).done(function(err, inode) {
							if (err) cb(err);
							// If no inode is found
							else if (!inode) cb("No " + inodeType + " exists for id=" + inodeId);
							else cb(err, inode);
						});
					},

					can: ['account', 'inode', function(cb, results) {
						var criteria = {
							AccountId: accountId,
							type: INodeService.expandPermission(action)
						};
						criteria[inodeType + "Id"] = inodeId;

						Account._iNode(results.inode).permission.find({
							where: criteria
						}).done(cb);
					}]

				}, function(err, results) {
					callback(err, results && results.can);
				});
			}
		},

		// Allow the specifid account to perform an action on the specified model
		permit: function(action, inode, accountId, callback) {

			// If we're requesting a "null" permission, it means we actually
			// want to remove permissions for the account in question, so
			// we'll just do that and return
			if (action === null) {
				sails.log.debug('removeing permission');
				inode.permit(action, accountId, null, function(permission) {
					callback(null, permission, false);
				});
				return;
			}

			sails.log.debug('changing permission');

			// Otherwise we'll look to see if the user already has permissions,
			// and act accordingly
			// Right now a user can only have one permission per model,
			// so we don't need to specify a type in the criteria
			var inodeClassObj = Account._iNode(inode);
			var criteria = {
				AccountId: accountId
			};
			criteria[inodeClassObj.foreignKeyAttr] = inode.id;
			inodeClassObj.permission.find({
				where: criteria
			}).done(function(err, permission) {

				// If they don't have any permissions, we'll add a new record
				if (!permission) {

					// Manage orphan state by looking at whether this user
					// has at least read access to the parent of the specified INode
					// If the iNode has no parent, it's always an orphan

					var parentId = inode.DirectoryId;
					console.log('!!!!!parent ID', parentId);
					if (parentId) {
						DirectoryPermission.find({
							where: {
								DirectoryId: parentId,
								AccountId: accountId
							}
						}).done(afterwards);
					} else {
						sails.log.debug('this is a an orphan or workgroup');
						afterwards(null, true);
					}

					function afterwards(err, parent) {
						sails.log.debug("NEW PERM");
						var orphan = parent ? null : true;
						inode.permit(action, accountId, orphan, function(err, permission) {
							callback(err, permission, false, orphan);
						});
						sails.log.debug("DID THIS GET PAST?");
					}

				}

				// If they already have a permission, we'll just update the type
				else {
					// if the permission already exists, modify it
					sails.log.debug("OLD PERM");
					permission.type = action;
					if(permission.AccountId) {
						permission.accountId = permission.AccountId;
						delete permission.AccountId;
					}
					if (permission.DirectoryId) {
						permission.directoryId = permission.DirectoryId;
						delete permission.DirectoryId;
					}
					if (permission.FileId) {
      			permission.fileId = permission.FileId;
						delete permission.FileId;
  				}
					permission.save().done(function(err, permission) {
						callback(err, permission, true, permission.orphan);
					});
				}
			});
		},

		// Build criteria for a WHERE query based on model type and action
		// Allow for null account id
		_criteria: function(action, inode, account) {
			var criteria = [Account._iNode(inode).foreignKeyAttr + "=? AND type=?", inode.id, action];

			if (account) {
				criteria[0] += " AND AccountId=?";
				criteria.push((account.id) ? account.id : account);
			} else {
				criteria[0] += " AND AccountId IS NULL";
			}
			return criteria;
		},

		// If this account has the specified Role, run thenCallback
		// otherwise perform the elseCallback
		hasRole: function(accountId, roleName, thenCallback, elseCallback) {
			if (!accountId) {
				return elseCallback();
			}

			Account.find(accountId).success(function(account) {
				account.getRoles().success(function(roles) {
					_.any(roles, function(role) {
						return role.name == roleName;
					}) ? thenCallback() : elseCallback();
				});
			});
			return true;
		},

		// Determine domain and association information based on inode's model name
		_iNode: function(inode, inodeType) {

			return ((inodeType || inode.getModelName()) === "file") ? {
				permission: FilePermission,
				model: File,
				foreignKeyAttr: 'FileId'
			} : ((inodeType || inode.getModelName()) === "directory") ? {
				permission: DirectoryPermission,
				model: Directory,
				foreignKeyAttr: 'DirectoryId'
			} : null;
		},


		// Subscribe to updates from this account
		subscribe: function(req, id) {
			if (req.isSocket) {
				_.shout("Subscribed to account #" + id);
				req.socket.join("Account_" + id);
			}
		},

		// Broadcast a message to this account
		broadcast: function(eventName, data, accountId) {
			SocketService.broadcast(eventName, 'Account_' + accountId, data);
		}
	},
	instanceMethods: {

		// Support polymorphic subscribe
		subscribe: function(req) {
			Account.subscribe(req, this.id);
		},

		setRoleByName: function(roleName, callback) {
			if (!roleName) return callback();

			var self = this;
			Role.find({
				where: {
					name: roleName
				}
			}).success(function(role) {
				if (role) {
					self.setRoles([role]).success(function() {
						callback();
					});
				} else {
					throw new Error("No such role ('" + roleName + "') exists!");
				}
			});
		},

		permitLs: function(inode, callback) {
			this.permit('read', inode, callback);
		},
		canLs: function(inode, callback) {
			this.can('read', inode, callback);
		},

		// Allow this account to perform an action on the specified model
		permit: function(action, inode, callback) {
			Account._iNode(inode).permission.findOrCreate(Account._criteria(action, inode, this), ['type', 'AccountId', Account._iNode(inode).foreignKeyAttr],
			callback);
		},

		// Return whether this account can perform an action on the specified model
		can: function(action, inode, callback) {
			Account.can(action, inode.id, inode.getModelName(), this.id, callback);
		}
	}
});
