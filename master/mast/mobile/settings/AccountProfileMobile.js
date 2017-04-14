Mast.registerComponent('AccountProfileMobile', {
	
	template: '.account-profile-mobile-template',

	afterCreate: function() {
		OlympusHelper.touchEnhance(this.$('.submit-button'));
	},

	events: {
		'touch .submit-details': 'sendDetailsPayload',
		'click input': 'selectText'
	},

	model: {
		name: 'Enter your name',
		phoneNumber: 'Enter your phone number',
		email: 'Enter your email',
		job_title: 'Enter your title'
	},

	// set model to the mast session account attributes. Useful for placing the attributes as
	// placeholder text.
	afterConnect: function() {
		this.set(Mast.Session.Account);
	},

	// Make a server request with the payload object as that contains the request paramters
	sendDetailsPayload: function() {
		this.$('.submit-button').removeClass('tapped');

		var self = this;
		var payload = this.getPayload();

		Mast.Socket.request('/account/update', payload, function(){
			alert('Your account has been updated.');
			self.emptyForm();
		});
	},

	// get account details payload and return that object
	getPayload: function() {
		var name, email, title, phone;

		return {
			name : this.$('input[name="name"]').val(),
			email: this.$('input[name="email"]').val(),
			title: this.$('input[name="title"]').val(),
			phone: this.$('input[name="phone"]').val()
		};
	},

	emptyForm: function() {
		this.$('input[name="name"]').val('');
		this.$('input[name="email"]').val('');
		this.$('input[name="title"]').val('');
		this.$('input[name="phone"]').val('');
	},

	selectText: function(e) {

		// select the text for mobile works a little different then desktop
		e.currentTarget.setSelectionRange(0, 9999);
	}
	
});