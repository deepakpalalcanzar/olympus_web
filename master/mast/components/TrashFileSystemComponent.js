Mast.registerTree('TrashFileSystem',{

	extendsFrom: 'UITableComponent',

	model: {
		depth	: -1,
		column1: {
			name     : 'Files',
			className: 'file-column'
		},
		column2: {
			name     : 'Last Modified',
			className: 'modified'
		},
		column3: {
			name     : 'Information',
			className: 'information'
		},

		focus        : true,
		selectedInode: null,
		renaming     : false,
		loading      : true
	},

	events: {
		'click .empty-trash-link'    : 'emptyTrash'
	},
	
	currentHighlightedBranch: null,

	bindings: {

		focus: function(newVal) {
			if (newVal) {
				this.$el.removeClass('focus');
			} else {
				this.$el.addClass('focus');
			}
		},

		loading: function(newVal) {
			if (newVal) {
				$('.trashSystem-template .loading-spinner').show();
			} else {
				$('.trashSystem-template .loading-spinner').hide();
			}
		}

	},
	
	computePath	: function() {return '/';},

	emptyHTML		: '<div class="loading-spinner"></div>',
	template		: '.trashSystem-template',
	collection		: 'Trash',
	branchComponent	: 'TrashFileComponent',
	branchOutlet	: '#trashSystem-outlet',

	afterRender: function(e) {

		var self = this;
		console.log('updateButtonState55');
		Olympus.ui.actionBar.updateButtonState();

		/* For number shared*/
		Mast.Socket.request('/tempaccount/sharedDirectory', null, function(res, err){
			$.each(res, function( i, val ) {
				Mast.Socket.request('/tempaccount/numSharedDirectory', { dirId: val.DirectoryId}, function(res, err){
					
					$('.trashSystem-template .loading-spinner').hide();

					$('.num-shared-'+val.DirectoryId).html(res[0].num_shared);
				});
			});
		});
		/* For number shared*/
	},

	// Fetch workgroups on initialization
	init: function () {

		var self = this;
		this.pwd = this;
		self.set('loading', true);
		this.collection.fetch({
			success: function (collection, res) {
				self.set('loading', false);
				// $('.fileSystem-template .loading-spinner').remove();
				collection.reset(_.map(res, Mast.models.INode.prototype.marshal));
			}
		});
		$('.searchbar').hide();
	},

	afterCreate: function () {
		
	},
	
	// No one can write in the filesystem as a whole
	// (except global admins, but the UI checks that status elsewhere)
	canWrite: function () {
		return false;
	},

	// Change the pwd
	cd: function (newPwd) {
		// TODO: update breadcrumb
		
		// If null pwd specified, change pwd to root
		if (newPwd === null) {
			this.pwd = Olympus.ui.fileSystem;
		}
		else {
			// Change present working directory
			this.pwd = newPwd;
		}
		
		// Trigger cd event on permission-sensitive buttons
		Olympus.ui.fileSystem.trigger('cd');
	},

	emptyTrash: function () {
		if(confirm('Delete all items permanently from trash ?')){
			var self = this;
	        // var id = this.get('id');
	        // var type =this.get('type');
			Mast.Socket.request('/trash/emptyTrash',{
				// id 	 :  id,
				// type : type,
			}, function(response){
				if (response===403) {
					alert('Permission denied. You do not have sufficient permissions to delete this item.');
				} else {

					$("#content").empty();
					var trash = new Mast.components.TrashFileSystem({ outlet : '#content'});
					console.log('callback called');
				}
			});
		}else{
			return false;
		}
	},

	subscriptions: {

		'~COLLAB_ADD_COLLABORATOR': function(event) {
			console.log("FS COLLAB_ADD_COLLABORATOR: "+event.source.id);
			// If we're added to a workgroup or an orphaned iNode, show it in the file system
			if (event.source.owned_by.id == Mast.Session.Account.id && (event.source.orphan === true || event.source.parent.id === null) && !this.collection.get(event.source.id)) {
				event.source.type = event.source.nodeType;
				var marshaledData = new Mast.models.INode().marshal(event.source);
				this.collection.add(marshaledData);
				Mast.Socket.request('/'+event.source.type+'/subscribe',{
					id: event.source.id
				});
			}
		},

		'~COLLAB_REMOVE_COLLABORATOR': function(event) {
			if (event.source.owned_by.id == Mast.Session.Account.id && this.collection.get(event.source.id) !== null) {
				this.collection.remove(event.source.id);
			}
		},


		'~ITEM_ORPHANED': function(event) {
			// console.log("ITEM_ORPHANED: "+event.source.id);
			if (!this.collection.get(event.source.id)) {
				var marshaledData = new Mast.models.INode().marshal(event.source);
				this.collection.add(marshaledData);
				Mast.Socket.request('/'+event.source.type+'/subscribe',{
					id: event.source.id
				});
			}
		},

		'~ITEM_DEORPHANED': function(event) {
			// console.log("ITEM_DEORPHANED: "+event.source.id);
			if (this.collection.get(event.source.id)) {
				this.collection.remove(event.source.id);
			}
		},

		'~ITEM_CREATE': function(event) {
			if (event && event.source && event.source.parent &&
				event.source.parent.id === null) {

				// console.log(event.source.parent.id ,"+++++ ITEM_CREATE ");

				var newDir		= event.source;
		
				if (event.source.created_by.id == Mast.Session.Account.id) {
					event.source.permission = "admin";
				}

				// If this is on the account who created the directory, just update the id
				if (this.collection.where({
					id: undefined
				}).length !== 0) {
					this.collection.where({
						id: undefined
					})[0].set({
						id: newDir.id
					},{
						silent: true
					});
				}
				
				// Otherwise create the directory so this user can see it
				else {
					var marshaledData = new Mast.models.INode().marshal(_.extend(newDir,{
						depth: this.get('depth')+1								// add 1 to depth to so setPadding will have work properly
					}));
					this.collection.add(marshaledData);
				}
				
				// Update myself (parent directory) to take into account the new num_children
				this.set({
					num_children: this.get('num_children')+1
				}, {silent: true});

				Mast.Socket.request('/'+event.source.type+'/subscribe',{
					id: event.source.id
				});

			}
		}
	}
});
