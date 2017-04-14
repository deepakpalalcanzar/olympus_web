/*	component consisting of both upload buttons
	as well as the search bar */
Mast.registerComponent('UploadSearchComponent',{

	model: {
		createFolderButton	: false,
		uploadFileButton	: false,
		superadmin 			: false,//Rishabh
		gdriveSync			: false,
		dropboxSync			: false,
		boxSync				: false,
	},

	template: '.upload-search-template',
	outlet: '#topbar',
	autoRender: false,
	
	events: {
		'click .create-folder'	: 'createFolderOrWorkgroup',
		'click .upload-file'  	: 'createUploadDialog',
		'click .search-users'  	: 'searchUsers',
		// 'click .thumbnail'  	: 'thumbnailView',
		'click .detail-list'  	: 'dafaultView',
		'click .sync-box'  	: 'createSyncBoxDialog',
		'click .sync-dbox'  	: 'createSyncDboxDialog',
		'click .sync-drive'  	: 'syncDrive'
	},
	init: function(){
		var self = this;
		console.log('thismodel', this.model.attributes);
		if( ( typeof Mast.Session != 'undefined' ) && Mast.Session.Account.isSuperAdmin){
			console.log('setting superadmin true');
			self.set('superadmin', true);
		}
		Mast.Socket.request('/sitesettings/getSiteOptions', {}, function (res, err) {
			if(err || res.success == false){
				console.log(err || res.error);
				return;
			}
			self.set('gdriveSync', res.gdriveSync);
			self.set('dropboxSync', res.dropboxSync);
			self.set('boxSync', res.boxSync);
		});
	},

	syncDrive: function(){
		Mast.Socket.request('/directory/syncdrive',{
			'drive_action': 'check_drive_token'
			// 'code': '4/Mo46Ij2IZZXk1oQLZKeI-Kg4c-1yvY8b6v_t7TaXwoo',//'4/cloM0J79v0XB8VpfrGFEKo_gA--stxvkdmaYD0XKvjI'
		},
		function(res, other) {
			if(typeof res.authorizeUrl != 'undefined'){
				var driveConsent = new Mast.components.DriveConsentDialogComponent({},{
					authorizeUrl 	: res.authorizeUrl
				});
			}
			console.log('donedonedonedonedonedonedonedonedone');
			console.log(res);
			console.log(other);
			// Add to collection
			// currentInode.collection.add([res]);

			// currentInode.collection.where({
			// 	id: res.id
			// })[0].set('editing',true);
		});
	},

	syncDriveOld: function(){
		var self = this;
		// loadPicker();
		gapi.load('auth2', function(){

			auth2 = gapi.auth2.init({
	          client_id: clientId,
	          // Scopes to request in addition to 'profile' and 'email'
	          //scope: 'additional_scope'
	        });

			auth2.grantOfflineAccess({'redirect_uri': 'postmessage'}).then(function(authResult){//handleAuthResult

	          	if (authResult && !authResult.error) {
			        oauthToken = authResult.access_token;
			        console.log(authResult);

					Mast.Socket.request('/directory/syncdrive',{
						'drive_action': 'check_drive_token'
						// 'code': '4/Mo46Ij2IZZXk1oQLZKeI-Kg4c-1yvY8b6v_t7TaXwoo',//'4/cloM0J79v0XB8VpfrGFEKo_gA--stxvkdmaYD0XKvjI'
					},
					function(res, other) {
						if(typeof res.authorizeUrl != 'undefined'){
							var driveConsent = new Mast.components.DriveConsentDialogComponent({},{
								authorizeUrl 	: res.authorizeUrl
							});
						}
						console.log('donedonedonedonedonedonedonedonedone');
						console.log(res);
						console.log(other);
						// Add to collection
						// currentInode.collection.add([res]);

						// currentInode.collection.where({
						// 	id: res.id
						// })[0].set('editing',true);
					});
				}
			});
		});
	},

	syncDriveOld: function(){

		var self = this;
		// loadPicker();
		gapi.load('auth', function(){
			window.gapi.auth.authorize(
	          {
	            'client_id': clientId,
	            'scope': scope,
	            'immediate': false
	          },
	          function(authResult){//handleAuthResult
	          	if (authResult && !authResult.error) {
			        oauthToken = authResult.access_token;
			        console.log(authResult);
			        // createPicker();
			        // $('#authToken').val(oauthToken);//Rishabh

			        console.log('test');
			        self.retrieveAllFilesInFolder('root', oauthToken, function(datalist){

			  			drivenodeobj = new Array();

						gapi.client.load('drive', 'v2', function(){

							var currenttime = Date.now || function() {
							  return +new Date;
							};

							var lastrequest = currenttime();
							var thisrequest = 0;

							var i = 0;
							self.getNextDriveFileRecursive(datalist, drivenodeobj, i, function(filelist){
								console.log('datalistdatalistdatalistdatalistdatalistdatalist');
								console.log(filelist.length);
								// console.log(filelist[0]);
								// console.log('datalistdatalistdatalistdatalistdatalistdatalist');
								Mast.Socket.request('/directory/syncdrive',{
									drivenode: filelist
								},

								// Once the folder is created, set it to edit mode so
								// that it can be named.
								function(res, other) {
									console.log('donedonedonedonedonedonedonedonedone');
									console.log(res);
									console.log(other);
									// Add to collection
									// currentInode.collection.add([res]);

									// currentInode.collection.where({
									// 	id: res.id
									// })[0].set('editing',true);
								});
							});
							console.log('TESTOOOOTESTOOOOTESTOOOOTESTOOOOTESTOOOO');
						});
			  		});
			    }
	        });
		});
      	// gapi.load('picker', function(){
      	// 	pickerApiLoaded = true;
      	// });
	},

	getNextDriveFileRecursive: function(datalist, drivenodeobj, i, callback) {
		var self = this;

		console.log('getNextDriveFileRecursive: '+i+' : '+(i < datalist.length));
		//if this is the last iteration, then execute callback with recursively populated drivenodeobj
		if(i < datalist.length){

        	/*async.auto({
            // Get the permissions linked with the parent directory
            parentPermissions: function (cb, res) {
                DirectoryPermission.findAll({
                    where: {DirectoryId: req.param('parent').id}
                }).done(cb);
            },
            newDirectory: function (cb, r) { // Create the new directory
                Directory.create({
                    name: r.metadata.fileName,
                    directoryId: req.param('parent').id
                }).done(cb);
            },
            // Cascade parent permissions to new directory
            newPermissions: ['newDirectory', 'parentPermissions', function (cb, res) {
                var chainer = new Sequelize.Utils.QueryChainer();
                _.each(res.parentPermissions, function (parentPermission, index) {
                    // The creator always gets admin perms
                    if (parentPermission.AccountId != req.session.Account.id) {
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
                    accountId: req.session.Account.id,
                    directoryId: res.newDirectory.id
                }).done(cb);
            }]

        }, function (err, results) {
        	console.log('33333333333333333333');
        });*/

        	// console.log(datalist[i]);

        	//(i%10): wait[2200ms] after every 10 request due to google limit of 10requests/sec.,
        	//(i!=0): ignore timeout on very first request as (0%10) == 0 =>true
        	//google limit is 10req/sec. but practically 2200ms is ideal avg. time as 1000ms also causes 403 sometimes
			if( ( (i%8) == 0) && (i != 0)){

				debug.info('timeoutbufferstart:1sec');
				setTimeout(function(){

					self.execNextDriveFileSingle(datalist, drivenodeobj, i, callback);
					/*if(typeof datalist[i] != 'undefined'){
						var testin = gapi.client.drive.files.get({
				          'fileId': datalist[i].id
				        });
			        	testin.execute(function(drivenode) {

			        		self.checkNHandleDrivenode(drivenode,drivenodeobj, datalist.length);
						});
					}
					self.getNextDriveFileRecursive(datalist, drivenodeobj, ++i, callback);	*/
				},2200);

			}else{
				self.execNextDriveFileSingle(datalist, drivenodeobj, i, callback);
				/*if(typeof datalist[i] != 'undefined'){

					var testin = gapi.client.drive.files.get({
			          'fileId': datalist[i].id
			        });

		        	testin.execute(function(drivenode) {
		        		// debug.info(drivenode);
		        		self.checkNHandleDrivenode(drivenode,drivenodeobj, datalist.length);
					});
				}
				self.getNextDriveFileRecursive(datalist, drivenodeobj, ++i, callback);*/
			}
		}else if( i != 0 ){//do not return for the first iteration called from syncDrive but call rest recursive loops
			debug.info(drivenodeobj.length+' file(s) info retrieved.');
			callback(drivenodeobj);
        }
	},

	execNextDriveFileSingle: function(datalist, drivenodeobj, i, callback){
		
		var self = this;
		async.auto({
            // Get the permissions linked with the parent directory
            handleThisDriveNode: function (cb, res) {

                if(typeof datalist[i] != 'undefined'){
					var testin = gapi.client.drive.files.get({
			          'fileId': datalist[i].id
			        });
		        	testin.execute(function(drivenode) {

		        		self.checkNHandleDrivenode( drivenode, drivenodeobj, ++i, cb );
		        		console.log('handleThisDriveNodecallback:'+i);
					});
				}else{
					console.log('handleThisDriveNodecallback:'+i);
					cb(null, true);
				}
            },
            requestNextDriveNode: function (cb, r) { // Create the new directory
            	if(typeof datalist[i] != 'undefined'){
					console.log('requestNextDriveNodeCallback:'+i);
                	self.getNextDriveFileRecursive(datalist, drivenodeobj, ++i, cb);
				}else{
					console.log('requestNextDriveNodeCallback:'+i);
					cb(null, true);
				}
            },
            // Cascade parent permissions to new directory
            newPermissions: ['requestNextDriveNode', 'handleThisDriveNode', function (cb, res) {

            	console.log('-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e-e');
            	cb(null, true);
     //        	if((i+1) == datalist.length){
					// debug.info(drivenodeobj.length+' file(s) info retrieved.');
					// callback(drivenodeobj);
		        // }
                /*var chainer = new Sequelize.Utils.QueryChainer();
                _.each(res.handleThisDriveNode, function (parentPermission, index) {
                    // The creator always gets admin perms
                    if (parentPermission.AccountId != req.session.Account.id) {
                        chainer.add(DirectoryPermission.create({
                            type: parentPermission.type,
                            accountId: parentPermission.AccountId,
                            directoryId: res.newDirectory.id
                        }));
                    }
                });
                chainer.run().done(cb);*/
            }]

        }, function (err, results) {

        	console.log('44444444444444444444444444444444444444444444:'+i);
        	// console.log(results.length);
        	console.log(drivenodeobj.length);
    //     	if((i+1) == datalist.length){
				// debug.info(drivenodeobj.length+' file(s) info retrieved.');
				callback(drivenodeobj);
	        // }
        	// callback();
        });

		/*if(typeof datalist[i] != 'undefined'){
			var testin = gapi.client.drive.files.get({
	          'fileId': datalist[i].id
	        });
        	testin.execute(function(drivenode) {

        		self.checkNHandleDrivenode(drivenode,drivenodeobj, datalist.length);
			});
		}
		self.getNextDriveFileRecursive(datalist, drivenodeobj, ++i, callback);*/
	},

	checkNHandleDrivenode: function(drivenode,drivenodeobj,i,checkcallback){
    	if(typeof drivenode.error != 'undefined'){
    		debug.error('DRIVE ERROR ('+drivenode.code+'): '+drivenode.error.message+' : [fileId:'+datalist[i].id+']');
    		console.log('7777777777777777777777777777777777777:'+i);
    		checkcallback();
    	}else{
        	if(drivenode.id){}else{
        		debug.error('some exception for fileId: '+datalist[i].id);
        		console.log('7777777777777777777777777777777777777:'+i);
        		checkcallback();
        		return;
        	}

        	//0 bytes file ignored in olympus
        	if( parseInt(drivenode.fileSize) || 
        		parseInt(drivenode.quotaBytesUsed) || 
        		drivenode.mimeType == 'application/vnd.google-apps.folder' ){

				debug.info('PUSHING'+(drivenode.title || drivenode.originalFilename));

				drivenodeobj.push({
					name: drivenode.title || drivenode.originalFilename,
					fsName: drivenode.id,
					size: drivenode.fileSize || drivenode.quotaBytesUsed,
					type: drivenode.kind,
					mimetype: drivenode.mimeType,
					version: drivenode.version,
					md5checksum: drivenode.md5Checksum,
				});
				console.log('7777777777777777777777777777777777777:'+i);
				checkcallback();
			}else{
				console.log('7777777777777777777777777777777777777:'+i);
				checkcallback();
			}
		}
	},

	retrieveAllFilesInFolder: function(folderId, oauthToken, callback) {

		debug.info('retrieveAllFilesInFolder with authToken: '+oauthToken);
		var self = this;
	  	gapi.client.load('drive', 'v2', function(){
	  	// https://content.googleapis.com/discovery/v1/apis/drive/v2/rest?fields=kind%2Cname%2Cversion%2CrootUrl%2CservicePath%2Cresources%2Cparameters%2Cmethods&pp=0

	  		/*Do not use this when used with maxResults:10 then multiple requests behaves async. thus breaking code
	  		console.log('initialRequestinitialRequestinitialRequestinitialRequest folderId : '+folderId);
		  	var initialRequest = gapi.client.drive.children.list({
		      'folderId' : folderId
		    });
		  	self.retrievePageOfChildren(initialRequest, [], callback);*/

		  	var retrievePageOfChildren = function(request, result) {
		    	request.execute(function(resp) {
			      result = result.concat(resp.items);
			      var nextPageToken = resp.nextPageToken;
			      if (nextPageToken) {
			        request = gapi.client.drive.children.list({
			          'folderId' : folderId,
			          'pageToken': nextPageToken,
			          'maxResults': 1000
			        });
			        retrievePageOfChildren(request, result);
			      } else {
			      	debug.info('drive list records: '+result.length);
			        callback(result);
			      }
			    });
			}
			var initialRequest = gapi.client.drive.children.list({
			    'folderId' : folderId,
			    'maxResults': 1000
			});
			retrievePageOfChildren(initialRequest, []);
		});
	},

	retrievePageOfChildren: function(request, result, callback) {

		debug.info('retrievePageOfChildren');
		var self = this;
	    request.execute(function(resp) {

	      console.log('retrievePageOfChildrenCALLBACK');
	      result = result.concat(resp.items);
	      var nextPageToken = resp.nextPageToken;
	      if (nextPageToken) {
	        newrequest = gapi.client.drive.children.list({
	          'folderId' : request.folderId,
	          'pageToken': nextPageToken,
	          'maxResults': 1000
	        });
	        console.log('requestrequestrequestrequestrequest');
	        console.log(request);
	        self.retrievePageOfChildren(newrequest, result, callback);
	      } else {
	        callback(result);
	      }
	    });
	},

	dafaultView: function(){
		Mast.navigate('#');
	},

/*
	thumbnailView: function(){
		Mast.navigate('thumbnail');
	},*/

	afterRender: function() {
		
		Olympus.ui.fileSystem.on('cd', this.updateButtonState);
// Create new autocomplete for use with the textarea. Do this only if this olympus app
// is not a private deployment.
	},

	afterCreate: function () {
		this.$el.disableSelection();
	},

// Allows super admin to create top level workgroup
	createWorkgroup: function(e) {
		var toplevel = Olympus.ui.fileSystem.pwd;

		// Find and return first model where editing is true, (ie. It will have the editing inode
		// input in its template).
		if (Olympus.ui.fileSystem.get('renaming') === true) {
			var editingInode = toplevel.collection.find(function(model) {
				return model.get('editing') === true;
			});

			if (editingInode) {
				editingInode.set({editing: false});
			}
		}

		Mast.Socket.request('/directory/mkdir', {
			name: 'New Workgroup'
		},

		// Once the folder is created, set it to edit mode so
		// that it can be named.
		function(res) {
			toplevel.collection.where({
				id: res.id
			})[0].set('editing',true);
		});

		e.stopPropagation();
	},

	createFolderAtPwd: function(e) {
		var currentInode = Olympus.ui.fileSystem.pwd;

		// Find and return first model where editing is true, (ie. It will have the editing inode
		// input in its template).
		if (Olympus.ui.fileSystem.get('renaming') === true){
			var editingInode = currentInode.collection.find(function(model){
				return model.get('editing') === true;
			});

			if (editingInode) {
				editingInode.set({editing: false});
			}
		}

		// Set filesystem renaming property to be true.
		// We need this so that we can have only one editing inode template at a time.
		Olympus.ui.fileSystem.set({renaming: true}, {silent: true});

		Mast.Socket.request('/directory/mkdir',{
				parent: {
					id: currentInode.get('id')
				},
				id: currentInode.get('id'),  // For access control purposes
				name: 'New Folder'
			},

			// Once the folder is created, set it to edit mode so
			// that it can be named.
			function(res, other) {

				// Add to collection
				// currentInode.collection.add([res]);//if commented: create duplicate folders when clicking quickly on create folder button

				currentInode.collection.where({
					id: res.id
				})[0].set('editing',true);
			});


		if (currentInode.get('state') !== 'expanded') {
			currentInode.expand(e);
		}

		e.stopPropagation();
	},

// creates a new folder at the present working directory
	createFolderOrWorkgroup: function(e) {
		if (Olympus.ui.fileSystem.pwd._class === 'FileSystem') {
			this.createWorkgroup(e);
		} else {
			this.createFolderAtPwd(e);
		}

	},

// create a file upload dialog component
	createUploadDialog: function(e) {
		if($('.progress-bar:visible').length){
			alert('Please wait for the upload to complete.');
		}else{
			var uploadDialog = new Mast.components.UploadFileDialogComponent();
		}
		e.stopPropagation();
	},

// create a file upload dialog component
	createSyncBoxDialog: function(e) {
		Mast.Socket.request('/sitesettings/getSiteOptions', {}, function (res, err) {

			if(err || res.success == false){
				console.log(err || res.error);
				alert('Box Syncing is disabled rightnow.');
				return;
			}
			if(res.boxSync){
				url = "https://app.box.com/api/oauth2/authorize?response_type=code&client_id="+res.boxClientId+"&state=abc-xyz&redirect_uri="+window.location.protocol+"//"+window.location.host+"/syncbox";
				// var win = window.open(url, '_blank');
				// var win = window.open(url);
				window.location.href = url;
		  		/*if (win) {
				   //Browser has allowed it to be opened
				   win.focus();
				}*/
				// var uploadDialog = new Mast.components.SyncDboxDialogComponent();
			}else{
				alert('Box Syncing is disabled rightnow.');
			}
		});
		 e.stopPropagation();
	},
	// create a file upload dialog component
	createSyncDboxDialog: function(e) {

		Mast.Socket.request('/sitesettings/getSiteOptions', {}, function (res, err) {
			if(err || res.success == false){
				console.log(err || res.error);
				alert('Dropbox Syncing is disabled rightnow.');
				return;
			}
			if(res.dropboxSync){
				// url = "https://www.dropbox.com/1/oauth2/authorize?client_id="+res.dropboxClientId+"&response_type=code&redirect_uri=https://localhost/syncdbox";
				// url = "https://www.dropbox.com/1/oauth2/authorize?client_id="+res.dropboxClientId+"&response_type=code&redirect_uri="+String( window.location ).replace( /#/, "" )+"/syncdbox";
				url = "https://www.dropbox.com/1/oauth2/authorize?client_id="+res.dropboxClientId+"&response_type=code&redirect_uri="+window.location.protocol+"//"+window.location.host+"/syncdbox";
				console.log(url);
		// var win = window.open(url, '_blank');
		// var win = window.open(url);
		window.location.href = url;
  		/*if (win) {
		   //Browser has allowed it to be opened
		   win.focus();
		}*/
		// var uploadDialog = new Mast.components.SyncDboxDialogComponent();
			}else{
				alert('Dropbox Syncing is disabled rightnow.');
			}
		});
		e.stopPropagation();
	},

// When the session data is available
	afterConnect: function() {
		this.updateButtonState();
	},

	// Update the button state
	updateButtonState: function () {

		if (window.location.hash !== '') {
			this.set('uploadFileButton', false);
			this.set('createFolderButton', false);
		} else {

			var pwd 	= Olympus.ui.fileSystem.pwd;
			var state 	= {
				// If no directory is active, the "upload file button" is always disabled if no directory is active
				// If they have *write* or *admin* privileges on pwd(), the button will appear
				uploadFileButton: pwd.canWrite(),

				// If no directory is active, then the current user MUST BE AN ADMIN to see this button
				// If they have *write* or *admin* privileges on pwd(), the button will appear

				// createFolderButton: pwd.canWrite() || _.isUndefined(Olympus.ui.fileSystem.pwd.get('id')) && Mast.Session.Account.isAdmin 
				createFolderButton: pwd.canWrite() 
			};

			this.set(state);
		}
	},

	searchUsers: function(){
		Mast.Session.term = $('input[name="search"]').val();
		Mast.Session.from_page = window.location.hash;
		console.log(Mast.Session.term);
		Mast.navigate('search');
	}

});
