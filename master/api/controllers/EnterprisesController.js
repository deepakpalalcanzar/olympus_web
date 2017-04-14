var UUIDGenerator = require('node-uuid');
var cacheRoute = require('booty-cache');
var pagination = require('pagination');

var EnterprisesController = {

	listEnterprises: function(req, res){

		var sql = "SELECT e.*,a.id AS account,a.name AS acc_name,a.email AS acc_email,s.id AS sub_id, dir.size, dir.quota, "+
		" td.plan_name AS features,td.users_limit FROM enterprises e "+
		"INNER JOIN account a ON a.id = e.account_id "+
		"INNER JOIN subscription s ON s.id = a.subscription_id "+
        "INNER JOIN transactiondetails td ON td.account_id = a.id "+
		"INNER JOIN directory dir ON dir.OwnerId = a.id "+
		" WHERE e.is_active=1 AND td.is_deleted = 0";

        console.log("sqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsql");
        console.log(sql);
        console.log("sqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsqlsql");

		sql = Sequelize.Utils.format([sql]);
		sequelize.query(sql, null, {
			raw: true
		}).success(function(enterprises) {
                         if(enterprises.length){ // check for no records exists
                             
                             
                        var totalpage = (enterprises.length / 50)+1 ;
                        var range = ((req.param('id') * 50)-50) + "," + 50;

                        var boostrapPaginator = new pagination.TemplatePaginator({
                            prelink: '/', current: req.param('id'), rowsPerPage: 1,
                            totalResult: enterprises.length, slashSeparator: false,
                            template: function (result) {
                                var i, len, prelink;
                                var html = "<div>";
                                if (result.pageCount < 2) {
                                    html += "</div>";
                                    return html;
                                }
                                prelink = this.preparePreLink(result.prelink);
                                if (result.previous) {
                                    html += "<a href='#enterprises/" + result.previous + "'>" + this.options.translator("PREVIOUS") + "</a> &nbsp; | &nbsp; ";
                                }
                                if (result.range.length) {
                                    for (i = 0, len = result.range.length; i < len; i++) {
                                        if (totalpage > result.range[i]) {
                                            if (result.range[i] === result.current) {
                                                html += "<a href='#enterprises/" + result.range[i] + "'>" + result.range[i] + "</a> &nbsp; | &nbsp;";
                                            } else {
                                                html += "<a href='#enterprises/" + result.range[i] + "'>" + result.range[i] + "</a> &nbsp; | &nbsp;";
                                            }
                                        }
                                    }
                                }
                                if (result.next) {
                                    if (totalpage > result.next) {
                                        html += "<a href='#enterprises/" + result.next + "' class='paginator-next'>" + this.options.translator("NEXT") + "</a> &nbsp; ";
                                    }
                                }
                                html += "</div>";
                                return html;
                            }
                        });

                        var Paginator = boostrapPaginator.render();


                             
                    var sql = "SELECT e.*,a.id AS account,a.name AS acc_name,a.email AS acc_email,s.id AS sub_id,"+
                    " td.plan_name AS features,td.users_limit, " + '"' + Paginator + '" ' + " as Paginator FROM enterprises e "+
                    "INNER JOIN account a ON a.id = e.account_id "+
                    "INNER JOIN subscription s ON s.id = a.subscription_id "+
                    "INNER JOIN transactiondetails td ON td.account_id = a.id "+
			"INNER JOIN directory dir ON dir.OwnerId = a.id "+
                    " WHERE e.is_active=1 AND td.is_deleted = 0 LIMIT " + range + " ";
        
        console.log("#########################################");
console.log(sql);
console.log("#########################################");
                                sql = Sequelize.Utils.format([sql]);
                                sequelize.query(sql, null, {
                                        raw: true
                                }).success(function(enterprises) {
                                         if(enterprises.length){ // check for no records exists

console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
console.log(enterprises);
console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");

                                        res.json(enterprises, 200);
                                    }else{
                                        res.json({
                                            name: 'error_123',
                                            notFound : true,  
                                        });
                                    }
                                }).error(function(e) {
                                        throw new Error(e);
                                });
                             
                             
                             
                             
//                        res.json(enterprises, 200);
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


	register: function(req, res){

		var request = require('request');
		var options = {
			uri: 'http://localhost:1337/account/register/' ,
			method: 'POST',
	    };

        options.json =  {
            name                : req.param('owner_name'),
            email               : req.param('email'),
            isVerified          : true,
            isAdmin             : true,
            password            : req.param('password'),
            created_by          : req.session.Account.id,
            is_enterprise       : true,
            quota               : req.param('quota'),
            subscription        : req.param('subscription'),          
            enterprise_name     : req.param('name')         
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
			uri: 'http://localhost:1337/enterprises/register/' ,
			method: 'POST',
	    };

	    options.json =  {
	    	account_id				: req.params.account_id,
	    	enterprises_name		: req.params.enterprises_name,
	    	name    				: req.params.name,
			error					: req.params.error,
			quota					: req.params.quota,
	    };

		request(options, function(err, response, body) {
			if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
//	Resend using the original response statusCode
//	use the json parsing above as a simple check we got back good stuff
	      //res.json(body, response && response.statusCode);

	      //save data to transactiondetails table
            Subscription.find({
                where: { id: req.params.sub_id }
            }).done(function(err, subscription) {
               // Save to transactionDetails table
                var tran_options = {
                    uri: 'http://localhost:1337/transactiondetails/register/' ,
                    method: 'POST',
                };

                var created_date = new Date();  
                tran_options.json =  {
                    trans_id        : 'superadmin',
                    account_id      : req.params.account_id,
                    created_date    : created_date,
                    users_limit     : subscription.users_limit,
                    quota           : subscription.quota,
                    plan_name       : subscription.features,
                    price           : subscription.price,
                    duration        : subscription.duration,
                    paypal_status   : '',
                };

      		    request(tran_options, function(err1, response1, body1) {
      		    if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
			        // Resend using the original response statusCode
			        //  use the json parsing above as a simple check we got back good stuff
         			res.json(body1, response1 && response1.statusCode);
        		});
      		});
			// end transaction history
	    });
	},

	deleteEnterprises: function(req, res){
        var request = require('request');

        var sql = "UPDATE enterprises SET is_active=0 where id = ?";
        sql = Sequelize.Utils.format([sql, req.params.id]);
        sequelize.query(sql, null, {
        	raw: true
       	}).success(function(dirs) {
       		Enterprises.find({
            	where: { id: req.params.id }
            }).done(function(err, ent) {
            	var sql = "UPDATE account SET deleted=1 where id = ?";
        		sql = Sequelize.Utils.format([sql, ent.account_id]);
        		sequelize.query(sql, null, {
            		raw: true
        		}).success(function(response) {
        			console.log(response);

                  /*Create logging*/
                  var options = {
                    uri: 'http://localhost:1337/logging/register/' ,
                    method: 'POST',
                  };

                 options.json =  {
                      user_id     : req.session.Account.id,
                      text_message: 'has deleted '+ent.name+' enterprise.',
                      activity    : 'delete',
                      on_user     : req.params.id,
                      ip          : req.session.Account.ip,
                       platform    : req.headers.user_platform,
                  };

                  request(options, function(err, response, body) {
                    if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
                        res.json({'success':'1'});
                    });
                  /*End logging*/
        			
				        });
            });
       	});
    },

    updateUserAccount:function(req, res){

    	var sql = "UPDATE account SET is_enterprise=1, subscription_id ="+req.params.subscription_id+" where id = ?";
        sql = Sequelize.Utils.format([sql, req.params.account_id]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function(dirs) {
        	console.log(dirs);
        	res.json({'success':'1'});
		});
    },

    getQuota: function(req, res){
    	var sql = "SELECT quota FROM subscription WHERE id=?";
        sql = Sequelize.Utils.format([sql,req.params.sub_id]);
        sequelize.query(sql, null, {
        	raw: true
       	}).success(function(dirs) {
           res.json(dirs, 200);
       	});
   	},

   	impersonate: function(req, res){
		Account.find({
			where: {
				email: req.param('email')
			}
		}).done(function(err, account) {
			if (err) return res.send(500,err);
			AuthenticationService.session.link(req, account);
			res.json(200, 'ok');
		});
   	},

   	updateEnterprise: function(req, res){

		var request = require('request');
		var options = {
			uri: 'http://localhost:1337/enterprises/update/' ,
			method: 'POST',
	    };

	    options.json =  {
	    	enterprises_name: req.params.name,
	    	owner_name		: req.params.owner_name,
	    	subscription    : req.params.subscription,
			email			: req.params.email,
			enterprise_id	: req.params.id,
			ent_id			: req.params.ent_id,
	    };

		request(options, function(err, response, body) {
			if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
            //	Resend using the original response statusCode
            //	use the json parsing above as a simple check we got back good stuff
	        //res.json(body, response && response.statusCode);
            //Check for users_limit upgradation of subscription
            if(body.type === 'error_users_limit'){
                return res.json({ type : 'error',
                    error:'Subscription plan can not be changed as enterprise has created more users than you want to assign !',
                });
            }

	        // save data to transactiondetails table
            Subscription.find({
                where: { id: req.params.subscription }
            }).done(function(err, subscription) {

                // Save to transactionDetails table
                var tran_options = {
                    uri: 'http://localhost:1337/transactiondetails/register/' ,
                    method: 'POST',
                };

                var created_date = new Date();
                tran_options.json =  {
                    trans_id        : 'superadmin',
                    account_id      : req.params.id,
                    created_date    : created_date,
                    users_limit     : subscription.users_limit,
                    quota           : subscription.quota,
                    plan_name       : subscription.features,
                    price           : subscription.price,
                    duration        : subscription.duration,
                    paypal_status   : '',
                };

          		request(tran_options, function(err1, response1, body1) {

          		    if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);

                    /*Create logging*/
                    var options = {
                        uri: 'http://localhost:1337/logging/register/' ,
                        method: 'POST',
                    };
                 
                    options.json =  {
                        user_id     : req.session.Account.id,
                        text_message: 'has updated an enterprise.',
                        activity    : 'update',
                        on_user     : req.params.ent_id,
                        ip          : req.session.Account.ip,
                         platform    : req.headers.user_platform,
                    };

                    request(options, function(err, response, body) {
                        if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
                        res.json(body1, response1 && response1.statusCode);
                    });
                    /*End logging*/ 
        	    });
            }); // end transaction history
	    });
   	}
};
_.extend(exports, EnterprisesController);
