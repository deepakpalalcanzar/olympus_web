Mast.registerComponent('UpdateProfileComponent', {

	template: '.update-admin-profile-template',
	outlet: '#content',
	model: {
		enterprises_managment 	: '0',
		user_managment	: '0',
		superadmins		: '0',
		subscription_managment: '0',
		name			: 'Enter profile name',
		manage_admin_user	: '0',
		manage_admins		: '0',
		manage_superadmins	: '0',
	},

	events: {
		'click .profile-save-button'	: 'updateProfile',
	},

	init: function() {
		console.log(Mast.Session.adminprofile);
		this.set(Mast.Session.adminprofile);
	},

//Set the value of Form
	afterRender : function(){

		var profileData =	Mast.Session.adminprofile;
		console.log(profileData);		
//If plan have unlimited number of users
		if(profileData.user_managment === '1'){
			$('input[name="user_managment"]').attr('checked', true);
		}

		if(profileData.subscription_managment === '1'){
			$('input[name="subscription"]').attr('checked', true);
		}

		if(profileData.enterprises_managment === '1'){
			$('input[name="enterprises_management"]').attr('checked', true);
		}

		if(profileData.enterprises_workgroup_managment === '1'){
			$('input[name="workgroup_managment"]').attr('checked', true);
		}

		if(profileData.manage_admins === '1'){
			$('input[name="manage_admins"]').attr('checked', true);
		}

		if(profileData.superadmins === '1'){
			$('input[name="manage_superadmins"]').attr('checked', true);
		}

		if(profileData.manage_admin_user === '1'){
			$('input[name="manage_admin_user"]').attr('checked', true);
		}
	},

	updateProfile:function(){

		var self = this;
		var planData =	Mast.Session.adminprofile;
		var subscriptionData = this.getFormData();
		if(subscriptionData){
			/*Mast.Socket.request('/profile/updateProfile' , subscriptionData, function(res, err){
				alert('Profile has been updated.');
			 Mast.navigate('#profile');
			});*/
                   /*$.get("https://ipinfo.io", function(response) {
            	    subscriptionData.ipadd =  response.ip ;*/
			Mast.Socket.request('/profile/updateProfile' , subscriptionData, function(res, err){
				alert('Profile has been updated.');
			 Mast.navigate('#profile');
			});	
			/*}, "jsonp");*/
	
		}
	},

	getFormData:function(){

		var profileData =	Mast.Session.adminprofile;
		var profile_name, user_management, enterprises_management,
			subscription_managment, workgroup_managment_of_users, workgroup_managment_of_enterprises,
			manage_admins, manage_superadmins, manage_superadmin;

		return {
			profile_name			: this.$('input[name="profile_name"]').val(),
			user_managment	 		: $("input[name=user_managment]").prop("checked") === true ? '1' : '0' ,
			enterprises_management	: $("input[name=enterprises_management]").prop("checked") === true ? '1' : '0' ,
			subscription_managment	: $("input[name=subscription]").prop("checked") === true ? '1' : '0' ,
			workgroup_managment_of_users		: $("input[name=workgroup_managment]").prop("checked") === true ? '1' : '0' ,
			workgroup_managment_of_enterprises	: $("input[name=workgroup_managment]").prop("checked") === true ? '1' : '0' ,
			manage_admins 		: $("input[name=manage_admins]").prop("checked") === true ? '1' : '0' ,
			manage_superadmin	: $("input[name=manage_superadmins]").prop("checked") === true ? '1' : '0' ,
			manage_admin_user	: $("input[name=manage_admin_user]").prop("checked") === true ? '1' : '0' ,
			id					: profileData.id ,
		};

	},
});
