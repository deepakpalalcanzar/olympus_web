Mast.register('DirectoryMobile', {


	model: Mast.Model.extend({
		urlRoot: '/directory'
	}),

	// HTML
	template: '.finder-mobile-template',

	// iNode component
	branchComponent: 'InodeMobile',

	// Region to insert the list into
	branchOutlet: '.directory-region',

	// html when there is no inodes
	emptyHTML: '<div class="emptyHTML">This folder is empty.</div>',

	loadingHTML: '<div class="loading-spinner"></div>',
	
	subscriptions: {
		// catching route navigation events on AppMobile
		'#finder'				: 'topLevel',
		'#directory/:id'		: 'cd',

		// listen for a new item added to the 
		'~ITEM_CREATE': function(event) {

			console.log('fired');
			if (event && event.source && event.source.parent &&
				event.source.parent.id === null) {


				var newDir		= event.source;
		
				// If this is on the account who created the directory, just update the id
				// if (this.collection.where({
				// 	id: undefined
				// }).length !== 0) {
				// 	this.collection.where({
				// 		id: undefined
				// 	})[0].set({
				// 		id: newDir.id
				// 	},{
				// 		silent: true
				// 	});
				// }
				
				// Otherwise create the directory so this user can see it
				// else {
					var marshaledData = new Mast.models.INode().marshal(_.extend(newDir,{
						depth: this.get('depth')+1								// add 1 to depth to so setPadding will have work properly
					}));
					this.collection.add(marshaledData);
				// }
				
				// Update myself (parent directory) to take into account the new num_children
				this.set({
					num_children: this.get('num_children')+1
				}, {silent: true});

				Mast.Socket.request('/'+event.source.type+'/subscribe',{
					id: event.source.id
				});

			}
		}
	},
	
	regions: {
		// Sub navigation bar (action bar)
		'.actionbar-region': 'ActionBarMobile'
	},

	// TODO: unsubscribe from this Directory
	beforeClose: function () {},


	beforeCreate: function () {
		// Inherit model from parent
		// this.set(this.parent.model.attributes, {silent: true});
	},

	// iNodes in this directory
	collection: {
		model	: {}
	},

	url: function () {
		return '/directory/ls/'+ this.get('id');
	},

	// Update collection with this dir's items
	cd: function (id) {
		this.set({id:id},{silent:true});
		this.collection.url = this.url();
		this.fetchCollection();

	},

	// Update collection with top level items
	topLevel: function () {
		this.collection.url = "/inode/topLevel";
		var self = this;
		this.fetchCollection();
	}
});