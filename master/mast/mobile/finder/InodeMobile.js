Mast.registerComponent('InodeMobile', {

	template: '.inode-mobile-template',

	subscriptions: {

		// listen for an item rename.
		'~ITEM_RENAME': function(event) {
			if(event && event.source && event.source.id == this.get('id')){
				this.set({
					name: event.source.name
				});
			}
		}
	},

	events: {
		'touch'                      : 'navigate',
		'touch .inode-details-button': 'details'
	},

	beforeCreate: function() {
		this.marshalInodeData();
	},

	// Enhance touch interface
	afterCreate: function() {
		// TODO: replace this with a custom DOM event, "touch"
		OlympusHelper.touchEnhance(this.$el);
		OlympusHelper.touchEnhance(this.$('.inode-details-button'));
	},

	navigate: function(e) {
		this.get('type')==='directory' ? this.cd() : this.open();
	},

	// Navigate to the correct route for this directory.
	cd: function() {
		Mast.navigate('#directory/'+ this.get('id'));
	},

	// Download this file for viewing.
	open: function() {
		window.location = '/file/open/' + this.get('id');
	},

	// Navigate to details page.
	details: function (e) {
		Mast.navigate('#specifics/'+this.get('type')+'/'+this.get('id'));
		e.stopPropagation();
	},

	// Marshal server side data intoto presentable format.
	marshalInodeData: function() {

		this.set({
			modified_at: moment(new Date(this.get('modified_at'))).fromNow(),
			mimeClass: this.get('mimetype') ? this.get('mimetype').replace(/[\/.]/g, '-') : ''
		}, {silent: true});

	}

});