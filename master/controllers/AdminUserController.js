var UUIDGenerator = require('node-uuid');
var cacheRoute = require('booty-cache');

var AdminUserController = {

/**
	This function is used to list the profiles and the count of users
*/
	list: function(req, res){

		var sql = "SELECT profile.name,profile.id, count(user_id) as usercount from adminuser JOIN profile ON adminuser.admin_profile_id = profile.id where profile.admin_id = ? GROUP BY admin_profile_id";
		sql = Sequelize.Utils.format([sql, req.session.Account.id]);
   		sequelize.query(sql, null, {
    		raw: true
   		}).success(function(adminaccount) {
    		if(adminaccount.length){ // check for no records exists
            	res.json(adminaccount, 200);
          	}else{
            	res.json({
             	 name: 'error_123',
              	 notFound : true,  
              });
          	}
   		}).error(function(e) {
			throw new Error(e);
   		});
	},

	userDetails: function(req, res){
		var sql = "SELECT a.*,p.id AS profile FROM account a "+
		"INNER JOIN adminuser au ON a.id = au.user_id "+
		"INNER JOIN profile p ON p.id = au.admin_profile_id "+
		"WHERE p.id=?";
		sql = Sequelize.Utils.format([sql, req.params.id]);
		console.log(sql);
   		sequelize.query(sql, null, {
    		raw: true
   		}).success(function(adminaccount) {
    		res.json(adminaccount, 200);
   		}).error(function(e) {
			throw new Error(e);
   		});

	},

	register: function(req, res){

		var request = require('request');
		var options = {
			uri: 'http://localhost:1337/account/register/' ,
			method: 'POST',
	    };

	    options.json =  {
	    	name		: req.params.name,
	    	email		: req.params.email,
	    	isVerified  : true,
	    	isAdmin		: false,
	    	password 	: req.params.password,
	    	created_by	: req.session.Account.id,
	    	title    	: req.params.title,
	    };

		request(options, function(err, response, body) {
			if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
//	      Resend using the original response statusCode
//	      use the json parsing above as a simple check we got back good stuff
	      res.json(body, response && response.statusCode);
	    });
	},

	create: function(req, res){

		var request = require('request');
		var options = {
			uri: 'http://localhost:1337/adminuser/register/' ,
			method: 'POST',
	    };

	    options.json =  {
	    	user_id				: req.params.user_id,
	    	admin_profile_id	: req.params.admin_profile_id,
                email_msg :         req.params.email_msg,
	    };

		request(options, function(err, response, body) {
			if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
//	Resend using the original response statusCode
//	use the json parsing above as a simple check we got back good stuff
	      	res.json(body, response && response.statusCode);
	    });
	},



};
_.extend(exports, AdminUserController);
