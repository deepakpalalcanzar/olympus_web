Directory = Model.extend({
	tableName: 'directory',

	name: {
		type: STRING,
		validate: {}
	},

	size: {
		type: INTEGER,
		defaultValue: 0
	},

	quota: {
		type: INTEGER,

		// Default is 1GB
		defaultValue: 1000000000
	},

	public_link_enabled: {
		type: BOOLEAN,
		defaultValue: true
	},

	public_sublinks_enabled: {
		type: BOOLEAN,
		defaultValue: sails.config.publicLinksEnabledByDefault
	},

	isWorkgroup: BOOLEAN,
	isLocked: BOOLEAN,
	deleted: BOOLEAN,

	hasMany: ['DirectoryPermission', 'File', 'Comment'],

	// If a directory has no parent, it is a workgroup
	belongsTo: ['Directory'],

	classMethods: {

		/** Create a new workgroup
			@options	:: { name, AccountId }
			@cb			:: function
		*/
		createWorkgroup: function(options, cb) {
			async.auto({

				// Make a unique name for the directory
				metadata: function(cb) {
					UniqueNameService.unique(Directory, options.name, null, cb);
				},

				// create a new directory
				newDirectory: ['metadata', function(cb, data) {
					Directory.create({
						name: data.metadata.fileName,
						isWorkgroup: true,
						OwnerId: options.accountId
					}).done(cb);
				}],

				newPermissions: ['newDirectory', function(cb, data) {
					DirectoryPermission.create({
						type: 'admin',
						accountId: options.accountId,
						directoryId: data.newDirectory.id
					}).done(cb);
				}]

			}, cb);
		},

		asForeignKey: 'DirectoryId',

		/**
		 * Return files which match the specified criteria
		 */
		findWhere: function(criteria) {
			return function(cb) {
				Directory.findAll({
					where: criteria
				}).done(cb);
			};
		},

		/**
		 * Return the directories who belong to the specified parent
		 * and are viewable by the logged-in user
		 *
		 * Optionally, include extra information, such as:
		 *  - number of comments
		 *  - number of child directories
		 *  - number of child files
		 */
		whoseParentIs: function(options, cb) {
			options = _.defaults(options, {
				attributes: {}
			});

			// Do initial query to get the list of inodes
			var basicSet = ["SELECT p.type AS permission, d.id AS pk, d.* " + "FROM directory d " + "INNER JOIN directorypermission p ON p.DirectoryId=d.id " + "INNER JOIN account a ON a.id=p.AccountId " + "WHERE (p.type='read' OR p.type='comment' OR p.type='write' OR p.type='admin') " + (options.parentId ? "AND d.DirectoryId=? " : "AND d.DirectoryId IS NULL ") + (options.accountId ? "AND a.id=? " : "AND a.id IS NULL ")];
			options.parentId && basicSet.push(options.parentId);
			options.accountId && basicSet.push(options.accountId);
			basicSet = Sequelize.Utils.format(basicSet);

			sequelize.query(Directory.hybridSetQuery(options, basicSet), Directory).success(function(resultSet) {
				cb(null, resultSet);
			}).
			error(cb);
		},

		/**
		 * Check quota for a given directory id, and file size.
		 */
		checkQuota: function(id, size, cb) {

			Directory.workgroup(id, function(workgroup) {

				if(workgroup.quota === null) {
					return cb();
				}
				if(workgroup.quota >= (workgroup.size + size)) {
					sails.log.debug('Quota check clear.');
					cb();
				} else {
					
					var message = 'Quota exceeded: Current size='+workgroup.size+' Quota='+workgroup.quota+' Attempting to upload='+size+'';
					sails.log.info(message);
					cb(message);
				}
			});
		},

		incrementSize: function(id, size, cb) {
			Directory.find(id).success(function(directory) {
				directory.size = directory.size + size;
				if(directory.AccountId) {
					directory.accountId = directory.AccountId;
					delete directory.AccountId;
				}
				if (directory.DirectoryId) {
					directory.directoryId = directory.DirectoryId;
					delete directory.DirectoryId;
				}
				directory.save().success(function() {
					cb();
				});
			});
		},

		updateParentDirectorySizes: function(id, size, cb) {

			if (typeof size == 'function') {
				cb = size;
			}

			// if this is workgroup and id is null, then call cb and return out
			if(!id) return cb();

			Directory.workgroup(id, function(workgroup) {
				return workgroup.recalculateSize(cb, true);
			});

			// Directory.find(id).done(function(err, directory) {
			// 	if (err) return cb(err);

			// 	var dir = directory;
			// 	var stop = false;

			// 	async.until(

			// 	function() {
			// 		return stop;
			// 	},

			// 	function(cb) {
			// 		dir.size += size;
			// 		if(dir.AccountId) {
			// 			dir.accountId = dir.AccountId;
			// 			delete dir.AccountId;
			// 		}
			// 		if (dir.DirectoryId) {
			// 			dir.directoryId = dir.DirectoryId;
			// 			delete dir.DirectoryId;
			// 		}
			// 		dir.save().done(function(err) {
			// 			if (err || !dir.DirectoryId) {
			// 				stop = true;
			// 				return cb(err);
			// 			}
			// 			else {
			// 				Directory.find(dir.DirectoryId).done(function(err, directory) {
			// 					if (err) return cb(err);
			// 					dir = directory;
			// 					return cb();
			// 				});
			// 			}

			// 		});
			// 	},

			// 	cb

			// 	);
			// });
		},
		/**
		 * Take a SQL query and add extended dir info to it.
		 *
		 * The basic_set query should have a field "id" representing
		 * the ID of a directory.  The resulting SQL query will
		 * provide num_dir_children, num_file_children and num_comments
		 * fields in the result set.
		 */
		hybridSetQuery: function(options, basic_set) {
			return "SELECT * FROM (" + basic_set + ") basic " + "LEFT OUTER JOIN (" + numCommentsQuery(options, basic_set) + ") nc ON nc.ncpk=basic.id " + "LEFT OUTER JOIN (" + numFileChildrenQuery(options, basic_set) + ") nfc ON nfc.nfcpk=basic.id " + "LEFT OUTER JOIN (" + numDirChildrenQuery(options, basic_set) + ") ndc ON ndc.ndcpk=basic.id ";

			function numFileChildrenQuery(options, basic_set) {
				var num_file_children = ["SELECT COUNT(x.id) AS num_file_children, " + "Parent.pk AS nfcpk FROM " + "(" + basic_set + ") Parent, file x " + "INNER JOIN filepermission p ON p.FileId=x.id " + "INNER JOIN account a ON a.id=p.AccountId " + "WHERE (p.type='read' OR p.type='comment' OR p.type='write' OR p.type='admin') " + "AND Parent.pk=x.DirectoryId " + (options.accountId ? "AND a.id=? " : "AND a.id IS NULL ") + "GROUP BY Parent.pk"];
				options.accountId && num_file_children.push(options.accountId);
				return Sequelize.Utils.format(num_file_children);
			}

			function numDirChildrenQuery(options, basic_set) {
				var num_dir_children = ["SELECT COUNT(x.id) AS num_dir_children, " + "Parent.pk AS ndcpk FROM  " + "(" + basic_set + ") Parent, directory x " + "INNER JOIN directorypermission p ON p.DirectoryId=x.id " + "INNER JOIN account a ON a.id=p.AccountId " + "WHERE (p.type='read' OR p.type='comment' OR p.type='write' OR p.type='admin') " + "AND Parent.pk=x.DirectoryId " + (options.accountId ? "AND a.id=? " : "AND a.id IS NULL ") + "GROUP BY Parent.pk"];
				options.accountId && num_dir_children.push(options.accountId);
				return Sequelize.Utils.format(num_dir_children);
			}

			function numCommentsQuery(options, basic_set) {
				return "SELECT COUNT(comment.id) AS num_comments, " + "Parent.pk AS ncpk FROM " + "(" + basic_set + ") Parent " + "LEFT OUTER JOIN comment ON Parent.pk=comment.DirectoryId " + "GROUP BY Parent.pk";
			}
		},

		// Get active participants in this model
		getActiveUsers: function(id, callback) {
			return io.sockets.clients(Directory.activeRoomName(id));
		},

		// Get # of active participants in this model
		getNumActiveUsers: function(id) {
			return io.sockets.clients(Directory.activeRoomName(id)).length;
		},

		/**
		 * Return the root folder context for the public API
		 */
		getRoot: function() {
			return {
				type: 'folder',
				id: 0,
				name: 'All Files'
			};
		},


		// Get the room name for model update subscription
		roomName: function(id) {
			return 'dir' + id;
		},

		// Get the room name for membership
		activeRoomName: function(id) {
			return 'dir' + id + '_active';
		},

		// Join model as active participant
		join: function(req, id) {
			if(req.isSocket) {
				req.socket.join(Directory.activeRoomName(id));
			}
		},

		// Leave model (go inactive)
		leave: function(req, id) {
			if(req.isSocket) {
				req.socket.leave(Directory.activeRoomName(id));
			}
		},

		// Subscribe to updates from this directory
		subscribe: function(req, id) {
			if(req.isSocket) {
				req.socket.join(Directory.roomName(id));
			}
		},

		// Unsubscribe to updates from this directory
		unsubscribe: function(req, id) {
			if(req.isSocket) {
				req.socket.leave(Directory.roomName(id));
			}
		},
		// Get a dir's workgroup
		workgroup: function(id, cb) {
			if(id === null) {
				cb(null);
				return;
			}
			Directory.find(id).success(function(model) {
				if(model === null) {
					cb(null);
				} else if(model.DirectoryId === null) {
					cb(model);
				} else {
					var workgroup = null;
					async.until(

					function() {
						return workgroup !== null;
					}, function(callback) {

						Directory.find(model.DirectoryId).success(function(parentModel) {
							sails.log.debug("PARENT DIR: " + parentModel.DirectoryId);
							if(parentModel.DirectoryId === null) {
								workgroup = parentModel;
							} else {
								model = parentModel;
							}
							callback();
						});
						
					}, function(err) {
						cb(workgroup);
					});
				}
			});
		}
	},
	instanceMethods: {

		// Support polymorphic subscribe
		subscribe: function(req) {
			Directory.subscribe(req, this.id);
		},

		// Support polymorphic unsubscribe
		unsubscribe: function(req) {
			Directory.subscribe(req, this.id);
		},

		/**
		 * Return this directory's parent folder for the public API
		 * TODO: also get parent name (requires join)
		 */
		getParent: function() {
			return(this.DirectoryId) ? {
				type: 'folder',
				id: this.DirectoryId,
				name: null
			} : Directory.getRoot();
		},


		getNumActiveUsers: function() {
			return Directory.getNumActiveUsers(this.id);
		},

		// Return the number of comments for this node
		getNumComments: function(cb, results) {
			this.getComments().success(function(comments) {
				cb(null, comments.length);
			});
		},

		deleteDirPermissions: function(cb, rs) {
			DirectoryPermission.findAll({
				where: {
					DirectoryId: this.id
				}
			}).complete(function(e, r) {
				var chainer = new Sequelize.Utils.QueryChainer();
				_.each(r, function(m) {
					SocketService.broadcast('COLLAB_REMOVE_COLLABORATOR', Directory.roomName(m.DirectoryId), {
						id: m.DirectoryId,
						owned_by: {
							id: m.AccountId
						}
					});
					chainer.add(m.destroy());
				});
				chainer.run().complete(cb);
			});
		},

		/**
		 * "Remove" this directory record (mark as deleted and remove from parent dir)
		 * Destroy all descendant directories and files
		 * Cascade delete all permissions
		 */
		rm: function(callback) {
			var x = this;
			var parentId = x.DirectoryId;
			x.updateAttributes({
				deleted: true,
				directoryId: null
			}).complete(function(e, rs) {

				async.auto({

					// Update the parent directory sizes.
					updateParentDirectorySizes: function(cb) {
						sails.log.debug('updating parent directories');
						Directory.updateParentDirectorySizes(parentId, cb);
					},

					deleteDirPermissions: _.bind(x.deleteDirPermissions, x),

					// rm child files
					rmFiles: function(cb, rs) {
						File.findAll({
							where: {
								DirectoryId: x.id
							}
						}).complete(function(e, files) {
							// No child files?  Return
							if(files.length === 0) {
								cb(e, files);
								return;
							}
							async.forEach(files, function(f, cb2) {
								f.rm(cb2);
							}, cb);
						});
					},

					// Recursively rm subdirectories
					rmSubdirectories: function(cb, rs) {
						Directory.findAll({
							where: {
								DirectoryId: x.id
							}
						}).complete(function(e, subdirs) {
							if(subdirs.length === 0) {
								cb(e, subdirs);
								return;
							}
							async.forEach(subdirs, function(d, cb) {
								d.rm(cb);
							}, cb);
						});
					}
				}, callback);
			});
		},

		stripPermissions: function(callback) {
			var x = this;
			async.auto({

				deleteDirPermissions: _.bind(x.deleteDirPermissions, x),

				// strip child files
				stripFiles: function(cb, rs) {
					File.findAll({
						where: {
							DirectoryId: x.id
						}
					}).complete(function(e, files) {
						// No child files?  Return
						if(files.length === 0) {
							cb(e, files);
							return;
						}
						// Get the IDs of the files
						var fileIds = _.map(files, function(file) {
							return file.id;
						});
						// Delete the files and their permissions
						FilePermission.findAll({
							where: {
								FileId: fileIds
							}
						}).success(function(perms) {
							// Delete all the file permissions
							async.forEach(perms, function(p, cb2) {
								SocketService.broadcast('COLLAB_REMOVE_COLLABORATOR', File.roomName(p.FileId), {
									id: p.FileId,
									owned_by: {
										id: p.AccountId
									}
								});
								p.destroy().complete(cb2);
							}, cb);
						});
					});
				},

				// Recursively rm subdirectories
				stripSubdirectories: function(cb, rs) {
					Directory.findAll({
						where: {
							DirectoryId: x.id
						}
					}).complete(function(e, subdirs) {
						if(subdirs.length === 0) {
							cb(e, subdirs);
							return;
						}
						async.forEach(subdirs, function(d, cb) {
							d.stripPermissions(cb);
						}, cb);
					});
				}
			}, callback);
		},

		/**
		 * Rename this directory to newName
		 */
		rename: function(newName, callback) {
			this.updateAttributes({
				name: newName
			}).complete(callback);
		},

		/**
		 * Recursively copy this dir (and all descendants)
		 * Then move the copied version into targetDir
		 * (self and descendants inherit any new permissions from the directory)
		 *
		 * If a child directory or file has existing permissions, they are not copied.
		 * Instead, they receive only the inherited permissions of targetDir.
		 */
		cp: function(targetDir, callback) {
			var directory = this;


			function cpR(cwd, target, thisCb) {
				async.auto({

					// Create empty shell directory in target
					shellDirectory: function(cb, results) {
						Directory.create({
							name: cwd.name,
							DirectoryId: target.id
						}).success(_.unprefix(cb));
					},

					// Copy file leaves in cwd into shell directory
					copyFiles: ['shellDirectory', function(cb, results) {

						// Get list of child files
						File.findAll({
							where: {
								DirectoryId: cwd.id
							}
						}).
						success(function(files) {

							// Create copy of each file in shell
							if(files.length > 0) {
								async.forEach(files, function(f, cb) {
									f.cp(results.shellDirectory, cb);
								}, cb);
							} else {
								cb(null, null);
							}
						});
					}],

					// Recursively copy child directories into shell directory
					copyDirs: ['shellDirectory', 'copyFiles', function(cb, results) {

						// Get list of child directories
						Directory.findAll({
							where: {
								DirectoryId: cwd.id
							}
						}).
						success(function(childDirs) {

							// Base case: no child directories
							if(childDirs.length <= 0) {
								cb(null, results.shellDirectory);
							}
							// Child directories exist
							else {
								async.forEach(childDirs, function(thisChildDir, itemCb) {
									// Recursively copy children into target
									cpR(thisChildDir, results.shellDirectory, itemCb);
								}, function(err, r) {
									cb(err, results.shellDirectory);
								});
							}
						});
					}]
				}, thisCb);
			}


			async.auto({

				//  create deep copy of directory and all descendants
				clonedDir: function(cb, results) {
					cpR(directory, targetDir, cb);
				},

				// Move cloned directory into shellDir
				move: ['clonedDir', function(cb, results) {
					results.clonedDir.shellDirectory.mv(targetDir, cb);
				}]

			}, function(err, results) {
				callback(err, results.move);
			});
		},

		/**
		 * Move this directory with all of its descendants into the targetDir
		 */
		mv: function(targetDirId, callback) {
			var dir = this;
			var sourceDirId = dir.DirectoryId;
			async.auto({
				checkQuota: function(cb) {
					Directory.checkQuota(targetDirId, dir.size, cb);
				},
				// Delete permissions from all files and folders
				// under this directory and its subdirs
				stripPermissions: ['checkQuota', function(cb, results) {
					dir.stripPermissions(cb);
				}],

				// Get permissions associated w/ targetDir
				targetDirPermissions: function(cb, results) {
					DirectoryPermission.findAll({
						where: {
							DirectoryId: targetDirId
						}
					}).complete(cb);
				},

				// Assign new permissions to this dir and all descendants.
				// Anyone with access to the target dir gets the same access
				// to the source dir
				inheritPermissions: ['stripPermissions', 'targetDirPermissions', function(cb, results) {
					// TODO: with transaction
					async.forEach(results.targetDirPermissions, function(v, itemCb) {
						dir.permit(v.type, v.AccountId, null, itemCb);
					}, cb);
				}],

				// Move this file into targetDir
				move: ['inheritPermissions', function(cb, results) {
					dir.updateAttributes({
						directoryId: targetDirId
					}).complete(cb);
				}],
				updateSizes: ['move', function(cb) {
					if(sourceDirId == targetDirId || sourceDirId === null) {
						cb();
					}
					Directory.updateParentDirectorySizes(sourceDirId, -dir.size, function() {
						Directory.updateParentDirectorySizes(targetDirId, dir.size, function() {
							cb();
						});
					});
				}]

			}, function(err, results) {
				callback(err, results.move);
			});
		},


		/**
		 * Permit the specified account to read this directory
		 * and all descendant directories and files
		 */
		permitRead: function(account, callback) {
			this.permit('read', account, callback);
		},


		/**
		 * Permit the specified account to perform the specified action on this directory
		 * and all descendant directories and files
		 */
		permit: function(action, account, orphan, callback) {

			var directory = this;

			var accountId = (_.isObject(account) ? account.id : account);
			async.auto({

				// Hold on to reference to this directory
				thisDirectory: function(cb, results) {
					cb(null, directory);
				},

				// Build set of this and all descendant directories
				setOfDescendantDirs: ['thisDirectory', _.bind(directory.getDescendantDirs, directory)],

				// Permit specified action on this and all descendant dirs
				permitDescendantDirs: ['setOfDescendantDirs', function(cb, results) {

					// Get the permissions we have
					var dirIds = _.map(results.setOfDescendantDirs, function(dir) {
						return dir.id;
					});
					console.log("Descendant dirs:");
					console.log(dirIds);

					// If action is null, we want to remove all permissions.
					if(action !== null) {
						async.auto({
							currentPermissions: function(cb2, rs) {
								DirectoryPermission.findAll({
									where: {
										AccountId: accountId,
										DirectoryId: dirIds
									}
								}).done(cb2);
							},
							updatePermissions: ['currentPermissions', function(cb2, rs) {
								DirectoryPermission.updateAll(rs.currentPermissions, {
									orphan: null
								}, cb2);
								// De-orphanize all of the files / dirs under the newly shared directory
								_.each(rs.currentPermissions, function(perm) {
									SocketService.broadcast('ITEM_DEORPHANED', 'Account_' + accountId, {
										id: perm.DirectoryId
									});
								});

							}],
							createPermissions: ['currentPermissions', function(cb2, rs) {
								var curPermDirIds = _.map(rs.currentPermissions, function(perm) {
									return perm.DirectoryId;
								});
								var newPermDirIds = _.difference(dirIds, curPermDirIds);
								DirectoryPermission.createAll({
									accountId: accountId,
									directoryId: newPermDirIds,
									type: action
								}, cb2);
							}]
						}, function(err, rs) {
							if(orphan) {
								DirectoryPermission.find({
									where: {
										AccountId: accountId,
										DirectoryId: directory.id
									}
								}).done(function(err, d) {
									d.orphan = true;
									if(d.AccountId) {
										d.accountId = d.AccountId;
										delete d.AccountId;
									}
									if (d.DirectoryId) {
										d.directoryId = d.DirectoryId;
										delete d.DirectoryId;
									}
									d.save().done(cb);
								});
							} else {
								return cb();
							}
						});
					} else {
						DirectoryPermission.findAll({
							where: {
								AccountId: accountId,
								DirectoryId: _.map(results.setOfDescendantDirs, function(dir) {
									return dir.id;
								})
							}
						}).complete(function(e, r) {
							var chainer = new Sequelize.Utils.QueryChainer();
							_.each(r, function(m) {
								chainer.add(m.destroy());
							});
							chainer.run().complete(cb);
						});
					}
				}],

				// Build set of all descendant files
				setOfDescendantFiles: ['setOfDescendantDirs', function(cb, results) {
					File.findAll({
						where: {
							DirectoryId: _.map(results.setOfDescendantDirs, function(dir) {
								return dir.id;
							})
						}
					}).done(cb);
				}],

				// Permit specified action on all descendant files
				permitDescendantFiles: ['setOfDescendantFiles', function(cb, results) {
					if(results.setOfDescendantFiles.length > 0) {
						// If action is null, we want to remove all permissions.
						if(action !== null) {
							// Get the permissions we have
							var fileIds = _.map(results.setOfDescendantFiles, function(file) {
								return file.id;
							});
							async.auto({
								currentPermissions: function(cb2, rs) {
									FilePermission.findAll({
										where: {
											AccountId: accountId,
											FileId: fileIds
										}
									}).done(cb2);
								},
								updatePermissions: ['currentPermissions', function(cb2, rs) {
									FilePermission.updateAll(rs.currentPermissions, {
										orphan: null
									}, cb2);
								}],
								createPermissions: ['currentPermissions', function(cb2, rs) {
									var curPermFileIds = _.map(rs.currentPermissions, function(perm) {
										return perm.FileId;
									});
									var newPermFileIds = _.difference(fileIds, curPermFileIds);
									FilePermission.createAll({
										accountId: accountId,
										fileId: newPermFileIds,
										type: action
									}, cb2);
								}]
							}, cb);
						} else {
							FilePermission.findAll({
								where: {
									AccountId: accountId,
									FileId: _.map(results.setOfDescendantFiles, function(file) {
										return file.id;
									})
								}
							}).complete(function(e, r) {
								var chainer = new Sequelize.Utils.QueryChainer();
								_.each(r, function(m) {
									chainer.add(m.destroy());
								});
								chainer.run().complete(cb);
							});
						}
					} else {
						cb();
					}
				}]

			}, callback);

		},

		/**
		 * Get all descendant directories for the specified directory
		 */
		getDescendantDirs: function(cb, results) {
			this.getDescendantDirsHelper(results.thisDirectory, [results.thisDirectory], cb);
		},

		getDescendantDirsHelper: function(currentDir, resultDirs, callback) {
			var directory = this;
			Directory.findAll({
				where: {
					DirectoryId: currentDir.id
				}
			}).success(function(newDirs) {
				// Base case: No more child directories inside this dir
				if(newDirs.length === 0) {
					callback(null, resultDirs);
				}
				// Child directories exist, so we'll recursive look at them
				else {
					// Create an array of asynchronous workers
					var finders = [];
					_.each(newDirs, function(dir, index) {
						// Add this directory to the result
						resultDirs.push(dir);
						// Create a worker to find all of this directory's subdirectories,
						// and add the results to resultDirs
						finders.push(function(cb) {
							directory.getDescendantDirsHelper(dir, resultDirs, cb);
						});
					});
					// Run the workers, and call the callback when they're done.
					// At that point the workers will have added all of the subdirectories
					// they found to the resultDirs array
					async.parallel(finders, function(err, results) {
						callback(null, resultDirs);
					});
				}
			});
		},

		// Get the room name for model update subscription
		roomName: function() {
			return Directory.roomName(this.id);
		},

		// Get the room name for membership
		activeRoomName: function() {
			return Directory.activeRoomName(this.id);
		},

		workgroup: function(cb) {
			Directory.workgroup(this.id, cb);
		},

		recalculateSize: function(cb, force) {

			// If file size is cached, use the cached size.
			if (this.size !== null && !force) {
				return cb(null, this);
			}

			var self = this;
			async.auto({

				// Add up file sizes
				sumFiles: function(cb) {
					sumFiles(self.id, cb);
				},

				// Get subdirs
				dirs: function(cb) {
					Directory.findAll({
						where: {
							DirectoryId: self.id,
							deleted: null
						}
					}).success(function(dirs){cb(null, dirs);}).error(cb);
				},

				// Get subdir sizes
				sumDirs: ['dirs', function(cb, results) {

					var size = 0;
					async.reduce(results.dirs, 0, function(size, dir, cb) {
						dir.recalculateSize(function(err, dir) {
							if (err) {return cb(err);}
							return cb(null, size + dir.size);
						}, force);
					}, cb);

				}]

			}, function(err, results) {
				if (err) {return cb(err);}
				// Total size is files + dirs
				var size = results.sumFiles + results.sumDirs;
				// If the size has changed, save it and alert subscribers
				if (self.size != size) {
					// Change the model's size
					self.size = size;
					// Workaround for sequelizing skipping attributes with zero value
					if (self.size == 0) {self.size = '0';}
					// Save the new model size and send a message to subscribers to update the size
					return self.save(['size']).success(function(){
						var subscribers = Directory.roomName(self.id); // And broadcast activity to all sockets subscribed
						var apiObj = APIService.Directory.mini(self);
						SocketService.broadcast('ITEM_RESIZE', subscribers, apiObj);
						cb(null, self);
					}).error(cb);
				} 
				// If the size hasn't changed, just continue
				else {
					return cb(null, self);
				}				
			});

			function sumFiles(dirId, cb) {
	          File.findAll({
            	where: {
              		DirectoryId: dirId,
              		deleted: null
              	}
              }).success(function(files) {
              	return cb(null, _.reduce(files, function(memo, file) {return memo + file.size;}, 0));
              }).error(cb);
            }

		}

	}
});
