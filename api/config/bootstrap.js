module.exports.bootstrap = function (bootstrap_cb) { 

								var schedule = require('node-schedule');
								Object.keys(sails.config.crontab).forEach(function(key) {
								    var val = sails.config.crontab[key];
								    schedule.scheduleJob(key, val);
								}); 

								async.parallel([ 

									function (cb) { 

// If default administrator already exists, get out 

										Account.find({ 

											where: {email: 'ihaveno@email.com'} 

										}).done(function (err, account) { 

											if (err) throw err;
											console.log('ACCOUNT FOUND:', account); 

											if (account.length !== 0) return cb && cb(); 

// Otherwise create a new administrator account 

												Account.create({ 

													name: 'Administrator', 

													title: 'Administrator', 
 
													email: 'ihaveno@email.com', 

													password: '123456', 

													isAdmin: true, 

													isSuperAdmin: true, 

													verified: true, 

													verificationCode: null, 

													avatar_fname: null, 

													avatar_mimetype: null, 

													enterprise_fsname: null 

												}).done(function done (err, account) { 

													if (err) throw err;
													console.log('ACCOUNT CREATE:', account); 

 // Now create a workgroup, assigning the new account as an admin 

													Subscription.create({ 

														features 	: 'Default Plan',

														price 		: '0',

														duration 	: '1200',

														users_limit : '5',

														is_default 	: true,

														is_active	: true,

														quota		: '100000000000'

													}).done(function done(err, subscription){ 

														if (err) throw err; 

														cb && cb(); 

													}); 

											}); 

										}); 

									}, 

									function (cb) { 

										// Also create a default API app developer 

										Developer.find({ 

											where: {api_key: '3y6gp1hz9de7cgvkn7xqjb3285p8udf2'} 

										}).done(function (err, developer) { 

											if (err) throw err; 

											if (developer.length > 0) { return cb && cb(); } 

											// Otherwise create a new administrator account 

											Developer.create({ 

												api_key: '3y6gp1hz9de7cgvkn7xqjb3285p8udf2', 

												api_secret: 'ctDv8bIUmdJtChHP357xJ1ZspKh32rwq', 

												app_name: 'Test API App', 

												redirect_url: 'http://www.pigandcow.com/olympus_test_api_app' 

											}).done(function done (err, developer) { 

												if (err) throw err; 

												AccountDeveloper.create({ 

													api_key: '3y6gp1hz9de7cgvkn7xqjb3285p8udf2', 

													account_id: 1, 

													code: '', 

													access_token: 'baudzVitCraHCB1', 

													refresh_token: 'abcdefg', 

													code_expires: '2020-01-01', 

													access_expires: '2020-01-01', 

													refresh_expires: '2020-01-01', 

													scope: 3 

												}).done(function done(err, accountdeveloper){ 

													if (err) throw err; 

													else return cb && cb(); 

												}); 

											}); 

										}); 

									} 

 								], function(err, results) {bootstrap_cb && bootstrap_cb();});

							};