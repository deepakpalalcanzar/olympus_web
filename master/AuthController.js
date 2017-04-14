var AuthController = {
	
// authLogin
	authLogin: function(req, res) {

// Only allow post requests
		if(req.method !== 'POST') return res.send(500);
// Ensure we have an API token
		if(!req.param('api_key')) return res.send(500);
		// Look up the Developer
		Developer.find({ where:{ api_key: req.param('api_key') }}).done(function(err, developer) {
			if (err) return res.send(500,err);

			// Look up the Account and verify the password
			Account.find({
				where: {
					email: req.param('email')
				}
			}).done(function(err, account) {
console.log('TRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRR');
console.log(req);
console.log('TRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRRTRRR');
				if (err) return res.send(500,err);

				if(!AuthenticationService.checkPassword(req.param('password'), account.password)) {
					return res.send(500);
				}

				// We have a good developer and a valid account
				// Let's generate an access token
				var today = new Date();
				var code = AuthenticationService.randString(15);

				AccountDeveloper.create({

					api_key 		: req.param('api_key'),
					account_id 		: account.id,
					code 			: code,
					access_token 	: AuthenticationService.randString(15),
					refresh_token 	: AuthenticationService.randString(15),
					code_expires 	: new Date(today.getTime() + 1000 * 30), // code expires in 30 seconds
					access_expires 	: new Date(today.getTime() + 1000 * 60 * 60 * 30), // access token expires in one(three) hour
					// access_expires 	: new Date(today.getTime() + 1000 * 60 * 2), // access token expires in 2 minutes
					refresh_expires : new Date(today.getTime() + 1000 * 60 * 60 * 24 * 14) // refresh token expires in 14 days

				}).done(function done (err, accountDev) {
					if(err) res.send(500);
					res.json({
						access_token: accountDev.access_token,
						expires_in: 108000,//120,//10800,//3600
						token_type: "bearer",
						refresh_token: accountDev.refresh_token,
						is_enterprise: account.is_enterprise,
						adaptor: sails.config.fileAdapter.adapter
					});
				});
			});
		});

	},

	// Login to an Account
	login: function(req, res) {

		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
// When the form is visited, remember where the user was trying to go so she can be
// redirected back.  This may get overridden later if an API key is present in the request.
		if(req.method === 'GET') {

		 var NA = require("nodealytics");
                    NA.initialize('UA-47189718-1', 'https://www.olympus.io', function () {
                    });
//                    console.log('LogIN  LogIN  LogIN  LogIN  LogIN  LogIN  LogIN  LogIN  LogIN  LogIN ');
                    NA.trackEvent('Delete', 'Delete directory', function (err, resp) {
                        if (!err && resp.statusCode === 200) {
//                            console.log('Event has been tracked with Google Analytics');
                        }
                    });

			if(!req.headers['referer'] || req.headers['referer'].match(/\/login\/?$/)) {
				req.session.reroutedFrom = null;
			} else {
				req.session.reroutedFrom = req.headers['referer'];
			}

			_.shout("Redirect to: "+req.session.reroutedFrom);

			if (req.param('api_key') && req.session.authenticated === true) {
				return AuthController.verifyapi(req, res);
			}
		}

		// Get password from request
		var secretAttempt = req.param('prometheus');

		// If a password was entered look for that user.
		if(secretAttempt || secretAttempt === '') {

			Account.find({
				where: {
					email: req.param('email')
				}
			}).done(function(err, account) {

				if (err) return res.send(500,err);

				// Account not verified
				if (account && account.verified!=1) {
					return res.view('auth/login', {
						title     	: 'Login | Sails Framework',
						loginError 	: true,
						loginErrorMsg: 'Your account has not been verified yet.  Please check your email.',
						email     	: req.param('email'),
						api_key 	: req.param('api_key'),
						response_type: req.param('response_type'),
						redirect_url: req.param('redirect_url'),
						state: req.param('state')
					});
				}

				// Account is deleted
				if (account && account.deleted==1) {
					return res.view('auth/login', {
						title     	: 'Login | Sails Framework',
						loginError 	: true,
						loginErrorMsg: 'Your account has been deleted.',
						email     	: req.param('email'),
						api_key 	: req.param('api_key'),
						response_type: req.param('response_type'),
						redirect_url: req.param('redirect_url'),
						state: req.param('state')
					});
				}

				// The account was found and the password matches the hashed user password.
				if(account && AuthenticationService.checkPassword(secretAttempt, account.password)) {

					// Store authenticated state in session
					AuthenticationService.session.link(req, account);
					
					// If we're given an API key, check that it's valid, and act accordingly
					if (req.param('api_key')) {
						Developer.find({where:{api_key:req.param('api_key')}}).done(function(err, developer){
							if (developer !== null) {
								return AuthController.verifyapi(req, res, null, developer);
							} else {
								return res.send(500);
							}
						});
					}
					// Otherwise do the appropriate redirection
					else {
						/*Check wether super admin*/
						if(account.isSuperAdmin != 1){
							/*Check for subscription duration afzal*/
							var sql = "SELECT id FROM transactiondetails WHERE DATE_FORMAT(DATE_ADD(DATE(createdAt), INTERVAL duration MONTH),'%Y-%m-%d') > CURDATE() AND is_deleted=0 AND account_id=?";          
        					sql = Sequelize.Utils.format([sql,account.id]);

        					sequelize.query(sql, null, {
          						raw: true
        					}).success(function(transaction) {

          						if(transaction.length){
          							AuthenticationService.session.redirectToOriginalDestination(req, res);
          						}else{
          							return res.view('auth/login', {
										title     	: 'Login | Sails Framework',
										loginError 	: true,
										loginErrorMsg: 'Your subscription plan is outdated. Please subscribe to login.',
										email     	: req.param('email'),
										api_key 	: req.param('api_key'),
										response_type: req.param('response_type'),
										redirect_url: req.param('redirect_url'),
										state: req.param('state')
									});
          						}
      						});
        				}else{
        					AuthenticationService.session.redirectToOriginalDestination(req, res);
        				}
					}

				// The user was not found. Send back the auth view with json.
				} else {
					res.view('auth/login', {
						title     : 'Login | Sails Framework',
						loginError: true,
						loginErrorMsg: "Sorry - either your email address or password does not match our records. Please try a different combination.",
						email     : req.param('email'),
						api_key: req.param('api_key'),
						response_type: req.param('response_type'),
						redirect_url: req.param('redirect_url'),
						state: req.param('state')
					});
				}
			});
		} else {
			if (secretAttempt && secretAttempt.length > 0) {
				loginError = true;
				loginErrorMsg = 'Please specify a password.';
			} else {
				loginError = false;
				loginErrorMsg = '';
			}
			res.view('auth/login', {
				loginError: loginError,
				loginErrorMsg: loginErrorMsg,
				email     : req.param('email'),
				api_key: req.param('api_key'),
				response_type: req.param('response_type'),
				redirect_url: req.param('redirect_url'),
				state: req.param('state')
			});
		}
	},

	verifyapi: function (req, res, next, developer) {
		
		// You should already be logged in if you're trying to verify a 3rd-party app
		if (req.session.authenticated !== true || !req.param('api_key')) {
			return res.redirect('/login');
		}

		// We need a valid redirect URL in order to complete the process
		// If a redirect_url was put in the request, use that as the redirect address
		if (req.param('redirect_url')) {
			req.session.reroutedFrom = req.param('redirect_url');
		}
		// Otherwise use the one from the developer record in the db, if it exists
		else if (developer.redirect_url) {
			req.session.reroutedFrom = developer.redirect_url;
		}
		// Otherwise return an error
		else {
			return res.send(500,"No redirect url was present in the request.");
		}

		// If we didn't get here via the Verify API Access form, then show the form
		if (_.isUndefined(req.param('accept')) && _.isUndefined(req.param('deny'))) {
		
			async.auto({
				getDeveloper: function(cb) {
					// If we already have a developer record (because we're coming from the login screen)
					// then we'll use that
					if (!_.isUndefined(developer)) {
						cb(null, developer);
					} 
					// Otherwise, look one up using the API key we have
					else {
						Developer.find({where:{api_key:req.param('api_key')}}).done(cb);
					}
				},

				showForm: ['getDeveloper', function(cb, results) {
					var developer = results.getDeveloper;
					res.view('auth/verifyapi', {
						api_key: req.param('api_key'),
						response_type: req.param('response_type'),
						redirect_url: req.param('redirect_url'),
						state: req.param('state'),
						app_name: developer.app_name
					});
					cb();
				}]

			});
		}

		// Otherwise perform the accept / deny action
		else {
			// If the user accepted the 3rd-party app, we'll create an access token for them
			if (req.param('accept')) {
				var today = new Date();
				var code = AuthenticationService.randString(15);
				AccountDeveloper.create({
						api_key: req.param('api_key'),
						account_id: req.session.Account.id,
						code: code,
						access_token: AuthenticationService.randString(15),
						refresh_token: AuthenticationService.randString(15),
						code_expires: new Date(today.getTime() + 1000 * 30), // code expires in 30 seconds
						access_expires: new Date(today.getTime() + 1000 * 60 * 60), // access token expires in one hour
						refresh_expires: new Date(today.getTime() + 1000 * 60 * 60 * 24 * 14) // refresh token expires in 14 days
					}).done(function done (err, account) {
						// Redirect to the 3rd party app with the info they need to get the access token
						var url = req.session.reroutedFrom;
						url += "?code="+code;
						if (req.param('state')) {
							url += "&state="+req.param('state');
						}
						return res.redirect(url);
					});
			}
			// If the user denied the app, we'll let them know
			else {
				var url = req.session.reroutedFrom+"?error=access_denied&error_description=The+user+denied+access+to+your+application";
				return res.redirect(url);
			}
		}

	},

	authToken: function (req, res) {

		// Don't respond to GET
		if (req.method == 'GET') {
			return res.send(500);
		}

		// If we don't have all the info we need in the request, send an error
		if (!req.param('grant_type') || !req.param('client_id') || !req.param('client_secret')) {
			return res.json({
				error: "invalid_request",
				error_description: "Some elements of your request were missing; please specify client_id, client_secret and grant_type"
			});
		}

		// Test grant parameters
		if (req.param('grant_type') == 'authorization_code') {
			if (!req.param('code')) {
				return res.json({
					error: "invalid_request",
					error_description: "When using the 'authorization_code' grant type, 'code' parameter must be present"
				});
			}
		}
		else if (req.param('grant_type') == 'refresh_token') {
			if (!req.param('refresh_token')) {
				return res.json({
					error: "invalid_request",
					error_description: "When using the 'refresh_token' grant type, 'refresh_token' parameter must be present"
				});
			}
		}

		else {
			return res.json({
				error: "unauthorized_client"
			});
		}

		async.auto({

			getDeveloper: function(cb) {
				Developer.find({where:{api_key:req.param('client_id'), api_secret:req.param('client_secret')}}).done(cb);
			},

			getAccountDeveloper: ['getDeveloper', function(cb, results) {
				var developer = results.getDeveloper;
				// If we couldn't get a developer record, send back an error
				if (developer === null) {
					res.json({
						error: "invalid_client"
					});
					return cb();
				}
				// If the grant type is "authorization_code", then look up the AccountDeveloper record
				// using the supplied code
				if (req.param('grant_type') == 'authorization_code') {
					AccountDeveloper.find({where:{
						'code': req.param('code'),
						'api_key': req.param('client_id')
					}}).done(cb);
				}
				// Otherwise look it up using the refresh token
				else {
					AccountDeveloper.find({where:{
						'refresh_token': req.param('refresh_token'),
						'api_key': req.param('client_id')
					}}).done(cb);
				}
			}],

			validateAccessToken: ['getDeveloper', 'getAccountDeveloper', function(cb, results) {
				var accountDeveloper = results.getAccountDeveloper;
				if (accountDeveloper === null) {
					res.json({
						error: "invalid_grant",
						error_description: "No access token found for that access code."
					});
					return cb();
				}
				var now = new Date();

				// For "authorization_code" grant type
				if (req.param('grant_type') == 'authorization_code') {
					// If the code is over 30 seconds old, return an error
					if (accountDeveloper.code_expires < now) {
						res.json({
							error: "invalid_grant",
							error_description: "The authorization code you used is expired."
						});
						return cb();
					}
					// Looking good, so we'll return the auth token
					res.json({
						"access_token": accountDeveloper.access_token,
						"expires_in": 3600,
						"token_type": "bearer",
						"refresh_token": accountDeveloper.refresh_token
					});
					return cb();
				}

				// For "refresh_token" grant type
				else {
					if (accountDeveloper.refresh_expires < now) {
						res.json({
							error: "invalid_grant",
							error_description: "The refresh token you used is expired."
						});
						return cb();
					}
					// Create a new access token and new refresh token
					accountDeveloper.access_token = AuthenticationService.randString(15);
					accountDeveloper.refresh_token = AuthenticationService.randString(15);
					accountDeveloper.access_expires = new Date(now.getTime() + 1000 * 60 * 60); // access token expires in one hour
					accountDeveloper.refresh_expire =  new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14); // refresh token expires in 14 days
					accountDeveloper.save().success(function(ad){
						res.json({
							"access_token": accountDeveloper.access_token,
							"expires_in": 3600,
							"token_type": "bearer",
							"refresh_token": accountDeveloper.refresh_token
						});
						cb();
					});
				}
			}]
		});
	},

	// Logout of an Account
	logout: function(req, res, next) {
		req.session.reroutedFrom = null;
		AuthenticationService.session.unlink(req);
		res.redirect('/login');
	},

	// Reset password flow for a user.
	resetPassword: function(req, res, next) {

		// Handles sending the user to change their password.
		if(req.method == 'GET' && req.param('code')) {
			return Account.find({
				where: {
					verificationCode: req.param('code')
				}
			}).done(function(err, account) {
				// No account found?  Then bail.
				if (account === null) {
					return res.send("No verified account found!", 500);
				}
				// Unverified account found?  Show verification page.
				if (account.verified != 1) {
					return res.view('auth/verify', {
						title: 'Verify Account | Olympus',
						username: account.email,
						code: account.verificationCode,
						errors: null,
						post: {}
					});
				}
				// Show reset password page
				return res.view('auth/create_new_password',{code: account.verificationCode});
			});
		}

		// Just returns the reset password page.
		if(req.method == 'GET') {
			return res.view('auth/reset_password');
		}

		// Send the forgot password email and respond to the user.
		if(req.method == 'POST') {
		    if(req.params.emailid==undefined){
                        var email= req.param('email');
                    }else{
                        var email= req.params.emailid;
                    }
			
			Account.find({
				where: {
					email: email
				}
			}).done(function(err, account) {
				if (err || !account){
                                    if(req.params.emailid==undefined){
                                           return res.redirect("/auth/resetPassword?error=That email address doesn't exist.");
                                    }else{
                                           return res.json({message: 'That email address does not exist.'});
                                    }        
                                }
                    
				EmailService.sendForgotPasswordEmail({
					host: req.header('host'),
					account: account
				});
                                 if(req.params.emailid==undefined){
                                    res.view('auth/check_your_email', {
					message: 'An email has been sent to recover your password.'
                                    });
                                }else{
                                    return res.json({message: 'An email has been sent check your new password.'});
                                }
			});
		}
	},

	forgetPassword: function(req, res) {
            
            console.log(req.params.emailid);

		// Send the forgot password email and respond to the user.
		if(req.method == 'POST') {
			Account.find({
				where: {
					email: req.params.emailid
				}
			}).done(function(err, account) {
				if (err || !account) return res.json({message: 'That email address does not exist.'});
                                
                               var randPassword = AuthenticationService.randString(6);
                               var hashPassword =  AuthenticationService.hashPassword(randPassword);
                                
                                 var sql = "UPDATE account SET password=? WHERE email=?";
                                    sql = Sequelize.Utils.format([sql, hashPassword , req.params.emailid]);


                                    sequelize.query(sql, null, {
                                        raw: true
                                    }).success(function (accountdetails) {
                                
				EmailService.sendForgotPassword({
					host: req.header('host'),
					account: account,
					randPassword: randPassword,
				});
				return res.json({message: 'An email has been sent check your new password.'});
			});
                      });
		}
	},

	createPassword: function(req, res) {
		var password = req.param('prometheus');
		Account.find({
			where: {
				verificationCode: req.param('code')
			}
		}).success(function(account) {
			if (!account) {
				return res.send("No verified account found!", 500);
			}
			account.password = AuthenticationService.hashPassword(req.param('password'));
			account.verified = true;
			// Change verification code
			account.verificationCode = AuthenticationService.randString(15);
			account.save().success(function() {
				AuthenticationService.session.link(req, account);
				res.redirect('/');
			});
		});
	},
	
	// Activate a user via a verification link
	// When a user is added to the system indirectly (via a file being shared, for example)
	// an unverified account is created for them with a verification code.  By going to
	// the link /auth/verify?code=xxx they can activate their account.
	verify: function(req, res) {
		if(!req.param('code')) {
			return res.send('No verification code given!',500);
		}

		Account.find({
			where: {
				verificationCode: req.param('code')
			}
		}).success(function(account) {
			// If we couldn't find this account, redirect to home for now
			if(account === null) {
				return res.send('Verification code not found!',500);
			}
			// If the account's been verified, redirect to their default page
			// if(account.verified === true) {
			// 	res.redirect('/#overview');
			// 	return;
			// }


			// If the account exists but hasn't been verified, and the user isn't
			// submitting the verification form, show the form
			if(!req.param('submitted')) {
				return res.view('auth/verify', {
					title: 'Verify Account | Olympus',
					username: account.email,
					code: req.param('code'),
					errors: null,
					post: {}
				});
			}
			// Ok, so the user has submitted the form.  Let's validate and continue.
			var errors = [];

			// check the user entered there name
			if(req.param('full_name') === '') {
				errors.push("Please enter your real name!");
			}

			// check password and that the user entered the same one twice
			if(req.param('password') === '') {
				errors.push("Please enter a password!");
			} else if(req.param('password') !== req.param('confirm_password')) {
				errors.push("Your password entries didn't match!");
			}

			// check the terms of service is agreed to
			if (req.param('terms_of_service' !== 'agree')) {
				errors.push('You must agree to the terms of service!');	
			}

			// If we have errors, send them back to the form
			if(errors.length > 0) {
				_.shout("ERROR!", errors);
				errors = errors.join('<br/>');
				return res.view('auth/verify', {
					title: 'Verify Account | Olympus',
					username: account.email,
					code: req.param('code'),
					errors: errors,
					post: req.body
				});
			}
			// Otherwise, update their account, send them a proper welcome email,
			// log them in and redirect them to their new home!
			else {
				account.name = req.param('full_name');
				account.password = AuthenticationService.hashPassword(req.param('password'));
				account.title = req.param('job_title');
				account.phone = req.param('phone_number');
				// Change verification code
				account.verificationCode = AuthenticationService.randString(15);
				account.verified = true;
				account.save().done(function(err) {
					if (err) return res.send(500,err);
					
					AuthenticationService.session.link(req, account);

					// Send an email to the user we just verified, giving them their username / password
					var host = req.header('host');
					EmailService.sendVerifyEmail({
						host: host,
						account: account
					});
					// Broadcast the news to the world so they can update their UIs if necessary
					res.redirect('/');
				});
			}
		});
	},

	// Get the quota for all the workgroups of a particular account.
	quota: function (req, res) {
		if (req.param('id')) {
			Account.find(req.param('id')).done(function (err, account) {
				if (err) return res.json({error: err});
				DirectoryPermission.findAll({where:{AccountId: account.id}}	).done(function (err, perms) {
					Directory.findAll({where:_.map(perms, function (p) { return p.DirectoryId; })}).done(function (err, dirs) {
						if (err) return res.json({error:err});
						return res.json(_.map(dirs, function (dir) {
							 return {
							 	id: dir.id,
							 	name: dir.name,
							 	quota: dir.quota
							 };
						}));
					})
				})
			})
		}
	}
};
_.extend(exports, AuthController);
