/**
 * Authentication middleware
 */

var crypto = require('crypto'),
  bcrypt = require('bcrypt');

exports.policy = {
	
	// Check if logged-in user has permission to..
	can: function (action) {
		return function (req,res,next) {

			// capitalize inodeType for use with Model.getModelName()
			var inodeType	= _.capitalize(req.param('controller')),
			inodeId		= req.param('id'),
			accountId	= req.session.Account && req.session.Account.id;

			// If action unspecified, default to request action
			action = action || req.param('action');
			Account.can(action,inodeId,inodeType,accountId,function(err,allowed) {
				allowed ? next() : res.view('403',{
					title:'Access Denied'
				});
			});
		};
	},
	
	// Check nothing
	none: function (req,res,next) {
		next();
	},

	// Check whether the user is logged in AT ALL
	any: function (req,res,next) {

		// Remember where the user was trying to go so she can be redirected back
		//req.session.reroutedFrom = req.url; add back GTHACK REMOVE COMMENT FOR ORIGINAL
		req.session.reroutedFrom = '/'; //GTHACK ADDED
		if (req.session.authenticated) {
			next();
		}
		// Redirect to login page
		else {
			res.redirect('/login');
		}
		
	},


	// Check whether the user is *NOT* logged in AT ALL
	inverse: function (req,res,next) {
		if (!req.session.authenticated) {
			next();
		}
		else {
			res.render('403',{
				title:'Access Denied'
			});
		}
	},


	// Check whether the logged-in user is of a specific type
	only: function(roleName) {
		return function (req,res,next) {

			// Remember where the user was trying to go so she can be redirected back
			req.session.reroutedFrom = '/';  //GTGACJ reokace '/' with req.url;

			// Check if this Account has the specified role
			Account.hasRole(req.session.Account.id,roleName,
				function() {
					next();
				}, function () {
					res.render('403',{
						title:'Access Denied'
					});
				});
		};
	}
};

// Generate a salt for the password.
generateSalt = function(length) {
    var chars, num, salt, special, x, _i;
    if (length == null) {
      length = 44;
    }
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789';
    salt = '';
    for (x = _i = 1; 1 <= length ? _i <= length : _i >= length; x = 1 <= length ? ++_i : --_i) {
      num = Math.floor(Math.random() * chars.length);
      salt += chars.substring(num, num + 1);
    }
    return salt;
};

exports.randString = generateSalt;

// Hash a password.
exports.hashPassword = function(password) {
    return bcrypt.hashSync(password, 10);
};

// Check a password against hash.
exports.checkPassword = function(password, hash) {
   return bcrypt.compareSync(password, hash);
};

/**
 * Session management helper
 */
exports.session = {
	
	// Merge the current session with an account based on API auth header
	checkApiAuth: function(req, callback) {
		req.api_authenticated = false;
		// If we have an authorization header...
		if (req.headers['authorization']) {
			// Split the header apart
			var authHeader = req.headers['authorization'].split(' ');
			var authType = authHeader[0];
			if (authType != 'Bearer') {
				// Return error here?
				return callback(false);
			}
			var access_token = authHeader[1];
			// Grab the credentials out of the header
			if (access_token) {
				// Check for a user that is linked to this api key and auth token
				AccountDeveloper.find({where: {'access_token':access_token}}).success(function(model){
                                        if (model === null) {
						return callback(false);
					}
					// Make sure the token is not expired
					var now = new Date();
					if (model.access_expires < now) {
						return callback(false);
					}
					// If the account is valid, load it into the session
					Account.find(model.account_id).success(function(account){
                            if (account !== null) {
							req.api_authenticated = true;
							req.session.Account = APIService.Account(account);
							return callback(true);
						} else {
							return callback(false);
						}
					});
				});
			} else {
				// Return error here?
				return callback(false);
			}
		} else {
			return callback(true);
		}
	},

	// Merge the current session with the specified Account
	link: function (req,account,callback) {
		req.session.authenticated = true;
		req.session.Account = APIService.Account(account);
		req.isSocket && req.session.save();										// Manually save session if this is a socket request
	},
	
	// Disconnect the current session from all Accounts
	unlink: function (req,callback) {
		req.session.authenticated = false;
		delete req.session.Account;
		req.isSocket && req.session.save();										// Manually save session if this is a socket request
	},
	
	// Handle routing back to original destination in session
	// if no original destination is stored, redirect to home page
	redirectToOriginalDestination: function (req,res,next) {
		if (req.session.reroutedFrom) {
			//res.redirect(req.session.reroutedFrom);  GTHACK UNCOMMENT
			res.redirect('/'); //GTHACK to eliminate redirection change back to above line
			req.session.reroutedFrom = null;
			
		}
		else {
			res.redirect('/');
		}
	}
};
