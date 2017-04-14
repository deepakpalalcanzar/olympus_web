var UUIDGenerator = require('node-uuid');
var cacheRoute = require('booty-cache');

var TempAccountController = {

	register: function(req, res){

        var request = require('request');
        var options = {
    		uri   : 'http://localhost:1337/tempaccount/register/' ,
    		method: 'POST',
        };

        options.json = {
        	first_name      : req.param('first_name'),
            last_name       : req.param('last_name'),
        	email           : req.param('email'),
        	password        : req.param('password'),
            is_enterprise   : req.param('user_type'),
            enterprise_name : req.param('enterprise_name'),
        	ip_address      : req.param('ip_address')
        };

		request(options, function(err, response, body) {
			if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
            //	Resend using the original response statusCode
            //	use the json parsing above as a simple check we got back good stuff
            res.json(body, response && response.statusCode);
	    });

	},

    // used for autocomplete in the sharing settings for an inode
    fetchAssignWorkgroup: function(req, res) {
        
        // If this is a private deployment, just send back a 403. We dont want to search for users.
        if (sails.config.privateDeployment) {
            return res.send(403);
        }
        
        if(req.session.Account.email=="superadmin@olympus.io"){
            Directory.findAll({
               where: ['(deleted = 0 OR deleted IS NULL) AND (name LIKE ?)', "%" + req.param('name') + "%"],
               limit: 10
            }).success(function(directory) {
                res.json(directory, 200);
            });
        }else{

            Directory.findAll({
               where: ['(deleted = 0 OR deleted IS NULL) AND (OwnerId=?) AND (name LIKE ?)', req.session.Account.id, "%" + req.param('name') + "%"],
               limit: 10
            }).success(function(directory) {
                res.json(directory, 200);
            }); 
        }
    },

    assignPermission: INodeService.assignPermission,

    // For getting number of shared on dashboard
    sharedDirectory: function(req, res){
        
        var sql = "SELECT * FROM directorypermission WHERE AccountId=? ";
        sql = Sequelize.Utils.format([sql, req.session.Account.id]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function(dirs) {
            res.json(dirs, 200);
        });
    }, 

    numSharedDirectory: function(req, res){
        var sql = "SELECT COUNT(dp.id) AS num_shared FROM directorypermission dp"+
      " INNER JOIN account a ON a.id=dp.AccountId WHERE dp.DirectoryId=? ";
        sql = Sequelize.Utils.format([sql,req.params.dirId]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function(dirs) {
            res.json(dirs, 200);
        });
    },
   
    //end Shared
    listUsers: function(req, res){
        var sql11 = "SELECT account_id FROM accountdeveloper WHERE access_token=?";
        sql11 = Sequelize.Utils.format([sql11, req.param('access_token')]);
        sequelize.query(sql11, null, {
            raw: true
        }).success(function(accountDev) {
    
            if(accountDev.length){

                var sql = "SELECT account.*,subscription.features, adminuser.admin_profile_id, "+
                  "adminuser.id as adminuser_id , enterprises.name as enterprise_name, enterprises.id as enterprises_id FROM account "+
                  "LEFT JOIN subscription ON account.subscription_id=subscription.id "+
                  "LEFT JOIN adminuser ON account.id=adminuser.user_id "+
                  "LEFT JOIN enterprises ON account.created_by=enterprises.account_id "+
                  "WHERE account.is_enterprise=0 and account.deleted != 1 and account.created_by=?";
                
                sql = Sequelize.Utils.format([sql, accountDev[0].account_id]);
                
                sequelize.query(sql, null, {
                    raw: true
                }).success(function(accounts) {
                    if(accounts.length){
                        res.json(accounts, 200);
                    }else{
                        res.json({ noRecords: 'No records found!', });
                    }
                }).error(function(e) {
                    throw new Error(e);
                });
            }else{
                res.json({ notAuth: 'not autorized'});
            }
        });
    },
	

	dataSyncing: function (req, res){

		var accessToken = req.param('access_token');
        var lastSync    = req.param('lastsync');

        var datetime = new Date();
        var lastCall = datetime.getFullYear()+'-'+(datetime.getMonth() + 1)+'-'+datetime.getDate()+' '+datetime.getHours()+':'+datetime.getMinutes()+':'+datetime.getSeconds();

      	var sql = "SELECT account_id from accountdeveloper where access_token =?";
        sql = Sequelize.Utils.format([sql, accessToken]);

		sequelize.query(sql, null, {
		    raw: true
		}).success(function(accounts) {

			var response = [];
			var sql, sqlFile;

			if(lastSync === '0'){
				sql = "SELECT d.* from directory d JOIN directorypermission dp ON d.id = dp.DirectoryId where (d.deleted IS NULL OR d.deleted=0) and dp.AccountId =?";
				sql = Sequelize.Utils.format([sql, accounts[0].account_id]);
			}else{
				sql = "SELECT d.* from directory d JOIN directorypermission dp ON d.id = dp.DirectoryId where (d.deleted IS NULL OR d.deleted=0) and dp.AccountId =? and d.createdAt>?";
				sql = Sequelize.Utils.format([sql, accounts[0].account_id, lastSync]);
			}

			sequelize.query(sql, null, {
				raw: true
			}).success(function(dirs) {

				if(dirs.length > 0){
                    response['0'] = dirs;
				}

				if(lastSync === '0'){
				    sqlFile = "SELECT f.* from file f JOIN filepermission fp ON f.id = fp.FileId where (f.deleted IS NULL OR f.deleted=0) and fp.AccountId=?";
				    sqlFile     = Sequelize.Utils.format([sqlFile, accounts[0].account_id]);
				}else{
				    sqlFile = "SELECT f.* from file f JOIN filepermission fp ON f.id = fp.FileId where (f.deleted IS NULL OR f.deleted=0) and fp.AccountId=? and f.createdAt>?";
				    sqlFile = Sequelize.Utils.format([sqlFile, accounts[0].account_id, lastSync]);
				}

				sequelize.query(sqlFile, null, {
				    raw: true
				}).success(function(files) {
				                  
				    if(files.length > 0){
				        response['1'] = files;
				    }
				    response['2'] = lastCall;
				    res.json(response);
				});

            });
        });
	}, 


    listDeletedItems: function(req, res){

        var accessToken = req.param('access_token');
        var lastSync    = req.param('lastsync');
        var datetime    = new Date();
        var lastCall    = datetime.getFullYear()+'-'+(datetime.getMonth() + 1)+'-'+datetime.getDate()+' '+datetime.getHours()+':'+datetime.getMinutes()+':'+datetime.getSeconds();
        
        var sql = "SELECT account_id from accountdeveloper where access_token =?";
        sql = Sequelize.Utils.format([sql, accessToken]);

        sequelize.query(sql, null, {
            raw: true
        }).success(function(accounts) {

            var response = [];
            var sql, sqlFile;

            if(lastSync === '0'){
                sql = "SELECT * from deletedlist where account_id = ?";
                sql = Sequelize.Utils.format([sql, accounts[0].account_id]);
            }else{
                sql = "SELECT * from deletedlist where account_id = ? and createdAt > ?";
                sql = Sequelize.Utils.format([sql, accounts[0].account_id, lastSync]);
            }

            sequelize.query(sql, null, {
                raw: true
            }).success(function(deletedlist) {

                if(deletedlist.length > 0){
                    response['0'] = deletedlist;
                }
                
                response['1'] = lastCall;
                res.json(response);

            });

        });

    },


 createComment: function(req, res){

        var request = require('request');
        var options = {
            uri: 'http://localhost:1337/file/postComment/' ,
            method: 'POST',
        };

        var access_token = req.param('account_id');
        options.json =  {
            file_id     : req.param('file_id'),
            comment     : req.param('comment'),
            account_id  : req.param('account_id'),
        };

        request(options, function(err, response, body) {
            if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
            //  Resend using the original response statusCode
            //  Use the json parsing above as a simple check we got back good stuff
            res.json(body, response && response.statusCode);
        });

    }

};_.extend(exports, TempAccountController);
