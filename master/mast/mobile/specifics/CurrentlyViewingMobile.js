// currently viewing tree
Mast.registerTree('CurrentlyViewingMobile', {

	template: '.currently-viewing-mobile-template',

	branchComponent: 'CurrentlyViewingItemMobile',

	branchOutlet: '.currently-viewing-items-region',

	// emptyHTML: 'no activity at this time',
	emptyHTML: '<div>There are no items available.</div>',

	loadingHTML: '<div class="loading-spinner"></div>',

	// Used for development ( testing horizontal scrolling )
	// collection: [{},{},{},{},{},{},{},{},{},{},{}],

	collection: {
		model: {}
	},

	beforeCreate: function() {
		// Inherit model from parent
		this.set(this.parent.model.attributes, {silent: true});

		// Set url to point at the current viewers for this model
		this.collection.url = '/'+this.get('type')+'/swarm/'+this.parent.get('id');
	},


	afterCreate: function () {
		// Get current viewers
		this.fetchCollection();
	}

});


// currently viewing item component
Mast.registerComponent('CurrentlyViewingItemMobile', {

	template: '.currently-viewing-item-mobile-template'

});