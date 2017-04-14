Mast.registerComponent('UserDetail', {

	model: {
		name : 'Enter your Name',
		phone: 'Enter your phone number',
		email: 'Enter your email',
		title: 'Enter your title'
	},

	template: '.user-details-template',

	events: {
		'click .submit-details': 'updateAccountDetails',
		'click input': 'selectText',
		'click .delete-user': 'deleteUser',
	},

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
		
		var self = Mast.Session.User;

		console.log(Mast.Session.User);
		var lock =  { id : '12' };
		var userId =  { id : Mast.Session.User.id };
		var options = "Update Workgroup";
		var role ;

		Mast.Socket.request('/account/listWorkgroup', lock, function(res, err){
			if(res){
				$.each( res, function( i, val ) {
					options = options + '<option value="'+ val.id +'">' + val.name + '</option>'; 
				});
				$( "#user_role" ).val(role);
				$('#workgroups_assigned').html(options);
 			}
		});

		Mast.Socket.request('/profile/listProfile', lock, function(res, err){
			if(res){
				var options;
				$.each( res, function( i, val ) {
					if(self.admin_profile_id === val.id){
						options = options + '<option selected value="'+ val.id +'" data-id="'+self.adminuser_id+'">' + val.name + '</option>'; 
					}else{
						options = options + '<option value="'+ val.id +'" data-id="'+self.adminuser_id+'">' + val.name + '</option>'; 
					}
				});
				$('#profile').html(options);
 			}
		});

		this.set(Mast.Session.User);
	},

	afterRender: function(){		
		// Set uploader endpoint.
		//this.children['.image-uploader'].children['.uploader'].set('endpoint','/account/imageUpload');
		//this.$('.profile-pic').attr('src','/account/avatar');
	},

	updateAccountDetails: function() {
		var self = this;
		var payload = this.getPayload();
		payload.id = Mast.Session.User.id;
		Mast.Socket.request('/account/updateUserData', payload, function(res, err){
			//self.addPermissionViaEmail();		
			alert('Your account has been updated.');
		});
	},

	deleteUser: function(){
		var self = Mast.Session.User;
		Mast.Socket.request('/account/delAccount', { id: self.id}, function(res, err){
			console.log(res);			
			if(res){
				Mast.navigate('#listusers');
			}
		});
	},
// get account details payload and return that object
	getPayload: function() {

		var name, email, title, phone;
		return {

			name  		: $('input[name="name"]').val(),
			email 		: $('input[name="email"]').val(),
			title 		: $('input[name="title"]').val(),
			id 	 		: $('input[name="user_id"]').val(),
			phone 		: $('input[name="phone"]').val(),
			//workgroup 	: $('select[name="workgroup"]').val(),
			//role 		: $('select[name="role"]').val(),
			//profile_id 	: $('select[name="profile"]').find(':selected').attr('data-id'),
			//profile 	: $('select[name="profile"]').val()

		};
		
	},

	emptyForm: function() {
		this.$('input[name="name"]').val('');
		this.$('input[name="email"]').val('');
		this.$('input[name="title"]').val('');
		this.$('input[name="phone"]').val('');
		//workgroup: this.$('select[name="workgroup"]').val();
		//role: this.$('select[name="role"]').val();
	},

	selectText: function(e) {
		$(e.currentTarget).select();
	},

	addPermissionViaEmail: function () {

// If there is no input, then do nothing. useful for pressEnter event
		if (this.$('input[name="email"]').val() === '') {
			return;
		}

		var self = this;
// Get the contents of the "Share with someone else" input
		var emails 		= this.$('input[name="email"]').val();
		var workgroup 	= this.$('select[name="workgroup"]').val();
		var role		= this.$('select[name="role"]').val();

// Check that a user with the specified email doesn't already have permissions
		var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (re.test(emails) === false) {
// alert('The email address you entered was invalid; please check and try again.');
		}

// Send a request to add permission for this user, who may or may not exist.
// If they don't exist, they'll be added
		else {

			/*console.log("WORKED!",emails);
			console.log(Mast.Session.User.workgroup_id);
			var payload = {
				id: Mast.Session.User.workgroup_id,
				user_id: Mast.Session.User.id
			};
			Mast.Socket.request('/directory/deletePermission', payload, function(res, err){
// self.addPermissionViaEmail();		
				alert('Your account has been updated.');
				if(res){
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
					console.log(err);
					console.log(res);
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
				}
			});*/

/*			Mast.Socket.request('',, function(err, res){
				
				if(res){
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
					console.log(err);
					console.log(res);
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
				}

			});
*/
			Mast.Socket.request('/directory/addPermission',{
				id: workgroup,
				email: emails,
				permission: role,
				type: 'permission'
			});
		}
	},

});
