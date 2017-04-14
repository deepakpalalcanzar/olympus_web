Mast.registerComponent('ThumbnailComponent', {
	
	outlet: '#content',

	events: {
		'dblclick'              : 'download',
		'click'                 : 'select',
		'clickoutside'          : 'deselect',
		'mouseenter >.inode-row': 'displayActionButtons',
		'mouseleave >.inode-row': 'hideActionButtons',
		'click .dropdown-button': 'showDropdownAtArrow',
		'contextmenu'           : 'showDropdownAtMousePosition',
		'click .sidebar-button' : 'displaySidebar',
		'pressEnter'            : 'rename',
		'pressEscape'           : 'cancel',
		'click .num-comments'   : 'displayCommentSidebar',
		'click .shared_peop'   	: 'displaySharingSidebar',
	},

	model       : 'INode',
	emptyHTML   : '',
	branchOutlet: '.branchOutlet',
	template    : '.thumbnail-template',
	collection  : 'DirectoryMembers',
	active      : false,

	beforeClose: function() {
		if (this == Olympus.ui.fileSystem.pwd){
			Olympus.ui.fileSystem.cd(null);
		}
	},
	
    init: function() {

        var self = this;
		/*Mast.on('UPLOAD_PROGRESS', function(data) {
	        if (data.files[0].name == self.model.get('name') && self.model.get('parent') && self.model.get('parent').id == data.parentId) {
	            self.$('.information-stats').hide();
	            self.$('.progress-bar').show();
	            progress = Math.round((data.loaded/data.total*100)) + '%';
	            self.$('.bar').css('width', progress);
	            self.$('.progress .number').html(progress);
	        }
		});

        Mast.on('NEW_UPLOADING_CHILD', function(data) {
            if (data.id == self.model.id) {
                data.files[0].modified_by = {};
                data.files[0].uploading = true;
                // Make a fresh copy of the file data (because some of the properties of the file object, like 'type',
                // cannot be changed) and extend it
				var marshaledData = new Mast.models.INode().marshal(_.extend({},data.files[0], {
					depth: self.get('depth')+1,
					parent: _.extend({}, self.model, {model:self.model}) // Hack to get public link visibility working...
				}));
				// Set up the mimeClass and type attributes that the template uses to show the correct icon in the UI
				marshaledData.mimeClass = marshaledData.type.replace('/','-');
				marshaledData.type = "file";

				self.afterRender();

				// add new marshaled inode to this inodes collecton
				data.files[0].inodeModel = new self.collection.model(marshaledData);
				self.collection.add(data.files[0].inodeModel);
				// Update myself (parent directory) to take into account the new num_children
				self.set({
				    num_children: self.get('num_children')+1
				});
			}
        });
		Mast.on('CANCEL_UPLOAD', function(data) {
			// Remove the component for the uploading file from the collection
			if (data.id == self.model.id && self.model.get('type') == 'directory') { 
				self.collection.remove(data.files[0].inodeModel);
				self.set({
				    num_children: self.get('num_children')-1
				});
				self.afterRender();
			}

		});*/

    },

	bindings: {

		name       : '.inode-name',
		numActive  : '.num-users',
		numComments: '.num-comments',
		modifiedAt : '.modified-date',
		sizeString : '.file-size',

		num_children: function(newVal) {
			if (newVal === 0) {
				this.$el.removeClass('expanded');
				this.$el.closest_descendant('div.expand-close-arrow').removeClass('expanded').addClass('empty');
				this.$el.closest_descendant('div.directory-img').addClass('empty');
				this.collapse();
			} else {
				this.$el.closest_descendant('div.expand-close-arrow').removeClass('empty');
				this.$el.closest_descendant('div.directory-img').removeClass('empty');
			}
		},
		selected: function(newVal) {
			if (newVal) {
				this.$el.addClass('selected');
			} else {
				this.$el.removeClass('selected');
			}
		},

	    uploading: function(newVal) {
            if (newVal) {
                this.$el.addClass('uploading');
                this.$('.information-stats').hide();
                this.$('.progress').show();
            } else {
                this.$el.removeClass('uploading');
                this.$('.information-stats').show();
                this.$('.progress').hide();
                this.$('.num-users').html(this.model.get('num_active') || 0); 
                this.$('.num-comments').html(this.model.get('num_comments') || 0); 
            }
        },	
        
		// Expanded or collapsed
		state: function (newVal) {
			var arrow = this.$el.closest_descendant('div.expand-close-arrow');

			// Handle basic rendering use case
			this.$el.removeClass('loading expanded');
			
			// Do animation for arrow rotation
			if (newVal !== "") {
				this.$el.addClass(newVal);
				if (newVal=="expanded" || newVal=="loading") {
					arrow.addClass("expanded");
				}
			}
			else {
				arrow.removeClass('expanded');

				// Close (and deselect) all children
				this.collection.reset();
			}
		},

		depth: function(newVal) {

		},

		editing: function(newVal) {
			if (newVal) {
				this.$el.closest_descendant('input.inode-name-input').show();
				this.$el.closest_descendant('span.inode-name').hide();
			} else {
				this.$el.closest_descendant('input.inode-name-input').hide();
				this.$el.closest_descendant('span.inode-name').show();
			}
		},
	},
	
	subscriptions: {

		'~COMMENT_CREATE': function (comment) {
			if (comment && comment.source && comment.source.item &&
				comment.source.item.id == this.get('id') &&
				comment.source.item.type == this.get('type')) {
				this.set({
					numComments : comment.source.num_comments
				});
			}
		},
		
		'~ACCOUNT_JOIN': function (model) {
			if (model && model.source && model.source.part_of &&
				model.source.part_of.id == this.get('id') &&
				model.source.part_of.type == this.get('type')) {
				this.set({
					numActive		: model.source.num_active
				});
			}
		},
		
		'~ACCOUNT_LEAVE': function (model) {
			if (model && model.source && model.source.part_of &&
				model.source.part_of.id == this.get('id') &&
				model.source.part_of.type == this.get('type')) {
				this.set({
					numActive		: model.source.num_active
				});
			}
		},
		
		'~ITEM_CREATE': function(event) {

			console.log("ITEM_CREATE");
			// console.log(event);

			if (event && event.source && event.source.parent && event.source.parent.id && 
				event.source.parent.id == this.get('id')) {

				// console.log(event.source.parent.id ,"+++++ ITEM_CREATE ");
				var newDir = event.source;
				// console.log('new dir', newDir);
				// alert(newDir.name);
				
				// var removeFile = newDir.name.replace(/ *\([^)]*\) */g, '');
				// alert(removeFile);
				// if($('span:contains("'+removeFile+'")').length > '1') {
//$('span:contains("'+removeFile+'")').parents().eq(3)
					// $('.branchOutlet').first().css('background-color', 'blue');
				// }

				// If this is on the account who created the directory, just update the id
				if (this.collection.where({id: undefined}).length !== 0) {

					this.collection.where({id: undefined})[0].set({
						id: newDir.id,
            			uploading: false,
            			name: newDir.name
					},
					{
						silent: false
					});

				}
				
				// Otherwise create the directory so this user can see it
				else {
					// creating the new inode and marshaling the data. We then want to 
					// add 1 to depth to so setPadding will have work properly
					var marshaledData = new Mast.models.INode().marshal(_.extend(newDir, {
						depth: this.get('depth')+1,
						parent: _.extend({}, this.model, {model:this.model}) // Hack to get public link visibility working...
					}));

					if (event.source.created_by.id == Mast.Session.Account.id) {
						marshaledData.permission = "admin";
					}

					this.afterRender();

					// add new marshaled inode to this inodes collecton
					this.collection.add(marshaledData);
                    this.collection.get(newDir.id).set('uploading', false);

				}
				
				// Update myself (parent directory) to take into account the new num_children
				this.set({
					num_children: this.get('num_children')+1
				});
				

				Mast.Socket.request('/'+event.source.type+'/subscribe',{
					id: event.source.id
				});

				// this.collection.reset();
				this.collection.fetchMembers(this,function(){
				});
			}
		},

		'~PUBLIC_LINK_ENABLE': function(event) {
			if (event.source.id == this.model.id) {
				this.model.set({public_link_enabled: event.source.enable},{silent: true});
			}
		},

		'~PUBLIC_SUBLINKS_ENABLE': function(event) {
			if (event.source.id == this.model.id) {
				this.model.set({public_sublinks_enabled: event.source.enable},{silent: true});
			}
			Olympus.ui.detailsSidebar.updatePublicLinkOptions();
		},

		'~COLLAB_ADD_COLLABORATOR': function(event) {
			console.log("GOT SHARED_INODE_ADDED");
			event.source.type = event.source.nodeType;
			this.subscriptions['~ITEM_CREATE'].apply(this,[event]);
		},

		'~COLLAB_UPDATE_COLLABORATOR': function(event) {
			// console.log("UPDATE_COLLABORATOR",event);
			if (event.source.id == this.model.id && event.source.owned_by.id == Mast.Session.Account.id) {
				this.set({
					permission: event.source.permission
				},{silent:true});
				console.log("set inode permission",event.source.permission);
			}
			if (event.source.id == Olympus.ui.fileSystem.pwd.get('id')) {
				console.log("Update button state!", event.source.id, Olympus.ui.fileSystem.pwd.get('id'));
				console.log('updateButtonState66');
				Olympus.ui.actionBar.updateButtonState();
			}
		},

		'~COLLAB_REMOVE_COLLABORATOR': function(event) {
			if (event.source.id == this.model.id && event.source.owned_by.id == Mast.Session.Account.id) {
				this.parent.collection.remove(this.get('id'));
			}
		},

		'~ITEM_RENAME': function(event) {
			if(event && event.source && event.source.id == this.get('id')){
				this.set({
					name: event.source.name,
					editing: false
				});
			}
		},

		'~ITEM_RESIZE': function(event) {
			if(event && event.source && event.source.id == this.get('id')){
				this.set({
					size: event.source.size,
					sizeString: event.source.sizeString,
				});
			}
		},

		'~ITEM_MOVE': function(event) {
			
			// Only directories need to listen to these events
			if (this.get('type') != 'directory') {
				return;
			}

			var sourceModel = event.source.model;
			var sourceDirectoryId = event.source.sourceDirectoryId;
			var destDirectoryId = event.source.directoryId;
			var source_dir_num_children = event.source.source_dir_num_children;
			var dest_dir_num_children = event.source.dest_dir_num_children;

			// If we are the destination directory for the moved node, then create a new Mast model
			// for the node, add it to our collection, and update our "num_children"
			if (destDirectoryId == this.get('id')) {
				var marshaledData = new Mast.models.INode().marshal(_.extend(sourceModel,{
					depth: this.get('depth')+1
				}));
				this.collection.add(marshaledData);
				this.model.set('num_children',dest_dir_num_children);
			}

			// If we are the source directory for the moved node, remove the node's model from our
			// collection, and update our "num_children" property
			if (sourceDirectoryId == this.get('id')) {
				this.collection.remove(this.collection.get(sourceModel.id));
				this.model.set('num_children',source_dir_num_children);
			}
		},

		'~ITEM_TRASH': function(event) {
			if (event && event.source && event.source.id == this.get('id')) {
				this.close();
			}
		},

        /*'~UPLOAD_PROGRESS': function(event) {
            if (event.source.filename == this.model.get('name') && this.model.get('parent') && this.model.get('parent').id == event.source.id && this.$('.progress-bar').is(':visible')) {
                progress = event.source.percent + '%';
                this.$('.bar').css('width', progress);
                this.$('.progress .number').html(progress);
            }
        }*/


	},

	beforeCreate: function () {
		// TODO: only show options for which this user has permission
		if (this.get('type') === 'file') {
			var d= this.get('dropdownItems');
			d.unshift({method : 'versioning',name   : 'Manage Version'});
			d.unshift({method : 'update', name   : 'Update'});
			d.unshift({method : 'download', name   : 'Download'});
			d.unshift({method : 'open',name   : 'Open'});
			d.splice('7', '1');
		}
	},

	naiveRender: false,
	
	// After rendering, disable text selection
	// and allow the user to set a new directory name
	afterRender: function() {

		var self = this;
		// this.$el.disableSelection();
        /*if (this.model.get('uploading')) {
            this.$el.addClass('uploading');
            this.$('.information-stats').hide();
            this.$('.progress-bar').show();
            this.$('.bar').css('width', 0);
            this.$('.progress .number').html('0%');
        }*/
		this.setPadding(this.get('depth'));
		
		// Make the inode draggable
		if (this.model.get('parent') && this.model.get('parent').id != null) {
			this.$el.draggable({
				delay: 300,
				start: function() {
					Olympus.ui.fileSystem.set('dragging',self, {
						silent: true
					});
				},
				helper:this.inodeDraggableHelperTemplate,
				cursorAt: {
					top: 3,
					left: -5
				}
			});
		}
		
		// If it's a directory, make it droppable as well and give it the proper dropdown
		if (this.model.get('type')=='directory') {
			this.$el.droppable({
				drop:this.onInodeDrop,
				greedy:true,
				hoverClass:'inode-drop'
			});

			// this.set('dropdownItems', _.rest(self.model.inodeDropdownOptions, 2));
		}
		this.resizeLabel();
		$(window).on('resize', this.resizeLabel);
		this.$el.disableSelection();
	},

	// When an iNode is dropped over something droppable, alert the world so that we can perform a
	// file move operation.
	onInodeDrop: function(event, ui) {

		// Stop propagation so that the drop event doesn't get sent up to parent directories
		event.stopPropagation();
		event.stopImmediatePropagation();

		// Get info about the dropped inode's type and id
		var helperId = ui.helper.attr('id');
		var idParts = helperId.split('-');
		var inodeType = idParts[0];
		var inodeId = idParts[1];
		
		var draggedInode = Olympus.ui.fileSystem.get('dragging');
		
		// If we're dropping onto the existing parent, forget it.
		if (draggedInode.parent == this) {
			return;
		}

		/* TODO */
		/* We really shouldn't have to send up the "num_children" values for the
		 * source item, its directory or the destination directory.  These should
		 * be calculated on the server.
		 */
		Mast.Socket.request('/'+inodeType+'/mv', {
			source_num_children: draggedInode.model.get('num_children'),
			source_dir_num_children: draggedInode.parent.model.get('num_children'),
			dest_dir_num_children: this.model.get('num_children'),
			id: inodeId,
			directoryId: this.get('id')
		}, function(response){
			if (response==403) {
				alert('Permission denied.  You do not have sufficient permissions to perform this action.');
			}
		});


		Olympus.ui.fileSystem.set('dragging',null, {
			silent:true
		});
	},

	

	// Create a DOM element to use as a proxy for the inode we want to drag, so that we don't visually
	// drag the whole row and leave a big gap.
	inodeDraggableHelperTemplate: function() {

		// Clone the template
		var el = $('#inode-drag-helper-template').clone();

		// Add an id to the element indicating the type and ID of the inode being dragged.
		el.attr('id',this.model.get('type')+'-'+this.model.get('id')+'-drag-helper');

		// Add the appropriate icon depending on inode type
		el.find('.icon').addClass(this.model.get('type')+"-img");
		el.find('.icon').addClass(this.model.get('mimeClass'));

		// Add the class that tells the world that a drag is happening; we can't have this in the template
		// because then searching for the class would always come back "true" and the app would always
		// think a drag action was occuring
		el.addClass("activeInodeDrag");

		// Add the file / dir name
		el.find('.inode-name').html(this.model.get('name'));
		return el;
	},
	
	// Update the padding of this node
	setPadding: function(depth) {
		this.$el.closest_descendant('.leftside .pushover').css('padding-left', (40 * depth) + 'px');
	},
	
	// Compute string path for this component
	computePath: function () {
		function computePathRecursive(currentNode) {
			return !(currentNode && currentNode.get('name')) ? '' :
			computePathRecursive(currentNode.parent) +
			'/' + currentNode.get('name');
		}
		return computePathRecursive(this);
	},
	
	// Select this iNode, join the conversation, and open the sidebar
	select: function(e) {
		e.stopPropagation();
		e.stopImmediatePropagation();

		// If there is a dropdown, close it
		if (Olympus.ui.dropdown){
			Olympus.ui.dropdown.hide();
		}

		if (Olympus.ui.detailsSidebar.get('visible')){
			Olympus.ui.detailsSidebar.focus(this);
		}

		// If the inode is already selected, return out
		if (this.get('selected')) return;

		// First deselect currently selected inode if it is actually an Inode
		// This will not call deselect if the pwd refers to the fileSystem (pwd is at the root)
		Olympus.ui.fileSystem.get('selectedInode') &&
			Olympus.ui.fileSystem.get('selectedInode').deselect();

		// Set the selected inode for the filesystem and set this inode's state to selected
		Olympus.ui.fileSystem.set({selectedInode: this}, {silent: true});
		this.set({selected: true});

		this.join();

		// If inode is a file then set the pwd to the parent directory,
		// otherwise change it to that selected directory inode
		if (this.get('type') === 'file') {
			Olympus.ui.fileSystem.cd(this.parent);
		} else {
			Olympus.ui.fileSystem.cd(this);
		}
	},
	
	// Deselect this iNode and leave the conversation
	deselect: function () {

		Olympus.ui.fileSystem.cd(Olympus.ui.fileSystem);
		if (!this.get('selected')) return;
		this.set('selected',false,{
			render: function($old,$new) {
				$old.removeClass('selected');
			}
		});
		
		this.leave();
		
	},
	
	// Mark current user's account as active in this directory
	join: function (){
		if (!this.currentUserJoined) {
			this.currentUserJoined = true;
			Mast.Socket.request('/'+this.get('type')+'/join',{
				id: this.get('id')
			});
		}
	},
	
	// Mark current user's account as inactive in this directory
	leave: function (){
		if (this.currentUserJoined) {
			this.currentUserJoined = false;
			Mast.Socket.request('/' + this.get('type') + '/leave',{
				id: this.get('id')
			});
		}
	},

	// Display the sidebar for this inode and add class to change the expand arrow to the
	// collapsed arrow.
	displaySidebar: function(e) {

		e.stopPropagation();
		this.select(e);
		// var sidebarInode = Olympus.ui.detailsSidebar.iNode;
		Olympus.ui.detailsSidebar.focus(this);
	},

	// Close the sidebar for this inode and add class to change the collapse arrow to the
	// expand arrow.
	closeSidebar: function() {

		Olympus.ui.detailsSidebar.dismiss();
		Olympus.ui.detailsSidebar.set('shown', false);
	},

	// shows the dropdown menu for inode button
	showDropdownAtArrow: function(e) {

		this.select(e);
		Olympus.util.dropdownHelper.showDropdownAt(this.$(".dropdown-button"),-126,24,e,this,this.get('dropdownItems'));
	},
	
	showDropdownAtMousePosition: function(e) {
		this.select(e);
		Olympus.util.dropdownHelper.showDropdownAtMousePosition(e,this,this.get('dropdownItems'));
	},

	// display both action buttons for this inode
	displayActionButtons: function(e) {
		e.preventDefault();
		e.stopPropagation();
		
		// Check if there's an inode being dragged, by checking if a draggable helper element is in the DOM.
		// If we're doing a drag n' drop, we don't want the action buttons to appear for the row.
		//
		// Better: abstract this into a method.
		if ($('.activeInodeDrag').length > 0) {

			// Files aren't droppable, so add a class that prevents them from being highlighted at all.
			if (this.model.get('type')=='file') {
				this.$el.addClass('inode-inactive-on-drag');
			}

			Olympus.ui.fileSystem.currentHighlightedBranch = this;
			return;
		}

		this.$el.closest_descendant('.dropdown-button').show();
		this.$el.closest_descendant('.sidebar-button').show();
	},
	
	// hide both action buttons for this inode
	hideActionButtons: function(e) {

		// Make sure the directory is no longer set to "active" for drag n' drop purposes.
		this.active = false;
		this.$el.removeClass('inode-inactive-on-drag');
		this.$el.closest_descendant('.dropdown-button').hide();
		this.$el.closest_descendant('.sidebar-button').hide();
		e.preventDefault();
		e.stopPropagation();
	},

	// Change the name based on the user's input
	rename: function(e) {

		// highlight the text in the input. We need to do this because with naive render off, the input
		// that was already created has already been edited so it is no longer auto focused
		this.$el.closest_descendant('input.inode-name-input').select();

		// ??
		Olympus.ui.fileSystem.set({
			renaming: false
		}, {silent: true});

		// TODO: show loading spinner

		// Get new name
		var inodeName = this.$el.closest_descendant('input.inode-name-input').val();
		
		// If the user doesn't enter anything, cancel
		var self = this;
		if (inodeName === '') {
			this.set('editing', false);
			return;
		} 

		// only change inode model directory name if user enters one
		else {
			
			var type =	this.get('type');
		    var typeid = this.get('id')
			
			Mast.Socket.request('/'+type+'/rename',{
				id: typeid,
				name: inodeName
			}, function(response){
				if (response === 403) {
					self.cancel();
					alert('Permission denied. You do not have sufficient permissions to rename this item.');
				}
			});
		}
	},
	
	// Return whether the currently logged-in user has write permissions on this inode
	canWrite: function() {

		// If the permission property isn't set, it means the node was added via an ITEM_CREATE broadcast,
		// which doesn't have specific perms information in it since it goes out to everyone who subscribes
		// to the parent folder.  But, since new nodes inherit the perms of their parents, we can in this
		// case return the parent perms.
		function getRecursivePerms(node) {

			var perm;
			if(!_.isUndefined(node.get('permission'))) {
				perm = node.get('permission');
				return perm == 'write' || perm == 'admin';
			}

			if(node.parent) {
				if(!_.isUndefined(node.parent.get('permission'))) {
					perm = node.parent.get('permission');
					return perm == 'write' || perm == 'admin';
				}
				return getRecursivePerms(node.parent);
			}

			// Top level or orphan node
			if(!node.parent) {
				return false;
			}
		}

		// Recursively check parent directories to see if we can find one that has permissions
		return getRecursivePerms(this);
	},

	appendBranch: function (model, options, silent) {

		// If this is the first branch, empty to remove the emptyHTML element
		if (this.collection && this.collection.length == 1) {
			this.$branchOutlet.empty();
		}

		// Generate component
		var compo = model.get('type') === 'file' ? Mast.components.FileComponent : Mast.components.DirectoryComponent;
		var r = new compo({
			parent: this,
			autoRender: false,
			model: model,
			outlet: this.$branchOutlet
		});

		// Add at a position
		if (options && !_.isUndefined(options.at)) {
			r.insert(options.at);
			// Push or splice branch component to stack for garbage collection
			this._branchStack.splice(options.at,0,r);
		}
		// or append to the end
		else {
			r.append();
			// Push or splice branch component to stack for garbage collection
			this._branchStack.push(r);
		}

		!silent && this.trigger('afterRender');
	},

	// Download a file
	download	: function(e) {

		/*var url = "/file/download/"+this.get('id');
		var iframe;
		iframe = document.getElementById("hiddenDownloader");
		if (iframe === null)
		{
			iframe = document.createElement('iframe');
			iframe.id = "hiddenDownloader";
			iframe.style.visibility = 'hidden';
			document.body.appendChild(iframe);
		}
		iframe.src = url;
		
		e.stopPropagation();*/

                var curid = this.get('id');

        	// $.get("https://ipinfo.io", function(response) {
            	//var ipadd =response.ip;
				var url = "/file/download/"+curid;
		        var iframe;
		        iframe = document.getElementById("hiddenDownloader");
		        if (iframe === null)
		         {
				iframe = document.createElement('iframe');
				iframe.id = "hiddenDownloader";
				iframe.style.visibility = 'hidden';
				document.body.appendChild(iframe);
		      }
		      iframe.src = url;
                     e.stopPropagation();
                   //}, "jsonp");              

	},

	open : function(e) {

		console.log(this.get('id'));
		var url = "/file/open/"+this.get('id')+"/"+this.get('name');
		// Open this url in a new tab. Older browsers fall back to opening a new window.
		//alert(url);
		window.open(url, '_blank');
		window.focus();
	},

	versioning : function(e) {
		this.select(e);
		Olympus.ui.detailsSidebar.focus(this);
		Olympus.ui.detailsSidebar.changeToVersionTemplate(e);
	},
	
	dropdownRename: function(e) {
		e.stopPropagation();
		this.set({
			editing: true
		});
		this.$el.closest_descendant('input.inode-name-input').focus();
	},

	update: function() {
		var updateDialog = new Mast.components.UpdateFileComponent({},{
			id: this.get('id')
		});
	},

	cancel: function() {
		this.set({
			editing: false
		});
	},

	'delete': function() {
		var self = this;
		/*Mast.Socket.request('/'+this.get('type')+'/delete',{
			id: this.get('id')
		}, function(response){
			if (response===403) {
				alert('Permission denied. You do not have sufficient permissions to delete this item.');
			} else {
				self.parent.collection.fetchMembers(self.parent,function(){
				});
			}
		});*/

             var id = this.get('id');
             var type =this.get('type');
         
         // $.get("https://ipinfo.io", function(response) {
           // var ipadd = response.ip ;
		Mast.Socket.request('/'+type+'/delete',{
			id:  id
			//ipadd : ipadd,
		}, function(response){
			if (response===403) {
				alert('Permission denied. You do not have sufficient permissions to delete this item.');
			} else {
				self.parent.collection.fetchMembers(self.parent,function(){
				});
			}
		});

		//}, "jsonp");

	},

	comment: function(e) {
		this.select(e);
		Olympus.ui.detailsSidebar.focus(this);
		Olympus.ui.detailsSidebar.changeToActivityTemplate(e);
	},
	
	share: function(e) {
		this.select(e);
		Olympus.ui.detailsSidebar.focus(this);
		Olympus.ui.detailsSidebar.changeToSharingTemplate(e);
	},

	setVersion: function(e) {
		this.select(e);
		Olympus.ui.detailsSidebar.focus(this);
		Olympus.ui.detailsSidebar.changeToVersionTemplate(e);
	},

	// Resize INode label width
	resizeLabel: function (newVal) {
		var el = this.$el.closest_descendant('.inode-info-container'),	// grab the info-node-container
			margin = 20;												// each div in the inode has a right margin of 20
			maxWidth = el.outerWidth() - margin;						// maximum allowed width of an inode label (span.inode-name)
		$(el).children('div').each(function () {
			maxWidth = maxWidth - $(this).outerWidth() - margin;		// Remove the widths of each div + their margin
		});
		$('.inode-name', this.$el).css('width', maxWidth + 'px');		// Set the width to our newly calculated value.
	},

	displayCommentSidebar: function(e) {
		e.stopPropagation();
		this.select(e);
		// var sidebarInode = Olympus.ui.detailsSidebar.iNode;
		Olympus.ui.detailsSidebar.focus(this);
		Olympus.ui.detailsSidebar.changeToActivityTemplate(e);
	},

	displaySharingSidebar: function(e) {
		e.stopPropagation();
		this.select(e);
		// var sidebarInode = Olympus.ui.detailsSidebar.iNode;
		Olympus.ui.detailsSidebar.focus(this);
		Olympus.ui.detailsSidebar.changeToSharingTemplate(e);
	},

});

