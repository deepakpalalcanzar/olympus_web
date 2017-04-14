/**
* Allow any authenticated user.
*/
module.exports = function (req,res,ok) {

	// Temporary override for access w/ admin token
	if (req.param(sails.config.specialAdminCode)) {
		req.session.Account = {
			id: 1,
			name: 'Olympus Secret Admin'
		};
		req.isSocket && req.session.save();
		return next();
	}

	// If the request is using an api access token, check that it's vslif
	if (req.headers['authorization']) {
		AuthenticationService.session.checkApiAuth(req, function(){
			if (req.api_authenticated) {
				Account.subscribe(req,req.session.Account.id);
				ok();
			}
			else {
				res.send(403);
			}
		});
	}

	// Otherwise check if they're logged in or not
	else if (req.session.authenticated) {
		Account.subscribe(req,req.session.Account.id);
		ok();
	} else {
		if (req.isSocket || req.xhr) {
			res.send(403);
		} else {
			res.redirect('/login');
		}
	}


};
