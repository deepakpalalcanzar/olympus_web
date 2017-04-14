/*---------------------
  :: Directory
  -> controller
---------------------*/

var copy = require('../services/lib/directory/copy'),
  emailService = require('../services/email');

var DirectoryController = {

  /**
   * POST /folder/:id/copy
   *
   * Copies a directory and all it's contents over to a new destination.
   *
   * ACL should be done at the policy level before getting here
   * so we can just look up the Account by the `id` param.
   */

  copy: function(req, res) {

    if (!req.param('id')) {
      return res.json({
        error: new Error('Must include a folder id').message,
        type: 'error'
      }, 400);
    }

    // Force to make sure a dest directory ID is defined
    if (!req.param('dest')) {
      return res.json({
        error: new Error('Must include a dest Id').message,
        type: 'error'
      }, 400);
    }

    // Check to make sure this user has the proper permissions in the target directory
    var permissionCriteria = {
      AccountId: req.session.Account && req.session.Account.id,
      DirectoryId: req.param('dest'),
      type: ['admin', 'write']
    };

    DirectoryPermission.find(permissionCriteria).exec(function(err, perms) {
      if (err) return res.json({
        error: err.message,
        type: 'error'
      }, 400);
      if (perms.length < 1) return res.send(403);

      // Find the directory we will be copying
      Directory.findOne(req.param('id')).exec(function(err, directory) {
        // Set the name if it was passed in
        directory.name = req.param('name', directory.name);

        // Copy Directory and all it's children and permissions
        directory.copy(req.param('dest'), function(err, copiedDir) {
          if (err) return res.json({
            error: err.message,
            type: 'error'
          }, 400);
          res.json(copiedDir, 200);
        });

      });
    });
  },

  share: function(req, res) {
    var directoryId = req.params.id;
    var emails = req.param('emails', []);
    var type = req.param('type');

    if (!directoryId || emails.length === 0 || !type) {
      return res.json({
        error: 'No file id and/or emails and/or type specified',
        type: 'error'
      });
    }

    var globalDirectory;
    Directory.findOne(directoryId).then(function(directory) {

      globalDirectory = directory;

      sails.log('Found directory :: ', directory);

      // get accounts referenced by email, or create if they don't exist
      var accounts = emails.map(function(email) {
        return Account.findOne({
          email: email
        }).then(function(account) {
          console.log(account);
          console.log(type);
          if (account || type === 'revoke') return account;
          // return Account.createAccount({ email: email, isVerified: false, isAdmin: false }).then(function(account) {

             
          //   // send an invite email
          //   emailService.sendInviteEmail({
          //     accountName: req.session.Account && req.session.Account.name || 'Someone',
          //     account: account,
          //     inode: directory,
          //     nodeType: 'folder'
          //   }, function(err, data) {
          //     console.log(data);
          //     if (err) sails.log.warn(err);
          //   });

          //   return account;
          // });

            var options = {
                name       : email,
                email       : email,
                isAdmin     : false,
                isVerified  : false,
                created_by  : req.param('created_by') !== 'undefined' ? req.param('created_by') : '',
                subscription_id : '1',
                title           : "OLYMPUS",
                ip              : "50.19.74.171",
                is_enterprise   : req.param('is_enterprise') !== 'undefined' ? req.param('is_enterprise') : '',
            };

            Account.createAccount(options, function(err, account) {

    // send an invite email
                emailService.sendInviteEmail({
                    accountName: req.session.Account && req.session.Account.name || 'Someone',
                    account: account,
                    inode: directory,
                    nodeType: 'folder'
                }, function(err, data) {
                    if (err) sails.log.warn(err);
                });
                 // return account;
            });

        }).fail(function(err) {
          return null;
        });
      });

      return accounts;
    }).all().then(function(accounts) {
      accounts.map(function(account) {
        if (!account) return;

        // grant file permissions
        globalDirectory.share(type, account.id, true);
      });
    }).then(function() {

      res.json({
        status: 'ok'
      });

    }).fail(function(err) {
      res.json({
        error: 'file not found',
        type: 'error'
      });
    });
  },


  getQuota: function(req, res) {
    var id = req.param('folderId');

    if (!id) return res.json({
      error: new Error('No folder id specified').message,
      type: 'error'
    }, 400);

    Directory.findOne(id).then(function(dir) {
      if (!dir) {
        return res.json({
          error: 'Directory not found',
          type: 'error'
        }, 400);
      }
      return res.json({
        quota: dir.quota
      });
    })

    .fail(function(err) {
      return res.json({
        error: err.message,
        type: 'error'
      }, 400);
    });

  },

  setQuota: function(req, res) {
    var id = req.param('folderId');
    var quota = req.param('quota');

    if (!id || !quota) return res.json({
      error: new Error('No folder id and/or quota specified').message,
      type: 'error'
    }, 400);

    Directory.findOne(id).then(function(dir) {
      if (!dir) {
        return res.json({
          error: 'Directory not found',
          type: 'error'
        }, 400);
      }
      dir.quota = quota;
      dir.save(function(err) {
        if (err) return res.json({
          error: err.message,
          type: 'error'
        }, 400);

        return res.json({
          quota: quota
        });
      });
    })

    .fail(function(err) {

      return res.json({
        error: err.message,
        type: 'error'
      }, 400);

    });
  },

    createWorkgroup: function(req, res){

        var dirOptions = {
            name : req.param('account_name') + '\'s Workgroup',
            quota: "1000000000"
        };

      var transOptions = {
          trans_id  : "default",
          account_id      : req.param('account_id'),
          created_date    : "2014-12-26 13:45:28" ,
          users_limit     : "10",
          quota           : "10",
          plan_name       : "Demo Plan",
          price           : "0",
          duration        : "12",
          paypal_status   : "",
      };

        Directory.createWorkgroup(dirOptions, req.param('account_id'), true, function (err, results) {
            
            if (err) return res.json({ error: err.message, type: 'error'}, 400);

            TransactionDetails.createAccount(transOptions, function(err, trans) {
                if (err) return res.json({ error: err.message, type: 'error'}, 400);
                return res.json({
                    type : 'succes',
                    directory : trans 
                });
            });

        });

    },







    //DRIVE functions
    authorize: function (drive_action, accountId, refresh_token, credentials, callback) {

        console.log('save_drive_token1111');
        var googleAuth = require('google-auth-library');

        // IF json Token file
        // var clientSecret = credentials.installed.client_secret;
        // var clientId = credentials.installed.client_id;
        // var redirectUrl = credentials.installed.redirect_uris[0];

        // IF from database
        var clientSecret = credentials.client_secret;
        var clientId = credentials.client_id;
        var redirectUrl = credentials.redirect_uris;

        var auth = new googleAuth();
        console.log(clientId);
        console.log(clientSecret);
        console.log(redirectUrl);
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        //change for different users
        // var TOKEN_PATH = sails.config.appPath + "/public/drive_tokens/" + 'drive-nodejs-quickstart.json';

        // Check if we have previously stored a token.
        // fs.readFile(TOKEN_PATH, function(err, token) {
        //     if (err) {
        //         console.log('drive_actiondrive_actiondrive_actiondrive_action'+drive_action);
        //         if(drive_action == 'check_drive_token'){
        //             DirectoryController.getNewToken(oauth2Client, callback);
        //         }else if(drive_action == 'save_drive_token'){
        //             DirectoryController.saveToken(refresh_token, oauth2Client, callback);
        //         }
        //     } else {
        //       oauth2Client.credentials = JSON.parse(token);
        //       console.log('oauth2Clientoauth2Clientoauth2Clientoauth2Client : ', oauth2Client);
        //       callback(oauth2Client, 1);
        //     }
        // });
        
        var cloud_options;
        
        if(drive_action == 'file_open_by_pathID' || drive_action == 'file_delete_by_pathID' || drive_action == 'file_upload_by_pathID'){
            cloud_options = { id: accountId };//account ID not available to shared account in subscription/pDownload nor do we need to fetch, we can make use of uploadPathId
        }else{
            cloud_options = { accountId: accountId };
        }

        cloudPaths.findOne(cloud_options).done(function (err, cloudpath) {

            if(err){
                console.log('CloudPaths.find ERROR: ', err);
                return;
            }
            
            if(drive_action == 'save_drive_token' ){
                if(cloudpath){
                    // cloudpath.access_token      = tokens.access_token;
                    // cloudpath.refresh_token     = tokens.refresh_token;
                    // cloudpath.token_type        = tokens.token_type;
                    // cloudpath.expiry_date       = tokens.expiry_date;

                    // cloudpath.save().success(function (model) {
                        
                    //     callback(oauth2Client, cloudpath.id);
                    // });
                    DirectoryController.saveToken(accountId, refresh_token, oauth2Client, cloudpath, callback);
                }else{
                    DirectoryController.saveToken(accountId, refresh_token, oauth2Client, null, callback);
                }
            }
console.log(cloudpath, 'cloudpath cloudpath cloudpath cloudpath cloudpath cloudpath cloudpath');
            if(cloudpath){
                oauth2Client.credentials = {
                    "access_token"      : cloudpath.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                    "refresh_token"     : cloudpath.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                    "token_type"        : cloudpath.token_type,//"Bearer",
                    "expiry_date"       : cloudpath.expiry_date,//1481041473357
                };
                // console.log(oauth2Client);
                if(drive_action == 'new_drive_token'){
                    // DirectoryController.refreshToken(accountId, refresh_token, oauth2Client, callback);
                    DirectoryController.refreshToken(oauth2Client, cloudpath, callback);
                    /*oauth2Client.refreshAccessToken(function(err, tokens){

                        if (err) {
                            console.log('Error while trying to refresh token', err);
                            return DirectoryController.getNewToken(oauth2Client, callback);
                            // return;
                        }

                        console.log('Refresh tokens: ', tokens);

                        oauth2Client.credentials = {
                            "access_token"      : tokens.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                            "refresh_token"     : tokens.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                            "token_type"        : tokens.token_type,//"Bearer",
                            "expiry_date"       : tokens.expiry_date,//1481041473357
                        };

                        cloudpath.access_token      = tokens.access_token;
                        cloudpath.refresh_token     = tokens.refresh_token;
                        cloudpath.token_type        = tokens.token_type;
                        cloudpath.expiry_date       = tokens.expiry_date;

                        cloudpath.save().success(function (model) {
                            
                            callback(oauth2Client, cloudpath.id);
                        });

                        // callback(oauth2Client, cloudpath.id);

                        // response.send({
                        //     access_token: tokens.access_token
                        // });
                    });*/
                }else{

                    console.log('oauth2Clientoauth2Clientoauth2Clientoauth2Client : ', oauth2Client);
                    // callback(oauth2Client, cloudpath.id);
                    DirectoryController.verifyToken(oauth2Client, cloudpath, callback);
                }
            }else{
                DirectoryController.getNewToken(oauth2Client, callback);
            }
        });
    },

    //author:Rishabh
    verifyToken: function (oauth2Client, cloudpath, callback){
      // var access_token = 'ya29.Ci-1A8g7K0Se1Kn5hP7agX6BdoRBauY3h2WUBtr5nkFSIKJUuXOe_AksAQG7PrXw7g';

      var http = require('https');
      var url = 'www.googleapis.com';;

      var options = {
        host: url,
        port: 443,
        path: '/oauth2/v1/tokeninfo?access_token='+oauth2Client.credentials.access_token,
        method: 'GET',
        // headers: { //We can define headers too
        //   'X-Auth-Token': 'ade8654ab03e4e1c9e141811310ab7e1'//'10ab820c435e4dae83ee7b2b2454812d'//'9d3f0e39c220458b83c43c85c8a7b2da'
        // },
        rejectUnauthorized: false
      };

      http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        // res.setEncoding('utf8');
        res.on('data', function (chunk) {
          tokenBody = JSON.parse(chunk);
          if(typeof tokenBody.error == 'undefined' && tokenBody.expires_in > 300){
            console.log('DRIVE TOKEN EXPIRES IN: ', tokenBody.expires_in);
            callback(oauth2Client, cloudpath.id);
          }else{
            console.log('DRIVE TOKEN EXPIRED: ', tokenBody.error);
            DirectoryController.refreshToken(oauth2Client, cloudpath, callback);
            /*oauth2Client.refreshAccessToken(function(err, tokens){

                if (err) {
                    console.log('Error while trying to refresh token', err);
                    return DirectoryController.getNewToken(oauth2Client, callback);
                    // return;
                }

                console.log('Refresh tokens: ', tokens);

                oauth2Client.credentials = {
                    "access_token"      : tokens.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                    "refresh_token"     : tokens.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                    "token_type"        : tokens.token_type,//"Bearer",
                    "expiry_date"       : tokens.expiry_date,//1481041473357
                };

                cloudpath.access_token      = tokens.access_token;
                cloudpath.refresh_token     = tokens.refresh_token;
                cloudpath.token_type        = tokens.token_type;
                cloudpath.expiry_date       = tokens.expiry_date;

                cloudpath.save().success(function (model) {
                    
                    callback(oauth2Client, cloudpath.id);
                });

                // callback(oauth2Client, cloudpath.id);

                // response.send({
                //     access_token: tokens.access_token
                // });
            });*/
          }
        });
        res.on('error', function (err) {
          console.log('ERROR: ' + err);
          DirectoryController.getNewToken(oauth2Client, callback);
        });
      }).end();
    },

    //author:Rishabh
    refreshToken: function (oauth2Client, cloudpath, callback){

        oauth2Client.refreshAccessToken(function(err, tokens){

            if (err) {
                console.log('Error while trying to refresh token', err);
                return DirectoryController.getNewToken(oauth2Client, callback);
                // return;
            }

            console.log('Refresh tokens: ', tokens);

            oauth2Client.credentials = {
                "access_token"      : tokens.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                "refresh_token"     : tokens.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                "token_type"        : tokens.token_type,//"Bearer",
                "expiry_date"       : tokens.expiry_date,//1481041473357
            };

            cloudpath.access_token      = tokens.access_token;
            cloudpath.refresh_token     = tokens.refresh_token;
            cloudpath.token_type        = tokens.token_type;
            cloudpath.expiry_date       = tokens.expiry_date;

            cloudpath.save(function (model) {
                
                callback(oauth2Client, cloudpath.id);
            });

            // callback(oauth2Client, cloudpath.id);

            // response.send({
            //     access_token: tokens.access_token
            // });
        });
    },

    /**
     * Get new token after prompting for user authorization
     *
     * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback to call with the authorized
     *     client.
     */
    getNewToken: function (oauth2Client, callback) {

        // var readline = require('readline');
        var SCOPES = ['https://www.googleapis.com/auth/drive'];

        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        
        console.log('Authorize this app by visiting this url: ', authUrl);

        callback({'authorizeUrl':authUrl});
        
        // var rl = readline.createInterface({
        //     input: process.stdin,
        //     output: process.stdout
        // });
        
        // rl.question('Enter the code from that page here: ', function(code) {
        //     rl.close();
        //     oauth2Client.getToken(code, function(err, token) {
        //         if (err) {
        //         console.log('Error while trying to retrieve access token', err);
        //         return;
        //         }
        //         oauth2Client.credentials = token;
        //         storeToken(token);
        //         callback(oauth2Client);
        //     });
        // });
    },

    /**
     * Store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     *
     * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback to call with the authorized
     *     client.
     */
    saveToken: function (accountId, code, oauth2Client, cloudpath, callback) {

        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            // DirectoryController.storeToken(accountId, token);
            // callback(oauth2Client);

            if(cloudpath){

                console.log('Updating tokens in DB.');
                cloudpath.access_token      = token.access_token;
                cloudpath.refresh_token     = token.refresh_token;
                cloudpath.token_type        = token.token_type;
                cloudpath.expiry_date       = token.expiry_date;

                cloudpath.save(function (model) {
                    
                    callback(oauth2Client, cloudpath.id);
                });
            }else{
                console.log('Inserting tokens in DB.');
                CloudPaths.create({

                    type              : 'drive',
                    access_token      : token.access_token,//"ya29.GlusA88yLqK_ZVnZ8yYFP_-uJ6Qt6wUeEaQDxjcHDOckmK0-eumNwnjWc5JrR5fCleCNy8ZtJ7tvdkBCpRElo_ZdVKQAh1m30DwGyeIuO8V99CfLCVskfDc4Xb_b",
                    refresh_token     : token.refresh_token,//"1/tyY8PHbvotFUpSeb8GKskidGzmuNbG6Zx1NgX7PJ834",
                    token_type        : token.token_type,//"Bearer",
                    expiry_date       : token.expiry_date,//148
                    accountId         : accountId

                }).done(function foundAdapter (err, tokenrow) {
                    // return res.redirect('/');
                    if(err)
                        console.log('Error in saving Drive Settings for User #'+accountId+' : '+err);

                    console.log('Drive Settings saved for User #'+accountId);
                    callback(oauth2Client, tokenrow.id);
                });
            }
        });
    },




};
module.exports = DirectoryController;
