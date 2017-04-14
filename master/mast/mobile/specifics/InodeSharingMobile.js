// inode sharing tree holds the sharing items
Mast.registerTree('InodeSharingMobile', {
	
	template: '.inode-sharing-mobile-template',

	emptyHTML: '<div class="loading-spinner"></div>',

	branchComponent: 'InodeSharingItemMobile',

	branchOutlet: '.inode-sharing-items-region',

	// Inherit model from parent
	beforeCreate: function() {
		this.set(this.parent.model.attributes);
	},

	afterCreate: function() {
		var self = this;

		//  Set the collection to pull from the comments for this model
		this.collection.url = '/'+this.get('type')+'/permissions/'+this.get('id');
		this.collection.fetch({
			success: function(collection) {
				collection.each(function(model) {
					model.marshal();
				});
			}
		});
	},

	collection: {
		model: {
			marshal: function () {
				this.set({
					id: this.get('owned_by').id,
					permission: 
						(this.get('permission')=='read') ? 'view' :
						(this.get('permission')=='comment') ? 'comment' :
						(this.get('permission')=='write') ? 'edit' :
						(this.get('permission')=='admin') ? 'Is admin' :
						'Unknown'
				});
			}
		}

	},

	subscriptions: {
		
		'~COLLAB_ADD_COLLABORATOR': function(event) {

			if (event.source.id === this.get('id') && !this.collection.get(event.source.owned_by.email)) {
				this.collection.add({
					owned_by: {
						name	: event.source.owned_by.name,
						avatar: event.source.owned_by.avatar,
						email: event.source.owned_by.email,
						id: event.source.owned_by.id
					},

					permission: event.source.permission

				});
			}
		},

		'~COLLAB_UPDATE_COLLABORATOR': function(event) {

			if (event.source.id == this.get('id') && this.collection.get(event.source.owned_by.id)) {
				var ownerModel = this.collection.get(event.source.owned_by.id);
				
				var marshaledData = event.source;

				ownerModel.set({
					permission: marshaledData.permission
				});

			}
		},

		'~COLLAB_REMOVE_COLLABORATOR': function(event) {
			if (event.source.id === this.get('id') && this.collection.get(event.source.owned_by.id)) {
				this.collection.remove(event.source.owned_by.id);
			}
		}
	}
});


// inode sharing component
Mast.registerComponent('InodeSharingItemMobile', {

	template: '.inode-sharing-item-mobile-template',

	events: {
		'click .remove-permission-button': 'removeSharedUser'
	},

	// remove the user from the permission collection of this inode
	removeSharedUser: function() {

		// Determine which url(controller) to request (depends on whether this is a directory or a file)
		this.url = ((this.parent.get('type') =='directory') ?
			"/directory" : "/file") + "/removePermission";

		// Ask the server for current viewers
		Mast.Socket.request(this.url,
		{
			// inode id
			id       : this.parent.get('id'),
			// account id
			AccountId: this.get('owned_by').id
		});
	}

});