Mast.registerComponent('UserDetails', {

	model: {
		name : 'Enter your Name',
		phone: 'Enter your phone number',
		email: 'Enter your email',
		title: 'Enter your title'
	},

	template: '.account-details-template',

	regions: {
		'.image-uploader': 'ImageUploaderComponent'
	},

	afterCreate: function () {
		// On tablet, hide the upload logo option
		if (Mast.isTouch) {
			this.$('.change-profile-pic').remove();
		}
	},

	// set model to the mast session account attributes. Useful for placing the attributes as
	// placeholder text.
	afterConnect: function() {
		this.set(Mast.Session.Account);
	},

	afterRender: function(){		
		// Set uploader endpoint.
		this.children['.image-uploader'].children['.uploader'].set('endpoint','/account/imageUpload');
		this.$('.profile-pic').attr('src','/account/avatar');
	},
});