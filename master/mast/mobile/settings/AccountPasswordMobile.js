Mast.registerComponent('AccountPasswordMobile', {
	
	template: '.account-password-mobile-template',

	afterCreate: function() {
		OlympusHelper.touchEnhance(this.$('.submit-button'));
	},

	events: {
		'touch .submit-password': 'sendPayload'
	},

	// Make a server request with the payload object as that contains the request paramters
	sendPayload: function(e) {
		this.$('.submit-button').removeClass('tapped');

		// If the user does not the same new password twice then alert them of this. 
		if (!this.isValidNewPassword()) {
			alert('You did not enter the same new password.');
			return;

		// Get the payload object and return it.
		} else {
			Mast.Socket.request('/account/changePassword', this.getPayloadInfo(), function() {
				alert('Thank you! Your password changed successfully.');
				Mast.navigate('accountSettings');
			});
		}
	},

	// get the payload from the form inputs and return it.
	getPayloadInfo: function() {
		var oldPrometheus, prometheus;
		return {
			oldPrometheus: this.$('input[name="oldPrometheus"]').val(),
			prometheus   : this.$('input[name="prometheus"]').val()
		};
	},

	// We need to validate that they enter the new password the same. We will check that the user
	// enters the same new password and return a boolean.
	isValidNewPassword: function() {
		var password, checkPassword;

		password      = this.$('input[name="prometheus"]').val();
		checkPassword = this.$('input[name="checkPrometheus"]').val();

		return password === checkPassword;
	}
	
});