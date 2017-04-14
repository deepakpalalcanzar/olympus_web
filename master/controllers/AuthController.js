var AuthController = {

// authLogin
	authLogin: function(req, res) {

		console.log('Auth/authLogin ------------------------------------------ Auth/authLogin');

		// return res.json({
		// 	error: "invalid_request",
		// 	error_description: "Invalid request. Check request method."
		// });

		var currenttime = Date.now || function() {
		  return +new Date;
		};

		requestid = currenttime();

		// console.log('BENCHMARKING LOG '+requestid+' 0: '+requestid);

// Only allow post requests
		if(req.method !== 'POST') return res.json({
				error: "invalid_request",
				error_description: "Invalid request. Check request method."
			});
// Ensure we have an API token
		if(!req.param('api_key')) return res.json({
				error: "invalid_request",
				error_description: "Check Api key."
			});

		var secretAttempt = req.param('password');

		// If a password was entered look for that user.
		if(secretAttempt == '' || secretAttempt.trim() == '') return res.json({
				error: "invalid_request",
				error_description: "Please specify a password."
			});

		var user_platform;
        if (req.headers.user_platform) {
            user_platform = req.headers.user_platform;
        } else {
            if (req.headers['user-agent']) {
                user_platform = req.headers['user-agent'];
            } else {
                user_platform = "Web Application";
            }
        }

        var user_ip = (typeof req.session.Account === 'undefined' && typeof req.session.Account === 'undefined') ? req.headers['ip'] : req.session.Account.ip;

		// Look up the Developer
		Developer.find({ where:{ api_key: req.param('api_key') }}).done(function(err, developer) {
			//if (err) return res.send(500,err);
			if (err) return res.json({
						error: "invalid_request",
						error_description: "Invalid api key."
					});

			// Look up the Account and verify the password
			Account.find({
				where: {
					email: req.param('email'),
					deleted: false
				}
			}).done(function(err, account) {
				//if (err) return res.send(500,err);
				if (err) return res.json({
						error: "invalid_email",
						error_description: "No account exist with that email."
					});

				if(!account){
					//Check for LDAP account if exists
					SiteSettings.find({ where:{ id: '1' }}).done(function(err, ldapopt) {

						if(ldapopt && ldapopt.ldapOn){

							sails.controllers.auth.ldapADSync(false, true, ldapopt, req.param('email'), secretAttempt, user_platform, user_ip, function (err, error_desc, response_id, cn) {
								if(err){
									// if(typeof err.name != 'undefined'){
									// 	console.log('AD Error:', err.name);//AD error
									// }else{
									// 	console.log(err);
									// }
									return res.json({
										error: err,
										error_description: error_desc
									});
								}

								console.log('Logged in with ldap/AD.111');
								// We have a good developer and a valid account
								// Let's generate an access token
								var today = new Date();
								var code = AuthenticationService.randString(15);
								async.auto({
					                getAdapter: function(cb) {

					                    UploadPaths.find({where:{isActive:1}}).done(cb);
					                },
					                showForm: ['getAdapter', function(cb, up) {
					                    // console.log('asyncResultsasyncResultsasyncResultsasyncResultsasyncResults');
					                    console.log(up.getAdapter);
					                    adapter = up.getAdapter.type;
					                    // options.uploadpath = up.getAdapter.path;

					                    AccountDeveloper.create({

											api_key 		: req.param('api_key'),
											//account.id is undefined here, use response_id
											account_id 		: response_id,//response.body.account.id,
											code 			: code,
											access_token 	: AuthenticationService.randString(15),
											refresh_token 	: AuthenticationService.randString(15),
											code_expires 	: new Date(today.getTime() + 1000 * 30), // code expires in 30 seconds
											access_expires 	: new Date(today.getTime() + 1000 * 60 * 60 * 30), // access token expires in one(three) hour
											// access_expires 	: new Date(today.getTime() + 1000 * 60 * 5), // access token expires in 2 minutes
											refresh_expires : new Date(today.getTime() + 1000 * 60 * 60 * 24 * 14) // refresh token expires in 14 days

										}).done(function done (err, accountDev) {
											// if(err) res.send(500);

											if(err) return res.json({
												error: "invalid_request",
												error_description: "Some Error Occurred."
											});
											res.json({
												access_token: accountDev.access_token,
												expires_in: 108000,//120,//10800,//3600
												token_type: "bearer",
												refresh_token: accountDev.refresh_token,
												is_enterprise: 0,//account.is_enterprise ==> as no enterprise is registering with ldap for now
												adaptor: adapter,//sails.config.fileAdapter.adapter
											});
										});
									// // Store authenticated state in session
									// AuthenticationService.session.link(req, account);
									// AuthenticationService.session.redirectToOriginalDestination(req, res);
					                }]
					            });
							});
						}else{
							// return res.send(500);
							return res.json({
								error: "invalid_email",
								error_description: "Account with that email is either deleted or not accessible."
							});
						}
					});
				}else{//if(account)
					console.log('account.verified !=1 :', account.verified !=1);
					//if account is not verified then also check if it is not an ldap/AD account
					if( account.verified !=1 || ( account && (account.isLdapUser == '1' || account.isADUser == '1') ) ){

						//Check for LDAP account if exists
						SiteSettings.find({ where:{ id: '1' }}).done(function(err, ldapopt) {

							if(ldapopt && ldapopt.ldapOn && ( account.verified !=1 || ((ldapopt.ServiceType == '1' && account.isLdapUser == '1') || (ldapopt.ServiceType == '2' && account.isADUser == '1')) ) ){
								sails.controllers.auth.ldapADSync(account, true, ldapopt, req.param('email'), secretAttempt, user_platform, user_ip, function (err, error_desc, response_id, cn) {
									if(err){
										// if(typeof err.name != 'undefined'){
										// 	console.log('AD Error:', err.name);//AD error
										// }else{
										// 	console.log(err);
										// }
										if (account && account.verified!=1) {//If account was just not verified
											return res.json({
												error: err,
												error_description: (err == "invalid_email")?'Your account has not been verified yet.  Please check your email.':error_desc,
											});
										}else{
											return res.json({
												error: err,
												error_description: error_desc
											});
										}
									}

									console.log('Logged in with ldap/AD.222');
									// We have a good developer and a valid account
									// Let's generate an access token
									var today = new Date();
									var code = AuthenticationService.randString(15);
									async.auto({
										checkVerified: function(cb){//check if account was verified
											if(account && account.verified!=1){
												//mark as verified and ldap/AD account
												if(ldapopt.ServiceType == '1'){//ldap
													account.isLdapUser = 1;
												}else{
													account.isADUser = 1;
												}
												account.verified = 1;
												account.save().success(function(ad){

													var request = require('request');
													var options = {
									                    uri: 'http://localhost:1337/directory/createWorkgroup/',
									                    method: 'POST',
									                };

									                options.json = {
									                    account_name: cn,
									                    account_id: account.id
									                };

									                request(options, function (err, response, body) {
									                    if (err)
									                        return res.json({error: err.message, type: 'error'}, response && response.statusCode); 			      			// res.send(200);
									                    console.log('9999999999999999999999999999999999999999');
									                });
													cb();
												});
											}else{
												cb();
											}
										},
						                getAdapter: function(cb) {

						                    UploadPaths.find({where:{isActive:1}}).done(cb);
						                },
						                showForm: ['getAdapter', function(cb, up) {
						                    // console.log('asyncResultsasyncResultsasyncResultsasyncResultsasyncResults');
						                    console.log(up.getAdapter);
						                    adapter = up.getAdapter.type;
						                    // options.uploadpath = up.getAdapter.path;

						                    AccountDeveloper.create({

												api_key 		: req.param('api_key'),
												//Do not use response_id here, it always comes true i.e. true
												account_id 		: account.id,//response.body.account.id,
												code 			: code,
												access_token 	: AuthenticationService.randString(15),
												refresh_token 	: AuthenticationService.randString(15),
												code_expires 	: new Date(today.getTime() + 1000 * 30), // code expires in 30 seconds
												access_expires 	: new Date(today.getTime() + 1000 * 60 * 60 * 30), // access token expires in one(three) hour
												// access_expires 	: new Date(today.getTime() + 1000 * 60 * 5), // access token expires in 2 minutes
												refresh_expires : new Date(today.getTime() + 1000 * 60 * 60 * 24 * 14) // refresh token expires in 14 days

											}).done(function done (err, accountDev) {
												// if(err) res.send(500);

												if(err) return res.json({
													error: "invalid_request",
													error_description: "Some Error Occurred."
												});
												res.json({
													access_token: accountDev.access_token,
													expires_in: 108000,//120,//10800,//3600
													token_type: "bearer",
													refresh_token: accountDev.refresh_token,
													is_enterprise: 0,//account.is_enterprise ==> as no enterprise is registering with ldap for now
													adaptor: adapter,//sails.config.fileAdapter.adapter
												});
											});
										// // Store authenticated state in session
										// AuthenticationService.session.link(req, account);
										// AuthenticationService.session.redirectToOriginalDestination(req, res);
						                }]
						            });
								});
							}else{//ldap could not be connected or is disabled
								return res.json({
									error: "invalid_password",
									error_description: "Password entered does not match."
								});
							}
						});
					}else{

						if(account && account.verified==1){
							console.log('AuthenticationService.checkPasswordcheckPasswordcheckPassword', req.param('password'), account.password);
							// console.log('BENCHMARKING LOG '+requestid+' 1: '+currenttime());
							//Do nothing, continue
							AuthenticationService.checkPassword(req.param('password'), account.password, function(err, matches){

								if (err || !matches) { //return res.send(500);
									return res.json({
										error: "invalid_password",
										error_description: "Password entered does not match."
									});
								}
	// console.log('testttttttttttttttttttttttt-----------11111111111111111');
	// console.log('BENCHMARKING LOG '+requestid+' 2: '+currenttime());
								// We have a good developer and a valid account
								// Let's generate an access token
								var today = new Date();
								var code = AuthenticationService.randString(15);
	// console.log('BENCHMARKING LOG '+requestid+' 3: '+currenttime());
								async.auto({
					                getAdapter: function(cb) {
	// console.log('BENCHMARKING LOG '+requestid+' 3: '+currenttime());
					                    UploadPaths.find({where:{isActive:1}}).done(cb);
					                },
					                showForm: ['getAdapter', function(cb, up) {
	// console.log('BENCHMARKING LOG '+requestid+' 4: '+currenttime());
					                    // console.log('asyncResultsasyncResultsasyncResultsasyncResultsasyncResults');
					                    // console.log(up.getAdapter);
					                    adapter = up.getAdapter.type;
					                    // options.uploadpath = up.getAdapter.path;

					                    AccountDeveloper.create({

											api_key 		: req.param('api_key'),
											account_id 		: account.id,
											code 			: code,
											access_token 	: AuthenticationService.randString(15),
											refresh_token 	: AuthenticationService.randString(15),
											code_expires 	: new Date(today.getTime() + 1000 * 30), // code expires in 30 seconds
											access_expires 	: new Date(today.getTime() + 1000 * 60 * 60 * 30), // access token expires in one(three) hour
											// access_expires 	: new Date(today.getTime() + 1000 * 60 * 5), // access token expires in 2 minutes
											refresh_expires : new Date(today.getTime() + 1000 * 60 * 60 * 24 * 14) // refresh token expires in 14 days

										}).done(function done (err, accountDev) {
									// console.log('BENCHMARKING LOG '+requestid+' 5: '+currenttime());
											// if(err) res.send(500);
											if(err) return res.json({
												error: "invalid_request",
												error_description: "Some Error Occurred."
											});
											res.json({
												access_token: accountDev.access_token,
												expires_in: 108000,//120,//10800,//3600
												token_type: "bearer",
												refresh_token: accountDev.refresh_token,
												is_enterprise: account.is_enterprise,
												adaptor: adapter,//sails.config.fileAdapter.adapter
											});
										});
					                }]
					            });
							});
						}else{
							return res.json({
								error: "invalid_request",
								error_description: "Your account has not been verified yet.  Please check your email."
							});
						}
					}
				}
			});
		});

	},

	// Login to an Account
	login: function(req, res) {

		console.log('Auth/login ------------------------------------------ Auth/login');

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

		var user_platform;
        if (req.headers.user_platform) {
            user_platform = req.headers.user_platform;
        } else {
            if (req.headers['user-agent']) {
                user_platform = req.headers['user-agent'];
            } else {
                user_platform = "Web Application";
            }
        }

        var user_ip = (typeof req.session.Account === 'undefined' && typeof req.session.Account === 'undefined') ? req.headers['ip'] : req.session.Account.ip;
		// If a password was entered look for that user.
		if(secretAttempt && secretAttempt.trim() != '') {// || secretAttempt === '' Rishabh, AD accepts empty passwords to login user

			Account.find({
				where: {
					email: req.param('email'),
					deleted: false
				}
			}).done(function(err, account) {

				if (err) return res.send(500,err);

				if(account && (account.isLdapUser == '1' || account.isADUser == '1')){

					//Check for LDAP account if exists
					SiteSettings.find({ where:{ id: '1' }}).done(function(err, ldapopt) {

						if(ldapopt && ldapopt.ldapOn && ((ldapopt.ServiceType == '1' && account.isLdapUser == '1') || (ldapopt.ServiceType == '2' && account.isADUser == '1')) ){

							sails.controllers.auth.ldapADSync(account, false, ldapopt, req.param('email'), secretAttempt, user_platform, user_ip, function (err, error_desc, ldapaccount, cn) {
								if(err){
									console.log(err);

									return res.view('auth/login', {
										title     : 'Login | Sails Framework',
										loginError: true,
										loginErrorMsg: error_desc,//"Sorry - Some error Occurred. Please try again."
										// loginErrorMsg: "Sorry - either your email address or password does not match our records. Please try a different combination.",
										email     : req.param('email'),
										api_key: req.param('api_key'),
										response_type: req.param('response_type'),
										redirect_url: req.param('redirect_url'),
										state: req.param('state')
									});
								}

								console.log('Logged in with ldap/AD.333');
								//Logged in Successfully
								// Store authenticated state in session
								AuthenticationService.session.link(req, account);
								AuthenticationService.session.redirectToOriginalDestination(req, res);
							});
						}else{
							//Do nothing, continue
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
				}else{

					//IGNORED NOW: as deleted is already checked above in Account.find:where
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
					//account verified is avoided here and checked at last after checking ldap and AD accounts
					if(account && account.verified==1) {// && AuthenticationService.checkPassword(secretAttempt, account.password)

						console.log('checkPasswordcheckPasswordcheckPasswordcheckPassword');
						AuthenticationService.checkPassword(secretAttempt, account.password, function(err, matches){

							console.log('checkPasswordcheckPasswordcheckPasswordcheckPassword2222');
							console.log(err);
							// console.log(hash);
							if (err || !matches) { //return res.send(500);

								console.log('checkPasswordcheckPasswordcheckPasswordcheckPasswordERRORERRORERROR');
								//Do nothing, continue
								return res.view('auth/login', {
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

							console.log('checkPasswordcheckPasswordcheckPasswordcheckPassword3333');
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
						});
					// The user was not found. Send back the auth view with json.

					} else {//if(!account || account.verified != 1)
							//Check for LDAP account if exists
							SiteSettings.find({ where:{ id: '1' }}).done(function(err, ldapopt) {


								if(ldapopt && ldapopt.ldapOn){

									sails.controllers.auth.ldapADSync((account && account.verified!=1)?account:false, false, ldapopt, req.param('email'), secretAttempt, user_platform, user_ip, function (err, error_desc, ldapaccount, cn) {
										if(err){
											console.log(err);

											// Account not verified
											if (account && account.verified!=1) {//If account was just not verified

												return res.view('auth/login', {
													title     	: 'Login | Sails Framework',
													loginError 	: true,
													//Below Line: if an unverified account is present in ldap/AD then do not display that your account is not verified
													loginErrorMsg: (err == "invalid_email")?'Your account has not been verified yet.  Please check your email.':error_desc,
													email     	: req.param('email'),
													api_key 	: req.param('api_key'),
													response_type: req.param('response_type'),
													redirect_url: req.param('redirect_url'),
													state: req.param('state')
												});
											}else{//If account is not present in olympus at all
												return res.view('auth/login', {
													title     : 'Login | Sails Framework',
													loginError: true,
													loginErrorMsg: error_desc,//"Sorry - Some error Occurred. Please try again."
													// loginErrorMsg: "Sorry - either your email address or password does not match our records. Please try a different combination.",
													email     : req.param('email'),
													api_key: req.param('api_key'),
													response_type: req.param('response_type'),
													redirect_url: req.param('redirect_url'),
													state: req.param('state')
												});
											}
										}

										console.log('Logged in with ldap/AD.444');
										//Logged in Successfully
										// Store authenticated state in session
										if(account && account.verified!=1){
											//mark as verified and ldap/AD account
											if(ldapopt.ServiceType == '1'){//ldap
												account.isLdapUser = 1;
											}else{
												account.isADUser = 1;
											}
											account.verified = 1;
											account.save().success(function(ad){

												var request = require('request');
												var options = {
								                    uri: 'http://localhost:1337/directory/createWorkgroup/',
								                    method: 'POST',
								                };

								                options.json = {
								                    account_name: cn,
								                    account_id: account.id
								                };

								                request(options, function (err, response, body) {
								                    if (err)
								                        return res.json({error: err.message, type: 'error'}, response && response.statusCode); 			      			// res.send(200);
								                    console.log('9999999999999999999999999999999999999999');
								                });
												AuthenticationService.session.link(req, account);
												AuthenticationService.session.redirectToOriginalDestination(req, res);
											});
										}else{
											AuthenticationService.session.link(req, ldapaccount);
											AuthenticationService.session.redirectToOriginalDestination(req, res);
										}
										// AuthenticationService.session.link(req, ldapaccount);
										// AuthenticationService.session.redirectToOriginalDestination(req, res);
									});

								}else{
								if (account && account.verified!=1) {//If account was just not verified
									return res.view('auth/login', {
										title     : 'Login | Sails Framework',
										loginError: true,
										//Below Line: if an unverified account is present in ldap/AD then do not display that your account is not verified
										loginErrorMsg: 'Your account has not been verified yet.  Please check your email.',
										email     : req.param('email'),
										api_key: req.param('api_key'),
										response_type: req.param('response_type'),
										redirect_url: req.param('redirect_url'),
										state: req.param('state')
							});
						}else{
							//Do nothing, continue
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
					}
					});
					}
				}
			});
		} else {
			if (req.param('email') && (secretAttempt == '' || secretAttempt.trim() == '')) {
				loginError = true;
				loginErrorMsg = 'Please specify a password.';
			} else{
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

	ldapADSync: function(account, isAPI, ldapopt, accountEmail, accountPassword, user_platform, user_ip, callback){
									console.log('LDAP is enabled');

									var ldap = require('ldapjs');
									var assert = require('assert');

									var client = ldap.createClient({
									  // url: 'ldap://192.207.61.16'
									  url: 'ldap://'+ldapopt.ldapServerIp,
									  timeout: 4000,
									  connectTimeout: 4000,
									  idleTimeout: 4000
									});

									/*client.bind('cn=Manager,dc=server,dc=world', 'openldap', function(err) {
									  console.log('--------------BINDING--------------');
									  console.log(err);
									  assert.ifError(err);
									});*/

									console.log('--------------Connecting LDAP:TRUE--------------');

									var adminname = ldapopt.ldapAdmin;
									if(ldapopt.ServiceType == '1'){
										adminname = ldapopt.ldapAdmin;
									}else if(ldapopt.ServiceType == '2'){
										adminname = ldapopt.ldapAdmin+'@'+ldapopt.ldapBaseDN;
									}

									client.bind(adminname, ldapopt.ldapPassword, function(err) {

									  	console.log('--------------BINDING--------------');

									  	if(err){
									  		callback('invalid_admin_credentials', "Sorry - Some error Occurred. Please try again.", null);
									  	}else{

										  	var opts = {};
											var basednstr = '';
											console.log(typeof ldapopt.serviceType);
											console.log(ldapopt.ServiceType);

											if(ldapopt.ServiceType == '1'){//ldap

												opts = {
												  filter: '&(objectClass=*)(mail='+req.param('email')+')',//'&(objectClass=*)(mail=rishabh@test.com)(uid=rchauhan)',
												  scope: 'sub',
												  attributes: '*'
												};

												if(typeof ldapopt.ldapOU != 'undefined'){
													basednstr = 'ou='+ldapopt.ldapOU+','+ldapopt.ldapBaseDN;
												}else{
													basednstr = ''+ldapopt.ldapBaseDN;
												}
											}else if(ldapopt.ServiceType == '2'){//AD

												opts = {
												  // filter: '&(objectClass=*)(mail='+req.param('email')+')',//'&(objectClass=*)(mail=rishabh@test.com)(uid=rchauhan)',
												  filter: "(userPrincipalName=" + accountEmail + ")",
												  scope: 'sub',
												  // attributes: '*'
												};
												basednstr = "dc=" + ldapopt.ldapBaseDN.replace(/\./g, ",dc=");
											}

											console.log('basednstr'+basednstr);
											console.log(opts);

											client.search(basednstr, opts, function(err, resclient) {
											  if(err){
											  	callback('invalid_email',"Account with that email is either deleted or not accessible.", null);

									  		  }else{
												  var isentryfound = false;

												  resclient.on('searchEntry', function(entry) {

												    // console.log('entry: ' + JSON.stringify(entry.object));
												    isentryfound = true;
												    var entry_object;

												    if(ldapopt.ServiceType == '1'){//ldap
												    	entry_object 	= {
												    		'user'  	: entry.object.dn,
												    		'cn'		: entry.object.cn,
												    		'mail'		: entry.object.mail,
												    		'password' 	: 'ldapuser',
												    		'isLdapUser': 1,
												    		'isADUser'	: false
												    	};
												    }else if(ldapopt.ServiceType == '2'){//AD
												    	entry_object 	= {
												    		'user'  	: entry.object.dn,//entry.object.userPrincipalName
												    		'cn'		: entry.object.cn,
												    		'mail'		: entry.object.userPrincipalName,
												    		'password' 	: 'aduser',
												    		'isLdapUser': false,
												    		'isADUser'	: 1
												    	};
												    }

												    if(ldapopt.ServiceType == '2' && ldapopt.ldapOU && ldapopt.ldapOU.trim() != ''){
												    	// $.each(entry.object.memberOf,)
												    	console.log(typeof ouList);
												    	console.log(ouList);
												    	var ouList = entry.object.memberOf;
												    	var matches = [];
												    	if(typeof ouList == 'undefined'){
												    		callback('invalid_password',"Sorry - only '"+ldapopt.ldapOU+"' users can login here.", null);
												    	}else if (ouList.constructor === Array){//if array
												    		matches = _.filter( entry.object.memberOf, function( s ) {
													    		return s.indexOf( 'CN='+ldapopt.ldapOU+',' ) !== -1;
													    	});
												    	}else{
													    	if(ouList.indexOf( 'CN='+ldapopt.ldapOU+',' ) !== -1){
													    		matches = ouList;
													    	}
												    	}
												    	console.log('matchesmatchesmatchesmatchesmatchesmatches');
												    	console.log(matches);
												    }

												    if(ldapopt.ServiceType == '2' && ldapopt.ldapOU && ldapopt.ldapOU.trim() != '' && matches.length == 0){
										                // return res.json({error: err.message, type: 'error'}, response && response.statusCode);

										                callback('invalid_password',"Sorry - only '"+ldapopt.ldapOU+"' users can login here.", null);
											    	}else{//if ldapopt.ServiceType == '1' || matches.length > 0
													    client.bind(entry_object.user, accountPassword, function(err) {

														  	if(err){
														  		callback('invalid_password', "Password entered does not match.", null);
														  	}else{

														  		if( !account ){//New to olympus
															  		Subscription.find({
																		where: [' is_default = 1' ],
																	}).success(function (subscription) {
																	// Save to transactionDetails table

																		var request = require('request');
																        var options = {
																            uri: 'http://localhost:1337/account/register/',
																            method: 'POST',
																        };

																        options.json = {
																            name: entry_object.cn,
																            email: entry_object.mail,
																            isVerified: true,
																            isAdmin: false,
																            password: entry_object.password,
																            isLdapUser: entry_object.isLdapUser,
																            isADUser: entry_object.isADUser
																            // created_by: req.session.Account.id,
																            // workgroup: req.params.workgroup,
																            // title: req.params.title,
																            // subscription: req.params.subscription,
																            // quota: req.params.quota,
																            // created_by_name: req.session.Account.name, //for logging
																        };

																        if(subscription){
																        	options.json.subscription = subscription.id;
																        	options.json.quota = ""+subscription.quota+"";
																        }

																        request(options, function (err, response, body) {

																            if (err){
																                // return res.json({error: err.message, type: 'error'}, response && response.statusCode);
																                callback("invalid_email", "Account with that email is either deleted or not accessible.", null)
																            }
																//        Resend using the original response statusCode
																//        use the json parsing above as a simple check we got back good stuff
																            //res.json(body, response && response.statusCode);

																            //save data to transactiondetails table
																            if(response.body.email_msg != 'email_exist'){
																	            /*Create logging*/
																	            var opts = {
																	                uri: 'http://localhost:1337/logging/register/',
																	                method: 'POST',
																	            };

																	            opts.json = {
																	                user_id: '',
																	                text_message: 'New LDAP account is created.',
																	                activity: 'newldapaccount',
																	                on_user: typeof (body.account) === 'undefined' ? body.id : body.account.id,
																	                ip: user_ip,
																	                platform: user_platform,
																	            };

																	            console.log('################## Create LDAP User  ###############');
																	            console.log(user_platform);
																	            console.log('################### Create LDAP User ####################');


																	            request(opts, function (err1, response1, body1) {
																	                // if (err)
																	                //     return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);

																	                // res.json({'success': '1'});
																	            });
																	            /*Create logging*/

																                // Save to transactionDetails table
																                var tran_options = {
																                    uri: 'http://localhost:1337/transactiondetails/register/',
																                    method: 'POST',
																                };

																                var created_date = new Date();
																                tran_options.json = {
																                    trans_id: 'ldapadmin',
																                    account_id: response.body.account.id,
																                    created_date: created_date,
																                    users_limit: subscription.users_limit,
																                    quota: subscription.quota,
																                    plan_name: subscription.features,
																                    plan_id         : subscription.id,
																                    price: subscription.price,
																                    duration: subscription.duration,
																                    paypal_status: '',
																                };

																                request(tran_options, function (err1, response1, body1) {
																                    // if (err1)
																                    //     return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);
																                    // //        Resend using the original response statusCode
																                    // //        use the json parsing above as a simple check we got back good stuff
																                    // // res.json(body, response && response.statusCode);

																                    console.log(response.body.account);//{ name: 'Rishabh Chauhan', email: 'rishabh@test.com', id: 8 }

																                    //isAPI
																                    if(isAPI){
																                    	callback(null, null, response.body.account.id);
																                    }else{
																                    	Account.find({//Check if it is needed or not
																							where: {
																								email: response.body.account.email
																							}
																						}).done(function(err, account) {

																							callback(null, null, account, entry_object.cn);
																						});
																                    }
																                });
																	            // end transaction history
																	        }else{
																	        	Account.find({
																					where: {
																						email: response.body.email
																					}
																				}).done(function(err, account) {

																					callback(null, null, account, entry_object.cn);
																				});
																	        }

																        });
																	});
																}else{//Account already added to olympus
																	callback(null, null, true, entry_object.cn);//just return that password was correct
																}
														    }
														});
													}

											    	/*var pattern = /{(.*)}(.*)/g;//{MD5}4QrcOUm6Wau+VuBX8g+IPg==
											    	match = pattern.exec(entry.object.userPassword);
											    	var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};
		console.log('matchmatchmatchmatchmatch');
		console.log(match);
		// // console.log(Base64.encode(123456));
		// console.log(Base64.encode('123456'));
		// console.log((Base64.decode(match[2])).toString(16));
												  	if(match[1] == 'MD5'){
												  		var crypto = require('crypto');
														mdpass = crypto
															.createHash('MD5')
															.update(secretAttempt);
														console.log(mdpass);
														console.log('md5md5md5md5md5md5md5');
												  	}*/
												    // if(entry.object.userPassword == md)
												  });
												  resclient.on('searchReference', function(referral) {
												    console.log('referral: ' + referral.uris.join());
												  });
												  resclient.on('error', function(err) {
												    console.error('error: ' + err.message);
												  });
												  resclient.on('end', function(result) {
												    console.log('status: ' + result.status);
												    if(!result.status && !isentryfound){
												    	callback("invalid_email", "Account with that email is either deleted or not accessible.", null);
												    }
												  });
											  }
											});
										}
									});
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
						access_expires: new Date(today.getTime() + 1000 * 60 * 60 * 30), // access token expires in one hour
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
						"expires_in": 108000,
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
					accountDeveloper.access_expires = new Date(now.getTime() + 1000 * 60 * 60 * 30); // access token expires in one hour
					accountDeveloper.refresh_expire =  new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14); // refresh token expires in 14 days
					accountDeveloper.save().success(function(ad){
						res.json({
							"access_token": accountDeveloper.access_token,
							"expires_in": 108000,
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

				EmailServices.sendEmail('forgotpasswordemail',{
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

				EmailServices.sendEmail('forgotpassword',{
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

		var request = require('request');

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

				var options = {
                    uri: 'http://localhost:1337/directory/createWorkgroup/',
                    method: 'POST',
                };

                options.json = {
                    account_name: req.param('full_name'),
                    account_id: account.id
                };

                request(options, function (err, response, body) {
                    if (err)
                        return res.json({error: err.message, type: 'error'}, response && response.statusCode); 			      			// res.send(200);
                    console.log('9999999999999999999999999999999999999999');
                });
                // callback(null, inode, newAccount);




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
					EmailServices.sendEmail('verify',{
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
