/*---------------------
  :: AdminUser
  -> model
---------------------*/
module.exports = {
	attributes: {
		user_id: 'integer',
		admin_profile_id : 'integer',
	},

	createAdminUser: function (options, cb) {
        AdminUser.create({
            user_id: options.user_id,
            admin_profile_id: options.admin_profile_id
        }).exec(function foundAccount (err, account) {
            //if (err) return cb && cb(err);   
            //cb(account); 


            if (err) return cb && cb(err);   
            //cb(account);   
            return cb && cb(null, account);  


        });
    },
};
