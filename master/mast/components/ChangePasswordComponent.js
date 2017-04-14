Mast.registerComponent('ChangePassword', {

	template: '.change-password-template',
	events: {
		'click .submit-update': 'updateAccountPassword'
	},


	init: function(){
		$('.upload-file').hide();
	}, 

	updateAccountPassword: function() {

		console.log("UPDATE ACCOUNT PASSWORD");
		var self = this;
		this.$('.submit-update').removeClass('tapped');

// If the user does not the same new password twice then alert them of this. 
		if(this.validateForm()){

			if (!this.isValidNewPassword()) {
			
				alert('You did not enter the same new password.');
				this.emptyForm();
				return;

// Get the payload object and return it.
			} else {
				
				var payload = this.getPayloadInfo();
				/*Mast.Socket.request('/account/changePassword', payload, function() {
					alert('Thank you! Your password changed successfully.');
					Mast.navigate('accountSettings');
					self.emptyForm();
				});*/
				/*$.get("https://ipinfo.io", function(response) {
            				payload.ipadd =response.ip;*/
            				console.log(payload);
            				Mast.Socket.request('/account/changePassword', payload, function() {
						alert('Thank you! Your password changed successfully.');
						Mast.navigate('accountSettings');
						self.emptyForm();
					});
          	
				/*}, "jsonp");*/
			}
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
	},

	// empty the form whenever we need it
	emptyForm: function() {
		this.$('input[name="oldPrometheus"]').val('');
		this.$('input[name="prometheus"]').val('');
		this.$('input[name="checkPrometheus"]').val('');
	},

	validateForm: function(){
		if (this.$('input[name="oldPrometheus"]').val() === '') {
			alert('Please enter old password !');
			return false;
		}else if(this.$('input[name="prometheus"]').val() ===''){
			alert('Please enter new password !');
			return false;
		}else if(this.$('input[name="checkPrometheus"]').val() ===''){
			alert('Please enter confirm new password !');
			return false;
		}else{
			return true;
		}
	},

});
