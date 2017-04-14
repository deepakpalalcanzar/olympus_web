Mast.registerComponent('UpdatePassword', {

	template: '.update-password-template',
	events: {
		'click .update-password-button': 'updateUserPassword'
	},

	updateUserPassword: function(){
		var self = this;

		if(this.validateForm()){

			if (!this.isValidPassword()) {
				alert('You did not enter the same new password.');
				this.emptyForm();
				return;
// Get the payload object and return it.
			} else {
				var payload = this.getPayloadData();
				payload.id = Mast.Session.User.id;
				/*Mast.Socket.request('/account/updateUserPassword', payload, function() {
					alert('Thank you! Your password changed successfully.');
					//Mast.navigate('accountSettings');
					self.emptyForm();
				});
                                */

                              /*$.get("https://ipinfo.io", function(response) {
                              payload.ipadd =response.ip;*/
            	              console.log(payload);
                              Mast.Socket.request('/account/updateUserPassword', payload, function(){
					alert('Thank you! Your password changed successfully.');
		          	});
          	             /* }, "jsonp");*/
			}
		}
	},

	getPayloadData: function(){
		var newPasssword;
		return {
			oldPrometheus: this.$('input[name="newPassword"]').val(),
		};
	}, 

	emptyForm: function(){
		this.$('input[name="newPasssword"]').val('');
		this.$('input[name="confirmPassword"]').val('');
	},

	isValidPassword: function() {
		var password, checkPassword;
		password      = this.$('input[name="newPassword"]').val();
		checkPassword = this.$('input[name="confirmPassword"]').val();
		return password === checkPassword;
	},

	validateForm: function(){
		if(this.$('input[name="newPassword"]').val() ===''){
			alert('Please enter new password !');
			return false;
		}else if(this.$('input[name="confirmPassword"]').val() ===''){
			alert('Please enter confirm new password !');
			return false;
		}else{
			return true;
		}
	},



});
