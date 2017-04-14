Mast.registerComponent('AddAdminUserComponent',{

	template: '.add-adminuser-template',
	outlet: '#content',
	events:{
		'click .submit-adminuser': 'addAdminUser',
		'keypress #email': 'disablePwd',
	},
	collection	: 'Account',

	init: function(){
	},

	afterRender: function() {
		var self = this;

		// Create new autocomplete for use with the textarea. Do this only if this olympus app
		// is not a private deployment.
        if (!Olympus.isPrivateDeployment) {
    		self.$('input.accounts').autocomplete({
    			source: self.searchAccounts,
    			autoFocus: true,
    			appendTo: self.$('.permission-form'),

    			// item in autocomplete dropdown is selected
    			// select: self.addPermission,
    			select: function( event, ui ) {
    				self.$('input[name="password"]').attr('disabled',true);
    			}

    		});
        }

		// This code seems to be called twice, so we'll do an unbind to make sure that
		// we don't bind the click event to the button more than once
		$('.addSharedUser-button').unbind('click');

		var lock =  { id : '12' };
		Mast.Socket.request('/profile/listProfile', lock, function(res, err){
			if(res){
				var options = "Update Workgroup";
				$.each( res, function( i, val ) {
					options = options + '<option value="'+ val.id +'">' + val.name + '</option>'; 
				});
				$('#profile').html(options);
 			}
		});

	},
	searchAccounts: function(req, callback) {
		var searchTerm = req.term;

		Mast.Socket.request('/account/fetch',{
			email	: searchTerm,
			name	: searchTerm,
			// isPrivateDeployment: Olympus.isPrivateDeployment
			isPrivateDeployment: true
		}, function(res) {
			if (res.status === 403) {
				return;
			}

			accounts = _.map(res, function(value) {
				return {
					label: value.name+' <'+value.email+'>',
					value: value.email,
					account: value
				};
			});
			callback(accounts);
		});
	},

	addAdminUser: function(){
		var self = this;
		var userData = this.getFormData();
			if(self.validateForm()){

				Mast.Socket.request('/adminuser/register', userData, function(res, err){
					if(res){
						
						var data = {
							user_id 		: res.error?res.id:res.account.id,
							admin_profile_id: userData.profile
						};

						Mast.Socket.request('/adminuser/create', data, function(response, error){
							if(response){
							// console.log(response);
							self.clearForm();
							alert('Data has been saved.');
							Mast.navigate('adminUser');
							}
						});	

					}
				});	
			}
	},

	getFormData:function(){
		var full_name, email, profile, title,password;
		return {
			name 	 : this.$('input[name="full_name"]').val(),
			email	 : this.$('input[name="email"]').val(),
			profile: this.$('select[name="profile"]').val(),
			title	 : this.$('input[name="title"]').val(),
			password : this.$('input[name="password"]').val()
		};

	},

	clearForm: function(){
		this.$('input[name="full_name"]').val('');
		this.$('input[name="email"]').val('');
		this.$('select[name="profile"]').val('');
		this.$('input[name="title"]').val('');
		this.$('input[name="password"]').val('');
	},

	validateForm: function(){
		if (this.$('input[name="full_name"]').val() === '') {
			alert('Please enter name !');
			return false;
		}else if(this.$('input[name="email"]').val() ===''){
			alert('Please enter email !');
			return false;
		}else{
			return true;
		}
	},

	disablePwd :function(){
		if(this.$('input[name="email"]').val() ===''){
			this.$('input[name="password"]').attr('disabled',false);
		}
	}
});