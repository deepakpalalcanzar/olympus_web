//Mast.components.FileSystem = Mast.ui.Table.extend({
Mast.registerTree('SuperAdmin',{

	extendsFrom: 'UITableComponent',
	currentHighlightedBranch: null,

	bindings: {

		focus: function(newVal) {
			if (newVal) {
				this.$el.removeClass('focus');
			} else {
				this.$el.addClass('focus');
			}
		},
	},
	
	computePath	: function() {return '/';},

	emptyHTML	: '',
	template	: '.superadmin-template',
	branchOutlet	: '#superadmin-outlet',

	// Fetch workgroups on initialization
	init: function () {

		var self = this;
		this.pwd = this;

		$('.searchbar').hide();
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
			console.log("ITEM_ORPHANED: "+event.source.id);
			if (!this.collection.get(event.source.id)) {
				var marshaledData = new Mast.models.INode().marshal(event.source);
				this.collection.add(marshaledData);
				Mast.Socket.request('/'+event.source.type+'/subscribe',{
					id: event.source.id
				});
			}
		},

		'~ITEM_DEORPHANED': function(event) {
			console.log("ITEM_DEORPHANED: "+event.source.id);
			if (this.collection.get(event.source.id)) {
				this.collection.remove(event.source.id);
			}
		},

		'~ITEM_CREATE': function(event) {
			if (event && event.source && event.source.parent &&
				event.source.parent.id === null) {

				console.log(event.source.parent.id ,"+++++ ITEM_CREATE ");

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