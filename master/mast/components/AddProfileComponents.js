Mast.registerComponent('AddProfileComponent',{

	template: '.add-profile-template',
	outlet: '#content',
	events:{
		'click .profile-save-button': 'addProfile',
	},
//	collection	: 'Proi',
	init: function(){
	},

	afterRender: function(){
//		var lock =  { id : '12' };
/*		Mast.Socket.request('/account/listWorkgroup', lock, function(res, err){
			if(res){
				var options = "Update Workgroup";
				$.each( res, function( i, val ) {
					options = options + '<option value="'+ val.id +'">' + val.name + '</option>'; 
				});
				$('#list_workgroup').html(options);
 			}
		});
*/	},

	addProfile:function(){

		var self = this;
		var profileData = this.getFormData();

		console.log(profileData);
		/*Mast.Socket.request('/profile/create', profileData, function(res, err){
			if(res){
				Mast.navigate('profile');
			}
			alert('Profile has been created.');
		});*/
                  /*$.get("https://ipinfo.io", function(response) {
                  profileData.ipadd =  response.ip;*/
		  Mast.Socket.request('/profile/create', profileData, function(res, err){
			if(res){
				Mast.navigate('profile');
			}
			alert('Profile has been created.');
		     });
                   /* }, "jsonp");*/

	},

	getFormData:function(){

		var profile_name, user_management, enterprises_management,
			subscription_managment, workgroup_managment_of_users, workgroup_managment_of_enterprises,
			manage_admins, manage_superadmins, manage_superadmin;

		return {
			profile_name			: this.$('input[name="profile_name"]').val(),
			user_managment	 		: $("input[name=user_managment]").prop("checked") === true ? '1' : '0' ,
			enterprises_management	: $("input[name=enterprises_management]").prop("checked") === true ? '1' : '0' ,
			subscription_managment	: $("input[name=subscription]").prop("checked") === true ? '1' : '0' ,
			workgroup_managment_of_users		: $("input[name=workgroup_managment_of_users]").prop("checked") === true ? '1' : '0' ,
			workgroup_managment_of_enterprises	: $("input[name=workgroup_managment_of_enterprises]").prop("checked") === true ? '1' : '0' ,
			manage_admins 		: $("input[name=manage_admins]").prop("checked") === true ? '1' : '0' ,
			manage_superadmin	: $("input[name=manage_superadmins]").prop("checked") === true ? '1' : '0' ,
			manage_admin_user	: $("input[name=manage_admin_user]").prop("checked") === true ? '1' : '0' ,
		};
	},

});
