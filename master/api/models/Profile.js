Profile = Model.extend({

	tableName: 'profile',

	name : STRING,
	user_managment: BOOLEAN,
	subscription_managment: BOOLEAN,
	enterprises_managment: BOOLEAN,
	user_workgroup_mangment: BOOLEAN,
	enterprises_workgroup_managment: BOOLEAN,
	manage_admins: BOOLEAN,
	superadmins: BOOLEAN,
	manage_admin_user: BOOLEAN,
	admin_id: INTEGER,

	classMethods : {

		createProfile: function (options, cb) {

			Profile.create({
				name 			: options.name,
				user_managment 	: options.user_managment,
				subscription_managment 	: options.subscription,
				enterprises_managment 	: options.enterprises_management,
				user_workgroup_mangment : options.workgroup_managment_of_users,
				enterprises_workgroup_managment: options.workgroup_managment_of_enterprises,
				manage_admins 		: options.manage_admins,
				superadmins 		: options.manage_superadmin,
				manage_admin_user 	: options.manage_admin_user,
				admin_id 			: options.admin_id	

			}).done(function (err, versionResult){
				return cb();
			});
		},
	}

});