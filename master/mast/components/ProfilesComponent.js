Mast.registerTree('ProfileTable', {

	extendsFrom: 'UITableComponent',
	model: {

		column1: {
			name: 'Profile',
			className: 'profiles-column'
		},

		column2: {
			name: 'User',
			className: 'users-managment-column'
		},

		column3: {
			name: 'Enterprises',
			className: 'subscription-users-column'
		},

		column4: {
			name: 'Subscription',
			className: 'enterprises-managment-column'
		},
		column5: {
			name: 'Workgroup Managment',
			className: 'user-workgroup-column'
		},
		column6: {
			name: 'Manage Admins',
			className: 'rest-column'
		},
		column7: {
			name: 'Manage SuperAdmins',
			className: 'rest-column'
		},
		column8: {
			name: 'Manage AdminUser',
			className: 'rest-column'
		},
		column9: {
			name: 'Action',
			className: 'action-column'
		},

		selectedModel: null
	},
	
	template: '.profile-template',

// branch properties
	emptyHTML      : '<div class="loading-spinner"></div>',
	branchComponent: 'ProfileRow',
	branchOutlet   : '.profile-outlet',

	collection     : {
		url: '/profile/getAllProfiles',
		model: Mast.Model.extend({
			defaults: {
				highlighted 	: false,
				name 					: "Super Admin",
				user_managment  		: 'No',
				enterprises_managment   : 'No',
				subscription_managment  : 'No' ,
				user_workgroup_managment: 'No',
				enterprises_workgroup_managment: 'No',
				manage_admins 			: 'No',
				manage_superadmins		: 'No',
				manage_admin_users 		: 'No'
			},
			selectedModel: null
		})
	},

	init:function(collection){
        $('.searchbar').hide();
    },

	events:{
		'click .delete-profile'	: 'deleteProfile',
	},

	deleteProfile: function(e){
		
		var self = this.collection;
		var id = $(e.currentTarget).data("id");
		var item = this.collection.get(id);
		if(typeof item !== 'undefined'){
			if(confirm('Are you sure you want to delete this profile?')){
				/*Mast.Socket.request('/profile/deleteProfile', { profile_id: id}, function(res, err){
					if(res.error_msg){
						alert(res.error_msg);		
					}else if(res.success){
						self.remove(id);
					}
				});*/

                           /*$.get("https://ipinfo.io", function(response) {
            	           var ipadd = response.ip ;*/
                           Mast.Socket.request('/profile/deleteProfile', { profile_id: id}, function(res, err){
					if(res.error_msg){
						alert(res.error_msg);		
					}else if(res.success){
						self.remove(id);
					}
				});
                         /* }, "jsonp"); */

			}
		}
	},

});

// user row component
Mast.registerComponent('ProfileRow', {

	template: '.profile-row-template',
	events:{
		'click .action-edit'	: 'editProfile',
	},

	editProfile: function(){
		Mast.Session.adminprofile = this.model.attributes;
		Mast.navigate('profile/updateprofile');
	}

});
