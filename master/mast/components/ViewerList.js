Mast.registerComponent('ViewerRow',{
	template: '.viewer-template'
});

// current inode viewers list component
Mast.registerTree('ViewerList',{
	
	template       : '.current-viewers-template',
	outlet         : '.viewers-activity-outlet',
	emptyHTML      : '',
	collection     : 'CurrentViewers',
	branchComponent: 'ViewerRow',
	branchOutlet   : '.currently-viewing-outlet',

	subscriptions: {
		'~ACCOUNT_JOIN': function (model) {
			if (model && model.source && model.source.part_of &&
				model.source.part_of.id == this.get('id') &&
				model.source.part_of.type == this.get('type')) {
				this.addCurrentViewer(model.source);
			}
		},
		'~ACCOUNT_LEAVE': function (model) {
			if (model && model.source && model.source.part_of &&
				model.source.part_of.id == this.get('id') &&
				model.source.part_of.type == this.get('type')) {
				this.removeCurrentViewer(model.source);
			}
		}
	},

	// Fetch workgroups on initialization
	init: function () {
		this.collection.load(this.pattern.model.attributes);
	},

	afterCreate: function() {
		this.$el.disableSelection();
	},

	addCurrentViewer: function(viewer) {
		this.collection.add(viewer);
	},

	// Only remove this viewer if she is not the current user
	removeCurrentViewer: function(viewer) {
		if (viewer.id != Mast.Session.Account.id) {								
			this.collection.remove(viewer);
		}
		else { /* The user probably had two windows open */	}
	}
});