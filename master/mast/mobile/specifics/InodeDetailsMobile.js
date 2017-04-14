Mast.registerComponent('InodeDetailsMobile', {
	template: '.inode-details-mobile-template',

	regions: {
		'.currently-viewing-region': 'CurrentlyViewingMobile'
	},

	// Inherit model from parent
	// THIS GETS CALLED TWICE. not sure why yet.
	beforeCreate: function() {
		this.set(this.parent.model.attributes, {silent: true});
		this.marshalDetailsData();
	},

	// Marshal server side data intoto presentable format.
	marshalDetailsData: function() {
		this.set({
			created_at: moment(new Date(this.get('createdAt'))).fromNow(),
			size: this.get('size'),
			mimeClass: this.get('mimetype') ? this.get('mimetype').replace(/[\/.]/g, '-') : ''
		}, {silent: true});
	}
});