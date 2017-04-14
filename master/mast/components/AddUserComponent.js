/*Mast.components.AddUserComponent  = Mast.Component.extend({*/

Mast.registerComponent('AddUserComponent',{

	template: '.add-user-template',
	outlet: '#content',
	events:{
		'click .setting-save-button': 'addUser',
		'blur  .user-email'				: 'checkForEmail'
	},	

	model : {
		superadmin : false,
	},
	
	collection	: 'Account',

	init: function(){

		var lock =  { id : '12' };
		$('.searchbar').hide();
		$('.upload-file').hide();

		if(Mast.Session.Account.isSuperAdmin){
			this.model.set('superadmin', true);
		}
	},


	afterRender: function(){

		var lock =  { id : '12' };

		Mast.Socket.request('/account/listWorkgroup', lock, function(res, err){
			if(res){
				var options = "<option value=''>Select Workgroup</option>";				$.each( res, function( i, val ) {
					options = options + '<option value="'+ val.id +'">' + val.name + '</option>'; 
				});
				$('#list_workgroup').html(options);
 			}
		});

		Mast.Socket.request('/subscription/getSubscription', null, function(res, err){
			if(res){
				var options;
				$.each( res, function( i, val ) {
					if(val.is_default === 1){
						options = options + '<option selected value="'+ val.id +'">' + val.features + '</option>'; 
					}else{
						options = options + '<option value="'+ val.id +'">' + val.features + '</option>'; 
					}
				});
				if(options){
					$('#subscription-drop').html(options);
					$('.add-subs-cont').remove();
				}else{
					$('.add-subs-cont').show();
 					$('.ent-form-cont').remove();		
				}
 			}
		});
	},

	addUser:function(){

		var self = this;
		var userData = this.getFormData();	

		self.$('.setting-save-button').prop('disabled', true);
		self.validateForm(function(){//synchronize call to checkForEmail() to avoid getting undefined[async call will return undefined even before socket request completes]
			Mast.Socket.request('/profile/checkUsersLimit', null, function(re, er){
				if(re.not_subscriber && Mast.Session.Account.isSuperAdmin!= true){
					self.$('.setting-save-button').prop('disabled', false);
					alert('You have not subscribed any plan yet!');
					Mast.navigate('#account/subscription');
				}else{
					if(re.error && Mast.Session.Account.isSuperAdmin!= true){//superdmin check:Rishabh-Superadmin have no limits on creating accounts
						self.$('.setting-save-button').prop('disabled', false);
						alert('You have reached maximum limit of creating users');
					}else{
						Mast.Socket.request('/enterprises/getQuota', {sub_id:userData.subscription}, function(reso, erro){
							var q = reso[0].quota;
							userData.quota = ""+q+"";
							if(reso){
								Mast.Socket.request('/profile/register', userData, function(res, err){
									self.$('.setting-save-button').prop('disabled', false);
									if(res){
										if(res.type == "error"){
											alert(res.message);
											return false;
										}
										var options = { 
											user_id: typeof(res.account) === 'undefined' ? res.id : res.account.id,
											admin_profile_id: 	'2',
											email_msg  : (res.email_msg == 'email_exits') ?'email_exits':' ', 
										};

										Mast.Socket.request('/adminuser/create', options, function(resadmin, err){
											if(resadmin){
												
												if(!Mast.Session.Account.isSuperAdmin && this.$('select[name="workgroup"]').val()!=''){
													self.addPermissionViaEmail();	
												}

												self.clearForm();
												if(resadmin.adminuser.email_msg == 'email_exist'){
	                                        		alert('User already exits and added to workgroup.');
												}else{
													alert('Account has been created.');
									        	}
												Mast.navigate('#listusers');
											}
										});
									}
								});
							}else{
								self.$('.setting-save-button').prop('disabled', false);
							}
			  			});
			 		}
		 		}
			});
		});
	},

	getFormData:function(){
		var name, first_name, last_name, userName, email, title,
			workgroup, role, password, quota;

		first_name 	= this.$('input[name="first_name"]').val();
		last_name	= this.$('input[name="last_name"]').val();
		userName 	= first_name+' '+last_name;
		return {
			name 	 : userName,
			email	 : this.$('input[name="email"]').val(),
			workgroup: this.$('select[name="workgroup"]').val(),
			role	 : this.$('select[name="role"]').val(),
			password : this.$('input[name="password"]').val(),
			title	 : this.$('input[name="title"]').val(),
			subscription : this.$('select[name="subscription"]').val()			
		};
	},

	clearForm: function(){
		this.$('input[name="first_name"]').val('');
		this.$('input[name="last_name"]').val('');
		this.$('input[name="email"]').val('');
		this.$('select[name="workgroup"]').val('');
		this.$('select[name="role"]').val('');
		this.$('input[name="password"]').val('');
		this.$('input[name="title"]').val('');
		this.$('input[name="quota"]').val('');
	},

	validateForm: function(callback){

		var self = this;
		self.clearFormCSS();
		var email = this.$('input[name="email"]').val();
		if (self.$('input[name="first_name"]').val() === '') {
			self.$('.setting-save-button').prop('disabled', false);
			$(".userFirstName").append("<span class='error_span'> Please enter your first name. </span>");
    		$(".user-first-name").css({ "border" : "1px solid red" });
			return false;
		}
		
		if(email===''){
			self.$('.setting-save-button').prop('disabled', false);
			$(".userEmail").append("<span class='error_span'> Please enter your email. </span>");
    		$(".user-email").css({ "border" : "1px solid red" });
			return false;
		}

		var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (re.test(email) === false) {
			self.$('.setting-save-button').prop('disabled', false);
			$(".userEmail").append("<span class='error_span'> Email entered is not valid. </span>");
    		$(".user-email").css({ "border" : "1px solid red" });
    		return false;
		}

		self.checkForEmail(function(){

			if(self.$('input[name="password"]').val() ===''){
			// if($(".userPassword").attr('style') !== 'display: none;'){
					self.$('.setting-save-button').prop('disabled', false);
				$(".userPassword").append("<span class='error_span'> Please enter your password. </span>");
    			$(".user-password").css({ "border" : "1px solid red" });
				return false;
			// }
		}

			if(!self.isValidPassword()){
			// if($(".userConfirmPassword").attr('style') !== 'display: none;'){	
					self.$('.setting-save-button').prop('disabled', false);
				$(".userConfirmPassword").append("<span class='error_span'> Confirm password does not match. </span>");
				$(".user-confirm-password").css({ "border" : "1px solid red" });
				return false;
			// }
		}

			if(!self.get('superadmin')){
				if(self.$('select[name="workgroup"]').val() !=='' && self.$('select[name="role"]').val() ===''){
					self.$('.setting-save-button').prop('disabled', false);
				$(".userRole").append("<span class='error_span'> Please assign workgroup role for user. </span>");
				$(".user-role").css({ "border" : "1px solid red" });
				return false;
			}
		}

			if(self.$('select[name="subscription"]').val() ===''){
				self.$('.setting-save-button').prop('disabled', false);
			$(".userSubscripton").append("<span class='error_span'> Confirm password does not match. </span>");
			$(".user-subscription").css({ "border" : "1px solid red" });
			return false;
		}
		
			callback();//return true;
		});
	},

	clearFormCSS : function(){

		$(".userFirstName .error_span").remove();
		$(".userEmail .error_span").remove();
		$(".userPassword .error_span").remove();
		$(".userConfirmPassword .error_span").remove();
		$(".userRole .error_span").remove();
		$(".userSubscripton .error_span").remove();

		$(".user-first-name").css({ "border" : "1px solid #d7dbdc" });
    	$(".user-email").css({ "border" : "1px solid #d7dbdc" });
    	$(".user-password").css({ "border" : "1px solid #d7dbdc" });
    	$(".user-confirm-password").css({ "border" : "1px solid #d7dbdc" });
    	$(".user-role").css({ "border" : "1px solid #d7dbdc" });
    	$(".user-subscription").css({ "border" : "1px solid #d7dbdc" });

	},

	checkForEmail: function(checkEmailCallback){
		console.log('blur blur blur blur blur blur blur blur blur blur blur');
		$(".userEmail .error_span").remove();
		var email = this.$('input[name="email"]').val();
		var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

		if(email === ''){
			$('.setting-save-button').prop('disabled', false);
    		$(".userEmail").append("<span class='error_span'> Please enter an email. </span>");
    		$(".user-email").css({ "border" : "1px solid red" });
			return false;
    	}else if (filter.test(email)) {
    		$(".user-email").css({ "border" : "1px solid #d7dbdc" });
    		var data = { email :  email }
			Mast.Socket.request('/account/checkEmail', data, function(response, error){
				if(response.msg === "email_exists"){
					// $(".userPassword").hide();
					// $(".userConfirmPassword").hide();
					$('.setting-save-button').prop('disabled', false);
					$(".userEmail .error_span").remove();
					$(".userEmail").append("<span class='error_span'> Error: user already exists </span>");
    				$(".user-email").css({ "border" : "1px solid red" });
    				return false;
				}else if (response.msg === "no_record"){
					// $(".userPassword").show();
					// $(".userConfirmPassword").show();
					$(".user-email").css({ "border" : "1px solid #d7dbdc" });
					(typeof checkEmailCallback == 'function') && checkEmailCallback();//return true;
				}
			});
    	}else {

			// $(".userPassword").show();
			// $(".userConfirmPassword").show();
			$('.setting-save-button').prop('disabled', false);
    		$(".userEmail").append("<span class='error_span'> Email entered is not valid. </span>");
    		$(".user-email").css({ "border" : "1px solid red" });
    		return false;
    	}
	},

	isValidPassword: function() {
		var password, checkPassword;
		password      = this.$('input[name="password"]').val();
		checkPassword = this.$('input[name="c_password"]').val();
		return password === checkPassword;
	},

// send addPermission request to server user by email
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
/*		if (this.collection.getByEmail(emails)) {
			console.log('User with email '+emails+' already has permissions...');
			return;
		}
*/
		var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (re.test(emails) === false) {
// alert('The email address you entered was invalid; please check and try again.');
		}

// Send a request to add permission for this user, who may or may not exist.
// If they don't exist, they'll be added
		else {
			Mast.Socket.request('/directory/addPermission',{
				id: workgroup,
				email: emails,
				permission: role,
				type: 'permission'
			});
		}
	}

});
