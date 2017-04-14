var UUIDGenerator = require('node-uuid');
var cacheRoute = require('booty-cache');
var fileSystem = require( "fs" );
var stream = require( "stream" );

var SubscriptionController = {

	register: function(req, res){

		var request = require('request');
		var options = {
			uri: 'http://localhost:1337/subscription/register/' ,
			method: 'POST',
	    };

	    options.json =  {
	    	features	: req.params.features,
	    	price		: req.params.price,
	    	duration 	: req.params.duration,
	    	users_limit	: req.params.users_limit,
	    	quota    	: req.params.quota,
	    	is_default  : req.params.is_default,
	    };

		request(options, function(err, response, body) {

			if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
            //	Resend using the original response statusCode
            //	use the json parsing above as a simple check we got back good stuff
	       /*Create logging*/
            var opts = {
                uri: 'http://localhost:1337/logging/register/' ,
                method: 'POST',
            };
            
            opts.json =  {
                user_id     : req.session.Account.id,
                text_message: 'has added a subscription plan named '+req.params.features+'.',
                activity    : 'add',
                on_user     : req.session.Account.id,
                ip 	    : typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                 platform   : req.headers.user_platform,
            };

            request(opts, function(err1, response1, body1) {
                if(err) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
                res.json(body, response && response.statusCode);
            });
            /*Create logging*/
	    });
	},

	deleteSubscription: function(req, res){

        var request = require('request');
        var sql     = "UPDATE subscription SET is_active=0 where id = ?";
        sql         = Sequelize.Utils.format([sql, req.params.id]);

        sequelize.query(sql, null, {
        	raw: true
        }).success(function(dirs) {
        	
          /*Create logging*/
            Subscription.find({
                where: { id: req.params.id }
            }).done(function(err, subscription) {

                var opts = {
                    uri: 'http://localhost:1337/logging/register/' ,
                    method: 'POST',
                };

                opts.json =  {
                    user_id     : req.session.Account.id,
                    text_message: 'has deleted a subscription plan named '+subscription.features+'.',
                    activity    : 'deleted',
                    on_user     : req.session.Account.id,
                    ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                     platform    : req.headers.user_platform,
                };

                request(opts, function(err1, response1, body1) {
                if(err) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
                    res.json({'success':'1'});
                });
            });
            /*Create logging*/  
		});
    },

    updateSubscription: function(req, res){

// Look up Account for currently logged-in user
		var request = require('request');

		var options = {
			uri: 'http://localhost:1337/subscription/updateSubscription/' ,
			method: 'POST',
	    };

	    options.json =  {
	    	id            : req.params.id,
	    	features      : req.params.features,
	    	price	      : req.params.price,
	    	duration      : req.params.duration,
	    	users_limit   : req.params.users_limit,
	    	quota         : (req.params.quota > 1000)?1000:req.params.quota,
	    	upd_existing  : req.params.upd_existing,
	    	is_default    : req.params.is_default,
	    };

		request(options, function(err, response, body) {

			if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
            //	Resend using the original response statusCode
            //	use the json parsing above as a simple check we got back good stuff
	       /*Create logging*/
            var opts = {
                uri: 'http://localhost:1337/logging/register/' ,
                method: 'POST',
            };

            opts.json =  {
                user_id     : req.session.Account.id,
                text_message: 'has updated a subscription plan.',
                activity    : 'updated',
                on_user     : req.session.Account.id,
                ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                 platform    : req.headers.user_platform,
            };

            request(opts, function(err1, response1, body1) {
            if(err) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
                res.json(body, response && response.statusCode);
            }); /*Create logging*/
	    });
	},

	getSubscription: function(req, res){
		var sql = "SELECT * FROM subscription WHERE is_active IS NULL";
        sql = Sequelize.Utils.format([sql]);
        sequelize.query(sql, null, {
        	raw: true
       	}).success(function(dirs) {
        	res.json(dirs, 200);
       	});
    },


    index: function(req,res){
        
        req.session.tempId = req.params.id;
        var sql = "SELECT id,features,price,users_limit,quota,is_default,is_active,duration, "+
                    "IF(duration>=12,CONCAT(duration/12,'','Y'),CONCAT(duration,'','M')) AS durat from subscription "+
                    "WHERE is_active IS NULL";

        sql = Sequelize.Utils.format([sql]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function(subscription) {
            if(subscription.length === 1){
                res.redirect("/subscription/free/1/"+req.session.tempId);
            }else{
                res.view('subscription/index',{
                    subscription : subscription,
                    temp_id      : req.session.tempId
                });
            }
        });
	},

	free: function(req, res){

        var request = require('request');
        var sub_id  = req.params.id;
        var temp_id = req.params.temp;

// req.session.tempId  use this as tempaccount id 
        var sql = "SELECT * from tempaccount where id = ?";
        sql     = Sequelize.Utils.format([sql,temp_id]);

        sequelize.query(sql, null, {
            raw: true
        }).success(function(account) {

            var options = {
                uri: 'http://localhost:1337/account/register/' ,
                method: 'POST',
            };

            options.json =  {
                name             : account[0].first_name+' '+account[0].last_name,
                email            : account[0].email,
                isVerified       : true,
                isAdmin          : account[0].is_enterprise== '1' ? true : false,
                password         : account[0].password,
                created_by       : '',
                is_enterprise    : account[0].is_enterprise,
                subscription     : sub_id,
            };

            if(account[0].is_enterprise == '1'){
                options.json.enterprise_name =account[0].enterprise_name
            }

            request(options, function(err, response, body) {
                
                if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);

                if(body.type == 'error') return res.json({ error: body.error, type: 'error' }, response && response.statusCode);
                //  Resend using the original response statusCode
                //  Use the json parsing above as a simple check we got back good stuff
                //  Save data to transactiondetails table
console.log('YGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGT');
console.log(err);
console.log(body);
console.log('YGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGT');
                Subscription.find({
                    where: { id: sub_id }
                }).done(function(err, subscription) {
                    // Save to transactionDetails table
                    var tran_options = {
                        uri: 'http://localhost:1337/transactiondetails/register/' ,
                        method: 'POST',
                    };

                    var created_date = new Date();  
                    tran_options.json =  {
                        trans_id        : 'Free',
                        account_id      : body.account.id,
                        created_date    : created_date,
                        users_limit     : subscription.users_limit,
                        quota           : subscription.quota,
                        plan_name       : subscription.features,
                        plan_id         : subscription.id,
                        price           : subscription.price,
                        duration        : subscription.duration,
                        paypal_status   : '',
                    };

                    request(tran_options, function(err1, response1, body1) {
                        if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
                        //  Resend using the original response statusCode
                        //  Use the json parsing above as a simple check we got back good stuff
                        /* Check is enterprise save data to enterprise table*/
                        if(account[0].is_enterprise == '1'){
         
                            var ent_options = {
                                uri: 'http://localhost:1337/enterprises/register/' ,
                                method: 'POST',
                            };

                            ent_options.json =  {
                                account_id              : body.account.id,
                                enterprises_name        : account[0].name,
                                error                   : '',
                            };

                            request(ent_options, function(err11, response11, body11) {

                                EmailService.sendSupportMail({
                                    account: account[0]
                                });

                                if(err11) return res.json({ error: err11.message, type: 'error' }, response11 && response11.statusCode);
                                    /* Redirect to dashboard code */

                                Account.find({
                                    where: { email: account[0].email, }
                                }).done(function(err, account) {
                                    if (err) return res.send(500,err);
                                    AuthenticationService.session.link(req, account);
                                    res.redirect('/');
                                });
                            });

                        }else{

                        /*End checking*/
                        /* Redirect to dashboard code */

                            Account.find({
                                where: { email: account[0].email,}
                            }).done(function(err, account) {
                                if (err) return res.send(500,err);
                                AuthenticationService.session.link(req, account);
                                res.redirect('/');
                            });
                        }
                    });
                }); // end transaction history
            });
        });
    },

    freeapi: function(req, res){

        var request = require('request');
        var sub_id  = req.params.id;
        var temp_id = req.params.temp;
if(req.params.type == 'buynow'){//signup
// req.session.tempId  use this as tempaccount id 
        var sql = "SELECT * from tempaccount where id = ?";
        sql     = Sequelize.Utils.format([sql,temp_id]);

        sequelize.query(sql, null, {
            raw: true
        }).success(function(account) {
console.log(sql);
console.log('U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7');
console.log(account);
console.log('U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7U7');
            var options = {
                uri: 'http://localhost:1337/account/register/' ,
                method: 'POST',
            };

            options.json =  {
                name             : account[0].first_name+' '+account[0].last_name,
                email            : account[0].email,
                isVerified       : true,
                isAdmin          : account[0].is_enterprise== '1' ? true : false,
                password         : account[0].password,
                created_by       : '',
                is_enterprise    : account[0].is_enterprise,
                subscription     : sub_id,
            };

            if(account[0].is_enterprise == '1'){
                options.json.enterprise_name =account[0].enterprise_name
            }

            request(options, function(err, response, body) {
                
                if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);

                if(body.type == 'error') return res.json({ error: body.error, type: 'error' }, response && response.statusCode);
                //  Resend using the original response statusCode
                //  Use the json parsing above as a simple check we got back good stuff
                //  Save data to transactiondetails table
console.log('YGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGT');
console.log(err);
console.log(body);
console.log('YGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGTYGT');
                Subscription.find({
                    where: { id: sub_id }
                }).done(function(err, subscription) {

                    if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);

                    // Save to transactionDetails table
                    var tran_options = {
                        uri: 'http://localhost:1337/transactiondetails/register/' ,
                        method: 'POST',
                    };

                    var created_date = new Date();  
                    tran_options.json =  {
                        trans_id        : 'Free',
                        account_id      : body.account.id,
                        created_date    : created_date,
                        users_limit     : subscription.users_limit,
                        quota           : subscription.quota,
                        plan_name       : subscription.features,
                        plan_id         : subscription.id,
                        price           : subscription.price,
                        duration        : subscription.duration,
                        paypal_status   : '',
                    };

                    request(tran_options, function(err1, response1, body1) {
                        if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
                        //  Resend using the original response statusCode
                        //  Use the json parsing above as a simple check we got back good stuff
                        /* Check is enterprise save data to enterprise table*/
                        if(account[0].is_enterprise == '1'){
         
                            var ent_options = {
                                uri: 'http://localhost:1337/enterprises/register/' ,
                                method: 'POST',
                            };

                            ent_options.json =  {
                                account_id              : body.account.id,
                                enterprises_name        : account[0].name,
                                error                   : '',
                            };

                            request(ent_options, function(err11, response11, body11) {

                                EmailService.sendSupportMail({
                                    account: account[0]
                                });

                                if(err11) return res.json({ error: err11.message, type: 'error' }, response11 && response11.statusCode);
                                    /* Redirect to dashboard code */

                                Account.find({
                                    where: { email: account[0].email, }
                                }).done(function(err, account) {
                                    if (err) return res.send(500,err);
                                    AuthenticationService.session.link(req, account);
                                    res.json({
                                      success : true,  
                                    });
                                    // res.redirect('/');
                                });
                            });

                        }else{

                        /*End checking*/
                        /* Redirect to dashboard code */

                            Account.find({
                                where: { email: account[0].email,}
                            }).done(function(err, account) {
                                if (err) return res.send(500,err);
                                AuthenticationService.session.link(req, account);
                                res.json({
                                  success : true,  
                                });
                                // res.redirect('/');
                            });
                        }
                    });
                }); // end transaction history
            });
        });
}else{//upgrade
        var sql = "SELECT * from account where id = ?";
        sql     = Sequelize.Utils.format([sql,temp_id]);

        sequelize.query(sql, null, {
            raw: true
        }).success(function(account) {
console.log(sql);
console.log('U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8');
console.log(account);
console.log('U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8U8');
            Subscription.find({
                where: { id: sub_id }
            }).done(function(err, subscription) {

                if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);

                // Save to transactionDetails table
                var tran_options = {
                    uri: 'http://localhost:1337/transactiondetails/register/' ,
                    method: 'POST',
                };

                var created_date = new Date();  
                tran_options.json =  {
                    trans_id        : 'Free',
                    account_id      : account[0].id,
                    created_date    : created_date,
                    users_limit     : subscription.users_limit,
                    quota           : subscription.quota,
                    plan_name       : subscription.features,
                    plan_id         : subscription.id,
                    price           : subscription.price,
                    duration        : subscription.duration,
                    paypal_status   : '',
                };

                request(tran_options, function(err1, response1, body1) {
                    if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
                    //  Resend using the original response statusCode
                    //  Use the json parsing above as a simple check we got back good stuff
                    /* Check is enterprise save data to enterprise table*/
                    if(account[0].is_enterprise == '1'){
     
                        var ent_options = {
                            uri: 'http://localhost:1337/enterprises/register/' ,
                            method: 'POST',
                        };

                        ent_options.json =  {
                            account_id              : body.account.id,
                            enterprises_name        : account[0].name,
                            error                   : '',
                        };

                        request(ent_options, function(err11, response11, body11) {

                            EmailService.sendSupportMail({
                                account: account[0]
                            });

                            if(err11) return res.json({ error: err11.message, type: 'error' }, response11 && response11.statusCode);
                                /* Redirect to dashboard code */

                            Account.find({
                                where: { email: account[0].email, }
                            }).done(function(err, account) {
                                if (err) return res.send(500,err);
                                AuthenticationService.session.link(req, account);
                                res.json({
                                  success : true,  
                                });
                                // res.redirect('/');
                            });
                        });

                    }else{

                    /*End checking*/
                    /* Redirect to dashboard code */

                        Account.find({
                            where: { email: account[0].email,}
                        }).done(function(err, account) {
                            if (err) return res.send(500,err);
                            AuthenticationService.session.link(req, account);
                            res.json({
                              success : true,  
                            });
                            // res.redirect('/');
                        });
                    }
                });
            }); // end transaction history
        });
}
    },

	/*paid: function(req, res){

		Subscription.findAll({
			where: { id: req.params.id }
		}).done(function(err, subscription) {

            TempAccount.findAll({
                where: { id: req.params.temp }
            }).done(function(error, tempaccount) {
                
                res.view('subscription/paid',{
                    id              : req.params.id,
                    amount          : subscription[0].price,
                    temp            : req.params.temp,
                    f_name          : tempaccount[0].first_name,
                    l_name          : tempaccount[0].last_name,
                    email           : tempaccount[0].email,
                    duration        : subscription[0].duration,
                    is_enterprise   : tempaccount[0].is_enterprise,
                    sub_name        : subscription[0].features,
                });
            });

		});

	},*/


	paid: function(req, res){

		Subscription.findAll({
			where: { id: req.params.id }
		}).done(function(err, subscription) {

            // console.log('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP');
            // console.log(req.params.type);
            // console.log('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP');

            if(req.params.type == 'buynow'){//signup
                TempAccount.findAll({
                    where: { id: req.params.temp }
                }).done(function(error, tempaccount) {

                    res.view('subscription/paid',{
                        id              : req.params.id,
                        amount          : subscription[0].price,
                        temp            : req.params.temp,
                        f_name          : tempaccount[0].first_name,
                        l_name          : tempaccount[0].last_name,
                        email           : tempaccount[0].email,
                        duration        : subscription[0].duration,
                        is_enterprise   : tempaccount[0].is_enterprise,
                        sub_name        : subscription[0].features,
                    });
                });
            }
            else{//upgrade
                Account.findAll({
                    where: { id: req.params.temp }
                }).done(function(err, acc){

                    if(acc.length > 0){
                        res.view('subscription/paid',{
                            id              : req.params.id,
                            amount          : subscription[0].price,
                            temp            : req.params.temp,
                            f_name          : acc[0].name,
                            l_name          : acc[0].name,
                            email           : acc[0].email,
                            duration        : subscription[0].duration,
                            is_enterprise   : acc[0].is_enterprise,
                            sub_name        : subscription[0].features,
                        });

                    }else{
                        TempAccount.findAll({
                            where: { id: req.params.temp }
                        }).done(function(error, tempaccount) {

                            res.view('subscription/paid',{
                                id              : req.params.id,
                                amount          : subscription[0].price,
                                temp            : req.params.temp,
                                f_name          : tempaccount[0].first_name,
                                l_name          : tempaccount[0].last_name,
                                email           : tempaccount[0].email,
                                duration        : subscription[0].duration,
                                is_enterprise   : tempaccount[0].is_enterprise,
                                sub_name        : subscription[0].features,
                            });
                        });
                    }

                });
            }  
		});

	},


    proceed: function(req, res){

        var request = require('request');
        res.view('subscription/preview',{
            first_name                   : req.body.first_name,
            last_name                    : req.body.last_name,
            email                        : req.body.email,
            address                      : req.body.address,
            city                         : req.body.city,
            customer_zip                 : req.body.customer_zip,
            state                        : req.body.state,
            country_code                 : req.body.country_code,
            card_type                    : req.body.card_type,
            customer_credit_card_number  : req.body.customer_credit_card_number,
            cc_cvv2_number               : req.body.cc_cvv2_number,
            amount                       : req.body.amount,
            cc_expiration_month          : req.body.cc_expiration_month,
            cc_expiration_year           : req.body.cc_expiration_year,
            sub_id                       : req.body.sub_id, 
            temp                         : req.body.temp,       
            duration                     : req.body.duration,       
            is_enterprise                : req.body.is_enterprise,       
            sub_name                     : req.body.sub_name,       
        });

    },

/*

	payment: function(req, res){

        var request     = require('request');
        var paypal_sdk  = require('paypal-rest-sdk');
        var sub_id      = req.body.sub_id;
        var temp_id     = req.body.temp;
        var sub_name    = req.body.sub_name;
        var dd          = new Date();
        var d           = dd.toLocaleDateString();
    // var y = d.getFullYear(); 
    // var duration_to = parseInt(req.body.duration)+y;
        var n = new Date(new Date(dd).setMonth(dd.getMonth()+parseInt(req.body.duration)));
        var duration_to = n.toLocaleDateString();
        paypal_sdk.configure({
            'host': 'api.sandbox.paypal.com',
            'client_id': 'Acp-phDclj-YRVsO7Id0BPSqvV3KkjqwkMbGxgA1fY2kIJVsWztWmB19XJlI',
            'client_secret': 'EBCNCRCjlhhTBUaHNv6ViNx5O2VsHmuu7veONAKw-t7hxtLqqQBu3rd_RUIr' 
        });
            
        paypal_sdk.generate_token(function(error, token){
            if(error){
                console.log('***token11 error**');
                console.error(error);
            } else {
                console.log('***token11 success**');
                console.log(token);
            }
        });

        var payment_details = {
            "intent": "sale",
            "payer": {
            "payment_method": "credit_card",
                "funding_instruments": [{
                    "credit_card": {
                        "type"          : req.body.card_type,
                        "number"        : req.body.customer_credit_card_number,
                        "expire_month"  : req.body.cc_expiration_month,
                        "expire_year"   : req.body.cc_expiration_year,
                        "cvv2"          : req.body.cc_cvv2_number,
                        "first_name"    : req.body.first_name,
                        "last_name"     : req.body.last_name,
                        "billing_address": {
                            "line1"         : req.body.address,
                            "city"          : req.body.city,
                            "state"         : req.body.state,
                            "postal_code"   : req.body.customer_zip,
                            "country_code"  : req.body.country_code 
                        }
                    }
                }]
            },
            "transactions": [{
                "amount": {
                    "total"     : req.body.amount,
                    "currency"  : "USD",
                    "details"   : {
                        "subtotal"  : req.body.amount,
                        "tax"       : "0.00",
                        "shipping"  : "0.00"
                    }
                },
                "description": "This is the payment transaction description." 
            }]
        };

        paypal_sdk.payment.create(payment_details, function(error, payment){
        
            if(error){
                console.log('**payment error11**');
                console.error(error);
            } else {

                if(payment.state === 'approved'){
                
                    var sql = "SELECT * from tempaccount where id = ?";
                    sql = Sequelize.Utils.format([sql,temp_id]);
                    sequelize.query(sql, null, {
                        raw: true
                    }).success(function(account) {
                        
                        var options = {
                            uri: 'http://localhost:1337/account/register/' ,
                            method: 'POST',
                        };

                        options.json =  {
                            name            : account[0].name,
                            email           : account[0].email,
                            isVerified      : true,
                            isAdmin         : account[0].is_enterprise=='1'?true:false,
                            password        : account[0].password,
                            created_by      : '',
                            is_enterprise   : account[0].is_enterprise,
                            subscription    : sub_id,
                        };

                        console.log('****this is options****');
                        console.log(options.json);
                        console.log('****closed options****');

                        request(options, function(err, response, body) {
                            if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
                            //  Resend using the original response statusCode
                            //  Use the json parsing above as a simple check we got back good stuff
                            //  res.json(body, response && response.statusCode);
                            Subscription.find({
                                where: { id: sub_id }
                            }).done(function(err, subscription) {
                                // Save to transactionDetails table
                                var tran_options = {
                                    uri: 'http://localhost:1337/transactiondetails/register/' ,
                                    method: 'POST',
                                };

                                tran_options.json =  {
                                    trans_id        : payment.id,
                                    account_id      : body.account.id,
                                    created_date    : payment.create_time,
                                    users_limit     : subscription.users_limit,
                                    quota           : subscription.quota,
                                    plan_name       : subscription.features,
                                    plan_id         : subscription.id,
                                    price           : subscription.price,
                                    duration        : subscription.duration,
                                    paypal_status   : payment.state,
                                };

                                request(tran_options, function(err1, response1, body1) {
                                    if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
                                    // Resend using the original response statusCode
                                    // use the json parsing above as a simple check we got back good stuff
                                    //res.json(body1, response1 && response1.statusCode);
                                });

      // end transaction history

        // Check is enterprise save data to enterprise table
        if(account[0].is_enterprise == '1'){
         
            var ent_options = {
                uri: 'http://localhost:1337/enterprises/register/' ,
                method: 'POST',
              };
            ent_options.json =  {
                account_id              : body.account.id,
                enterprises_name        : account[0].name,
                error                   : '',
            };

            request(ent_options, function(err11, response11, body11) {
            if(err11) return res.json({ error: err11.message, type: 'error' }, response11 && response11.statusCode);
    
            //res.json(body11, response11 && response11.statusCode);
            });
        }
        //End checking

        res.view('subscription/confirm',{
            payment_id    : payment.id,
            create_time   : payment.create_time,
            state         : 'Approved',
            amount        : req.body.amount,
            email         : req.body.email,
            duration_from : d,
            duration_to   : duration_to,
            sub_name      : sub_name,
          });

      });

    });

  });

}else{ console.log('**not approved**'); }
    }

  });
},
*/


payment: function(req, res){

	var request     = require('request');
	var paypal_sdk  = require('paypal-rest-sdk');
	var sub_id      = req.body.sub_id;
	var temp_id     = req.body.temp;
    var temp_email  = req.body.email;//Rishabh
	var sub_name    = req.body.sub_name;
	var dd          = new Date();
	var d           = dd.toLocaleDateString();

	var n           = new Date(new Date(dd).setMonth(dd.getMonth()+parseInt(req.body.duration)));
	var duration_to = n.toLocaleDateString();

        paypal_sdk.configure({
            'host': 'api.sandbox.paypal.com',
            'client_id': 'Acp-phDclj-YRVsO7Id0BPSqvV3KkjqwkMbGxgA1fY2kIJVsWztWmB19XJlI',
            'client_secret': 'EBCNCRCjlhhTBUaHNv6ViNx5O2VsHmuu7veONAKw-t7hxtLqqQBu3rd_RUIr' 
        });
            
        paypal_sdk.generate_token(function(error, token){
            if(error){
                console.log('***token11 error**');
                console.error(error);
            } else {
                console.log('***token11 success**');
                console.log(token);
            }
        });

        var payment_details = {
            "intent": "sale",
            "payer": {
            "payment_method": "credit_card",
                "funding_instruments": [{
                    "credit_card": {
                        "type"          : req.body.card_type,
                        "number"        : req.body.customer_credit_card_number,
                        "expire_month"  : req.body.cc_expiration_month,
                        "expire_year"   : req.body.cc_expiration_year,
                        "cvv2"          : req.body.cc_cvv2_number,
                        "first_name"    : req.body.first_name,
                        "last_name"     : req.body.last_name,
                        "billing_address": {
                            "line1"         : req.body.address,
                            "city"          : req.body.city,
                            "state"         : req.body.state,
                            "postal_code"   : req.body.customer_zip,
                            "country_code"  : req.body.country_code 
                        }
                    }
                }]
            },
            "transactions": [{
                "amount": {
                    "total"     : req.body.amount,
                    "currency"  : "USD",
                    "details"   : {
                        "subtotal"  : req.body.amount,
                        "tax"       : "0.00",
                        "shipping"  : "0.00"
                    }
                },
                "description": "This is the payment transaction description." 
            }]
        };

        paypal_sdk.payment.create(payment_details, function(error, payment){

            if(error){
                console.log('**payment error11**');
                console.error(error);
               // req.json(error);
            } else {

                if(payment.state === 'approved'){

                    // var sql = "SELECT * from account where id = ?";
                    // sql = Sequelize.Utils.format([sql,temp_id]);

                    //Rishabh
                    var sql = "SELECT * from account where email = ?";
                    sql = Sequelize.Utils.format([sql,temp_email]);

                    console.log('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC');
                    console.log(sql);
                    console.log('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC');
                    sequelize.query(sql, null, {
                        raw: true
                    }).success(function(account) {

                        console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');
                        console.log(account);
                        console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');

                        if(account.length > 0){

                            Subscription.find({
                                where: { id: sub_id }
                            }).done(function(err, subscription) {

                                var tran_options = {
                                    uri     : 'http://localhost:1337/transactiondetails/register/' ,
                                    method  : 'POST',
                                };

                                tran_options.json =  {
                                    trans_id        : payment.id,
                                    account_id      : temp_id,
                                    created_date    : payment.create_time,
                                    users_limit     : subscription.users_limit,
                                    quota           : subscription.quota,
                                    plan_name       : subscription.features,
                                    plan_id         : subscription.id,
                                    price           : subscription.price,
                                    duration        : subscription.duration,
                                    paypal_status   : payment.state,
                                };

                                request(tran_options, function(err1, response1, body1) {

                                    if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
                                    
                                    res.view('subscription/confirm',{
                                        payment_id    : payment.id,
                                        create_time   : payment.create_time,
                                        state         : 'Approved',
                                        amount        : req.body.amount,
                                        email         : req.body.email,
                                        duration_from : d,
                                        duration_to   : duration_to,
                                        sub_name      : sub_name,
                                    });

                                });

                            });

                        }else{

                            var sql = "SELECT * from tempaccount where id = ?";
                            sql = Sequelize.Utils.format([sql,temp_id]);

                            console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
                            console.log(sql);
                            console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

                            sequelize.query(sql, null, {
                                raw: true
                            }).success(function(account) {

                                console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
                                console.log(account);
                                console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
                                
                                var options = {
                                    uri: 'http://localhost:1337/account/register/' ,
                                    method: 'POST',
                                };

                                options.json =  {
                                    //name            : account[0].name,
                                    name            : account[0].first_name+' '+account[0].last_name,
                                    email           : account[0].email,
                                    isVerified      : true,
                                    isAdmin         : account[0].is_enterprise=='1'?true:false,
                                    password        : account[0].password,
                                    created_by      : '',
                                    is_enterprise   : account[0].is_enterprise,
                                    subscription    : sub_id,
                                };

                                request(options, function(err, response, body) {
                                    
                                    if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
console.log(options);
console.log('QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ');
console.log(body);
console.log('QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ');
                                    Subscription.find({
                                        where: { id: sub_id }
                                    }).done(function(err, subscription) {
                                        // Save to transactionDetails table
                                        var tran_options = {
                                            uri: 'http://localhost:1337/transactiondetails/register/' ,
                                            method: 'POST',
                                        };

                                        tran_options.json =  {
                                            trans_id        : payment.id,
                                            account_id      : body.account.id,
                                            created_date    : payment.create_time,
                                            users_limit     : subscription.users_limit,
                                            quota           : subscription.quota,
                                            plan_name       : subscription.features,
                                            plan_id         : subscription.id,
                                            price           : subscription.price,
                                            duration        : subscription.duration,
                                            paypal_status   : payment.state,
                                        };

                                        request(tran_options, function(err1, response1, body1) {
                                            if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
                                        });

                                        /* Check is enterprise save data to enterprise table*/
                                        if(account[0].is_enterprise == '1'){
                 
                                            var ent_options = {
                                                uri: 'http://localhost:1337/enterprises/register/' ,
                                                method: 'POST',
                                            };

                                            ent_options.json =  {
                                                account_id              : body.account.id,
                                                enterprises_name        : account[0].name,
                                                error                   : '',
                                            };

                                            request(ent_options, function(err11, response11, body11) {
                                                if(err11) return res.json({ error: err11.message, type: 'error' }, response11 && response11.statusCode);
                                            });
                                        }
                                        /*End checking*/

                                        res.view('subscription/confirm',{
                                            payment_id    : payment.id,
                                            create_time   : payment.create_time,
                                            state         : 'Approved',
                                            amount        : req.body.amount,
                                            email         : req.body.email,
                                            duration_from : d,
                                            duration_to   : duration_to,
                                            sub_name      : sub_name,
                                        });
                                    });
                                });
                            });
                        }
                    });
                }else{ 
                    console.log('**not approved**'); 
                }
            }
        });
    },

/* for check Delete it after check*/ 
confirm: function(req, res){
  var d = new Date();
  var y = d.getFullYear(); 
  var nn = y+parseInt('2');

  res.view('subscription/confirm',{
            payment_id  : 'aaaa',
            create_time : 'bbbbb',
            state       : 'cccc',
            amount      : '122',
            email       : 'darren@gmail.com',
            duration_from : y,
            duration_to : nn,
  });
},
/* end check*/

impersonate: function(req, res){
    console.log('EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
    // console.log(req);
    console.log('EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
    console.log(req.body.email);
    Account.find({
        where: {
          email: req.body.email
        }
    }).done(function(err, account) {
      if (err) return res.send(500,err);
      console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
    console.log(account);
      console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
      AuthenticationService.session.link(req, account);
      res.redirect('/#dashboard');
    });
  },

  publicDownload: function(req, res){

    var request = require('request');
//    hack the session bro
    var _session = {
      authenticated: true,
      Account: '1'
    };

// Strip original headers of host and connection status
    var headers = req.headers;
    delete headers.host;
    delete headers.connection;

// Build options for request
    var options = {
      uri: 'http://localhost:1337/file/download',
      method: req.method,
      headers: headers
    };

    File.find({where:{fsName:req.param('fsName')}}).success(function (fileModel) {

// If we have a file model to work with...
        if (fileModel) {

            //Remove verison (Vx) from the fileName added by abhishek
            fileName = fileModel.name;
            fileName = fileName.substr(0, fileName.lastIndexOf("("));

            if((fileModel.link_password_enabled == true) && (fileModel.link_password != '') && (req.body.password != fileModel.link_password) ){
                    
                var error = '';

                if(req.body.password == undefined){
                    error = '';
                }
                else if(req.body.password == ''){
                    error = 'Password is required.';
                }
                else if(req.body.password != ''){
                    error = 'Password is not correct.';
                }
                res.view('meta/file_d',{
                    fsName           : req.param('fsName'),
                    name             : fileModel.name,
                    error            : error,
                    title            : 'Enter File Password',
                    header_color     : '#FFFFFF',
                    navigation_color : '#4f7ba9',
                    body_background  : '#f9f9f9',
                    footer_background: '#f9f9f9',
                    font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                    font_color       : '#547aa4'
                });
            }else{
                    var md5 = 'p';
                    if((fileModel.link_password_enabled == true) && (fileModel.link_password != '')){
                        var crypto = require('crypto');
                        md5 = crypto
                                .createHash('md5')
                                .update(fileModel.link_password)
                                .digest('base64');
                    }

                    if(fileModel.mimetype == 'video/mp4'){//If mp4 force the file to download
                            res.setHeader('Content-disposition', 'attachment; filename=\"' + fileName.trim() + '\"');

                            // set content-type header

                            res.setHeader('Content-Type', fileModel.mimetype);
                            if(fileModel.isOnDrive){

                                fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {
                                  if (err) {
                                    console.log('Error loading client secret file: ' + err);
                                    return;
                                  }
                                  // Authorize a client with the loaded credentials, then call the
                                  // Drive API.

                                  console.log('========================================================================');
                                  console.log(req.param('drive_action'));
                                  // console.log('========================================================================');
                                  // console.log(JSON.parse(content));
                                  // console.log(sails);
                                  sails.controllers.directory.authorize('file_open_by_pathID', fileModel.uploadPathId, req.param('refresh_token'), JSON.parse(content), function (auth, driveUploadPathId) {

                                    console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
                                    console.log(auth);
                                    console.log(driveUploadPathId);

                                    var google = require('googleapis');

                                    var drive = google.drive({
                                      version: 'v2',
                                      auth: auth
                                    });

                                    var fileId = fileModel.fsName;
                                    // res.setHeader('Content-Type', fileModel.mimetype);
                                    console.log('fileId fileModel', fileId, fileModel.mimetype);
                                    /*var dest = fs.createWriteStream('/tmp/'+fileModel.name);
                                    drive.files.get({
                                      fileId: fileId,
                                      alt: 'media'
                                    }, {
                                      encoding: null // Make sure we get the binary data
                                    }, function (err, buffer) {
                                      // Nice, the buffer is actually a Buffer!
                                      buffer.pipe(res);
                                    });*/
                                    /*drive.files.get({
                                       fileId: fileId,
                                       // mimeType: fileModel.mimetype,//'application/pdf'
                                       alt: 'media'
                                    })
                                    .on('end', function() {
                                      console.log('Done');
                                    })
                                    .on('error', function(err) {
                                      console.log('Error during download', err);
                                    })
                                    .pipe(res);*/
                                    var doc_mimes = [
                                        // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',//Export only supports Google Docs.
                                        'application/vnd.google-apps.document',
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                        'application/vnd.google-apps.spreadsheet'
                                    ];
                                    if(_.contains( doc_mimes, fileModel.mimetype)){
                                        console.log('Downloading DOCS');
                                        var proxyReq_temp = drive.files.export({
                                           fileId: fileId,
                                           mimeType: fileModel.mimetype,//'application/pdf'
                                           // alt: 'media'
                                        })
                                        .on('end', function() {
                                          console.log('Done');
                                        })
                                        .on('error', function(err) {
                                          console.log('Error during doc download', err);
                                        });
                                        proxyReq_temp.pipe(
                                            new stream.PassThrough().pipe(
                                                fileSystem.createWriteStream( "./copy_" + fileModel.fsName )
                                            )
                                        );

                                        var proxyReq = proxyReq_temp.pipe(res);
                                    }else{
                                        console.log('Downloading FILES');
                                        var proxyReq_temp = drive.files.get({
                                           fileId: fileId,
                                           // mimeType: fileModel.mimetype,//'application/pdf'
                                           alt: 'media'
                                        })
                                        .on('end', function() {
                                          console.log('Done');
                                        })
                                        .on('error', function(err) {
                                          console.log('Error during media download', err);
                                        }).pipe(res);
                                        // proxyReq_temp.pipe(
                                        //     new stream.PassThrough().pipe(
                                        //         fileSystem.createWriteStream( "./copy_" + fileModel.fsName )
                                        //     )
                                        // );

                                        // var proxyReq = proxyReq_temp.pipe(res);
                                    }
                                  });
                                });

                            }else{
                                options.uri = "http://localhost:1337/file/download/"+fileModel.fsName;
                                // var proxyReq = request.get(options).pipe(res);
                                // if (req.url.match(/^\/file\/open\//)) {//open
                                    //Rishabh: Backpressure issue reolved
                                    // http://www.bennadel.com/blog/2817-the-affect-of-back-pressure-when-piping-data-into-multiple-writable-streams-in-node-js.htm
                                    var proxyReq_temp = request.get(options);
                                    proxyReq_temp.pipe(
                                        new stream.PassThrough().pipe(
                                            fileSystem.createWriteStream( "./copy_" + fileModel.fsName )
                                        )
                                    );

                                    var proxyReq = proxyReq_temp.pipe(res);
                            }
                    }else if(req.session.Account){

                        /*Logged in user pages*/
                        Account.find({
                            where: { id: req.session.Account.id }
                        }).done(function(err, account) {

                            if (err) return res.send(500,err);
                            
                            Account.find({
                                where: { id : account.created_by }
                            }).done(function(errs, createdBy){
                                
                                if(createdBy){
                                    if(createdBy.enterprise_fsname !== null && createdBy.enterprise_fsname !== '' ){
                                        if(createdBy.isSuperAdmin !== 1){
                                            enterpriseLogo = createdBy.enterprise_fsname;
                                        }else{
                                            enterpriseLogo = account.enterprise_fsname;
                                        }

                                    }else{

                                        if(account.enterprise_fsname !== null && account.enterprise_fsname !== ''){
                                            enterpriseLogo = account.enterprise_fsname;
                                        }else{
                                            enterpriseLogo = '';
                                        }
                                    }
                                    hideSetting= 1;
                                }else{

                                    enterpriseLogo = account.enterprise_fsname;

                                }

                                if(account.isSuperAdmin){

                                    Theme.find({
                                        where : { account_id: req.session.Account.id  }
                                    }).done(function(err, theme){
                                        var sql = "SELECT (SUM(size)/1000000000) as total_space_used FROM directory";
                                        sql = Sequelize.Utils.format([sql]);
                                        sequelize.query(sql, null, {
                                            raw: true
                                        }).success(function(dir) {

                                            if(theme === null){

                                                res.view('meta/filesharepage',{
                                                    is_super_admin  : '1',
                                                    apps            : account.created_by,
                                                    email           : account.email,
                                                    enterprise_logo : enterpriseLogo,
                                                    avatar          : account.avatar_image,
                                                    // setting         : hideSetting,
                                                    header_color     : '#FFFFFF',
                                                    navigation_color : '#4f7ba9',
                                                    body_background  : '#f9f9f9',
                                                    footer_background: '#f9f9f9',
                                                    font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                    font_color       : '#547aa4',
                                                    total_space_used : dir[0].total_space_used,
                                                        username         : account.name,
                                                        fsName           : req.param('fsName'),
                                                        mimetype         : fileModel.mimetype,
                                                        name             : fileModel.name,
                                                        dtoken           : md5,//page token for download
                                                        fileid           : fileModel.id,
                                                        title            : fileModel.name,
                                                        header_color     : '#FFFFFF',
                                                        navigation_color : '#4f7ba9',
                                                        body_background  : '#f9f9f9',
                                                        footer_background: '#f9f9f9',
                                                        font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                        font_color       : '#547aa4'
                                                });

                                            }else{

                                                res.view('meta/filesharepage',{
                                                    is_super_admin  : '1',
                                                    apps            : account.created_by,
                                                    email           : account.email,
                                                    enterprise_logo : enterpriseLogo,
                                                    avatar          : account.avatar_image,
                                                    // setting         : hideSetting,
                                                    header_color     : theme.header_background  !== '' ? theme.header_background : '#FFFFFF',
                                                    navigation_color : theme.navigation_color   !== '' ? theme.navigation_color : '#4f7ba9',
                                                    body_background  : theme.body_background    !== '' ? theme.body_background : '#f9f9f9',
                                                    footer_background: theme.footer_background  !== '' ? theme.footer_background : '#f9f9f9',
                                                    font_family      : theme.font_family        !== '' ? theme.font_family : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                    font_color       : theme.font_color         !== '' ? theme.font_color : '#547aa4',
                                                    total_space_used : dir[0].total_space_used,
                                                        username         : account.name,
                                                        fsName           : req.param('fsName'),
                                                        mimetype         : fileModel.mimetype,
                                                        name             : fileModel.name,
                                                        dtoken           : md5,//page token for download
                                                        fileid           : fileModel.id,
                                                        title            : fileModel.name,
                                                        header_color     : '#FFFFFF',
                                                        navigation_color : '#4f7ba9',
                                                        body_background  : '#f9f9f9',
                                                        footer_background: '#f9f9f9',
                                                        font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                        font_color       : '#547aa4'
                                                });
                                            }
                                        });
                                    });

                                }else{

                                    if(req.session.Account.isAdmin === true){

                                        Theme.find({
                                            where : { account_id: req.session.Account.id  }
                                        }).done(function(err, theme){

                                            if(theme === null){

                                            res.view('meta/filesharepage',{
                                                is_super_admin  : '0',
                                                apps             : account.created_by,
                                                email            : account.email,
                                                enterprise_logo  : enterpriseLogo,
                                                avatar           : account.avatar_image,
                                                // setting          : hideSetting, 
                                                header_color     : '#FFFFFF',
                                                navigation_color : '#4f7ba9',
                                                body_background  : '#f9f9f9',
                                                footer_background: '#f9f9f9',
                                                font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                font_color       : '#547aa4',
                                                    username         : account.name,
                                                    fsName           : req.param('fsName'),
                                                    mimetype         : fileModel.mimetype,
                                                    name             : fileModel.name,
                                                    dtoken           : md5,//page token for download
                                                    fileid           : fileModel.id,
                                                    title            : fileModel.name,
                                                    header_color     : '#FFFFFF',
                                                    navigation_color : '#4f7ba9',
                                                    body_background  : '#f9f9f9',
                                                    footer_background: '#f9f9f9',
                                                    font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                    font_color       : '#547aa4'
                                            });
                    
                                            }else{
                                                res.view('meta/filesharepage',{
                                                    is_super_admin  : '0',
                                                    apps             : account.created_by,
                                                    email            : account.email,
                                                    enterprise_logo  : enterpriseLogo,
                                                    avatar           : account.avatar_image,
                                                    // setting          : hideSetting, 
                                                    header_color     : theme.header_background  !== '' ? theme.header_background : '#FFFFFF',
                                                    navigation_color : theme.navigation_color   !== '' ? theme.navigation_color : '#4f7ba9',
                                                    body_background  : theme.body_background    !== '' ? theme.body_background : '#f9f9f9',
                                                    footer_background: theme.footer_background  !== '' ? theme.footer_background : '#f9f9f9',
                                                    font_family      : theme.font_family        !== '' ? theme.font_family : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                    font_color       : theme.font_color         !== '' ? theme.font_color : '#547aa4',
                                                        username         : account.name,
                                                        fsName           : req.param('fsName'),
                                                        mimetype         : fileModel.mimetype,
                                                        name             : fileModel.name,
                                                        dtoken           : md5,//page token for download
                                                        fileid           : fileModel.id,
                                                        title            : fileModel.name,
                                                        header_color     : '#FFFFFF',
                                                        navigation_color : '#4f7ba9',
                                                        body_background  : '#f9f9f9',
                                                        footer_background: '#f9f9f9',
                                                        font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                        font_color       : '#547aa4'
                                                });
                                            }
                                        });


                                    }else{
                /******profile condition******/
                                        var sql = "SELECT au.*,p.* FROM adminuser au JOIN profile p on "+
                                        "au.admin_profile_id=p.id WHERE user_id=?";
                                        sql = Sequelize.Utils.format([sql, account.id]);
                                        sequelize.query(sql, null, {
                                            raw: true
                                        }).success(function(adminuser) {


                                            Theme.find({
                                                where : { account_id: account.created_by  }
                                            }).done(function(err, theme){
                                                
                                                if(theme === null){

                                                    res.view('meta/filesharepage',{
                                                        is_super_admin  : '0',
                                                        apps             : account.created_by,
                                                        email            : account.email,
                                                        enterprise_logo  : enterpriseLogo,
                                                        avatar           : account.avatar_image,
                                                        profile          : adminuser,       
                                                        // setting          : hideSetting, 
                                                        header_color     : '#FFFFFF',
                                                        navigation_color : '#4f7ba9',
                                                        body_background  : '#f9f9f9',
                                                        footer_background: '#f9f9f9',
                                                        font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                        font_color       : '#547aa4',
                                                            username         : account.name,
                                                            fsName           : req.param('fsName'),
                                                            mimetype         : fileModel.mimetype,
                                                            name             : fileModel.name,
                                                            dtoken           : md5,//page token for download
                                                            fileid           : fileModel.id,
                                                            title            : fileModel.name,
                                                            header_color     : '#FFFFFF',
                                                            navigation_color : '#4f7ba9',
                                                            body_background  : '#f9f9f9',
                                                            footer_background: '#f9f9f9',
                                                            font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                            font_color       : '#547aa4'
                                                    });
                    
                                                }else{
                                                    
                                                    res.view('meta/filesharepage',{
                                                        is_super_admin  : '0',
                                                        apps             : account.created_by,
                                                        email            : account.email,
                                                        enterprise_logo  : enterpriseLogo,
                                                        avatar           : account.avatar_image,
                                                        profile          : adminuser,
                                                        // setting          : hideSetting, 
                                                        header_color     : theme.header_background  !== '' ? theme.header_background : '#FFFFFF',
                                                        navigation_color : theme.navigation_color   !== '' ? theme.navigation_color : '#4f7ba9',
                                                        body_background  : theme.body_background    !== '' ? theme.body_background : '#f9f9f9',
                                                        footer_background: theme.footer_background  !== '' ? theme.footer_background : '#f9f9f9',
                                                        font_family      : theme.font_family        !== '' ? theme.font_family : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                        font_color       : theme.font_color         !== '' ? theme.font_color : '#547aa4',
                                                            username         : account.name,
                                                            fsName           : req.param('fsName'),
                                                            mimetype         : fileModel.mimetype,
                                                            name             : fileModel.name,
                                                            dtoken           : md5,//page token for download
                                                            fileid           : fileModel.id,
                                                            title            : fileModel.name,
                                                            header_color     : '#FFFFFF',
                                                            navigation_color : '#4f7ba9',
                                                            body_background  : '#f9f9f9',
                                                            footer_background: '#f9f9f9',
                                                            font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                                            font_color       : '#547aa4'
                                                    });
                                                }
                                            });
                    
                                            // res.view('meta/home',{
                                            //  apps            : account.created_by,
                                            //  email           : account.email,
                                            //  profile         : adminuser,
                                            //  enterprise_logo: enterpriseLogo,
                                            //  avatar: account.avatar_image,
                                            //  setting: hideSetting 

                                            // });
                    
                                        }).error(function(e) {
                                            throw new Error(e);
                                        });
                /******end profile condition******/
                                    }
                                }   
                            });
                        });
                        /*Logged in user pages*/
                    }else{
      
                        res.view('meta/filesharepage',{
                            is_super_admin  : '1',
                            apps            : 'account.created_by',
                            email           : 'ANONYMOUS',
                            enterprise_logo : '',
                            avatar          : 'account.avatar_image',
                            // setting         : 'hideSetting',
                            header_color     : '#FFFFFF',
                            navigation_color : '#4f7ba9',
                            body_background  : '#f9f9f9',
                            footer_background: '#f9f9f9',
                            font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                            font_color       : '#547aa4',
                            total_space_used : 'dir[0].total_space_used',
                                username         : '',
                                fsName           : req.param('fsName'),
                                mimetype         : fileModel.mimetype,
                                name             : fileModel.name,
                                dtoken           : md5,//page token for download
                                fileid           : fileModel.id,
                                title            : fileModel.name,
                                header_color     : '#FFFFFF',
                                navigation_color : '#4f7ba9',
                                body_background  : '#f9f9f9',
                                footer_background: '#f9f9f9',
                                font_family      : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
                                font_color       : '#547aa4'
                        });
                    }

/*
                  // If the "open" param isn't set, force the file to download
                    if (!req.url.match(/^\/file\/open\//)) {
                        res.setHeader('Content-disposition', 'attachment; filename=\"' + fileName.trim() + '\"');
                    }

                  // set content-type header

                    res.setHeader('Content-Type', fileModel.mimetype);
                    options.uri = "http://localhost:1337/file/download/"+fileModel.fsName;
                    var proxyReq = request.get(options).pipe(res);
*/

            }

        }else{
            res.send(404);
        }

      }).error(function(err){res.send(err, 500);});


  },

  pDownload: function(req, res){

    var request = require('request');
//    hack the session bro
    var _session = {
      authenticated: true,
      Account: '1'
    };

// Strip original headers of host and connection status
    var headers = req.headers;
    delete headers.host;
    delete headers.connection;

// Build options for request
    var options = {
      uri: 'http://localhost:1337/file/download',
      method: req.method,
      headers: headers
    };

    File.find({where:{fsName:req.param('fsName')}}).success(function (fileModel) {

        // If we have a file model to work with...
        if (fileModel) {

            async.auto({
                // getAdapter: function(cb) {

                //     UploadPaths.find({where:{id:fileModel.uploadPathId}}).done(cb);
                // },
                // showForm: ['getAdapter', function(cb, up) {
                    // console.log('asyncResultsasyncResultsasyncResultsasyncResultsasyncResults');
                    // console.log(up.getAdapter.path);
                    // request.uuploadpath = up.getAdapter.path;
                    // options.uploadpath = up.getAdapter.path;
                // }]
                showForm: function(cb) {

                    //Remove verison (Vx) from the fileName added by abhishek
                    fileName = fileModel.name;
                    fileName = fileName.substr(0, fileName.lastIndexOf("("));

                    var md5 = 'p';
                    if((fileModel.link_password_enabled == true) && (fileModel.link_password != '')){
                        var crypto = require('crypto');
                        md5 = crypto
                                .createHash('md5')
                                .update(fileModel.link_password)
                                .digest('base64');
                    }
                    
                    if((fileModel.link_password_enabled != true) || (fileModel.link_password == '') || (md5 == req.param('dtoken'))){
                      // If the "open" param isn't set, force the file to download
                        // if (!req.url.match(/^\/file\/open\//)) {
                                if(fileModel.mimetype == 'video/mp4'){//If mp4 force the file to download
                                    res.setHeader('Content-disposition', 'attachment; filename=\"' + fileName.trim() + '\"');
                                }
                        // }

                      // set content-type header

                            res.setHeader('Content-Type', fileModel.mimetype);
                            if(fileModel.isOnDrive){

                                fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {
                                  if (err) {
                                    console.log('Error loading client secret file: ' + err);
                                    return;
                                  }
                                  // Authorize a client with the loaded credentials, then call the
                                  // Drive API.

                                  console.log('========================================================================');
                                  console.log(req.param('drive_action'));
                                  // console.log('========================================================================');
                                  // console.log(JSON.parse(content));
                                  // console.log(sails);
                                  sails.controllers.directory.authorize('file_open_by_pathID', fileModel.uploadPathId, req.param('refresh_token'), JSON.parse(content), function (auth, driveUploadPathId) {

                                    console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
                                    console.log(auth);
                                    console.log(driveUploadPathId);

                                    var google = require('googleapis');

                                    var drive = google.drive({
                                      version: 'v2',
                                      auth: auth
                                    });

                                    var fileId = fileModel.fsName;
                                    // res.setHeader('Content-Type', fileModel.mimetype);
                                    console.log('fileId fileModel', fileId, fileModel.mimetype);
                                    /*var dest = fs.createWriteStream('/tmp/'+fileModel.name);
                                    drive.files.get({
                                      fileId: fileId,
                                      alt: 'media'
                                    }, {
                                      encoding: null // Make sure we get the binary data
                                    }, function (err, buffer) {
                                      // Nice, the buffer is actually a Buffer!
                                      buffer.pipe(res);
                                    });*/
                                    /*drive.files.get({
                                       fileId: fileId,
                                       // mimeType: fileModel.mimetype,//'application/pdf'
                                       alt: 'media'
                                    })
                                    .on('end', function() {
                                      console.log('Done');
                                    })
                                    .on('error', function(err) {
                                      console.log('Error during download', err);
                                    })
                                    .pipe(res);*/
                                    var doc_mimes = [
                                        // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',//Export only supports Google Docs.
                                        'application/vnd.google-apps.document',
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                        'application/vnd.google-apps.spreadsheet'
                                    ];
                                    if(_.contains( doc_mimes, fileModel.mimetype)){
                                        console.log('Downloading DOCS');
                                        var proxyReq_temp = drive.files.export({
                                           fileId: fileId,
                                           mimeType: fileModel.mimetype,//'application/pdf'
                                           // alt: 'media'
                                        })
                                        .on('end', function() {
                                          console.log('Done');
                                        })
                                        .on('error', function(err) {
                                          console.log('Error during doc download', err);
                                        });
                                        proxyReq_temp.pipe(
                                            new stream.PassThrough().pipe(
                                                fileSystem.createWriteStream( "./copy_" + fileModel.fsName )
                                            )
                                        );

                                        var proxyReq = proxyReq_temp.pipe(res);
                                    }else{
                                        console.log('Downloading FILES');
                                        var proxyReq_temp = drive.files.get({
                                           fileId: fileId,
                                           // mimeType: fileModel.mimetype,//'application/pdf'
                                           alt: 'media'
                                        })
                                        .on('end', function() {
                                          console.log('Done');
                                        })
                                        .on('error', function(err) {
                                          console.log('Error during media download', err);
                                        }).pipe(res);
                                        // proxyReq_temp.pipe(
                                        //     new stream.PassThrough().pipe(
                                        //         fileSystem.createWriteStream( "./copy_" + fileModel.fsName )
                                        //     )
                                        // );

                                        // var proxyReq = proxyReq_temp.pipe(res);
                                    }
                                  });
                                });

                            }else{
                                options.uri = "http://localhost:1337/file/download/"+fileModel.fsName;
                                // var proxyReq = request.get(options).pipe(res);
                                // if (req.url.match(/^\/file\/open\//)) {//open
                                    //Rishabh: Backpressure issue reolved
                                    // http://www.bennadel.com/blog/2817-the-affect-of-back-pressure-when-piping-data-into-multiple-writable-streams-in-node-js.htm
                                    var proxyReq_temp = request.get(options);
                                    proxyReq_temp.pipe(
                                        new stream.PassThrough().pipe(
                                            fileSystem.createWriteStream( "./copy_" + fileModel.fsName )
                                        )
                                    );

                                    var proxyReq = proxyReq_temp.pipe(res);
                            }
                        // }else{//download
                        //     var proxyReq = request.get(options).pipe(res);
                        // }
                    }else{
                        res.send(403);
                        // return res.json({error: 'File can not be accessed.', type: 'error'});
                    }
                    cb();
                }

            });

            
        }else{
            res.send(403);//Forbidden
        }

      }).error(function(err){res.send(err, 500);});


  },

  pPreview: function(req, res){

    var request = require('request');

// hack the session bro
    var _session = {
        authenticated: true,
        Account: req.session.Account
    };

    File.find(req.param('id')).success(function (fileModel) {
        // If we have a file model to work with...
        if (fileModel) {

            var md5 = 'p';
            if((fileModel.link_password_enabled == true) && (fileModel.link_password != '')){
                var crypto = require('crypto');
                md5 = crypto
                        .createHash('md5')
                        .update(fileModel.link_password)
                        .digest('base64');
            }

            if((fileModel.link_password_enabled != true) || (fileModel.link_password == '') || (md5 == req.param('dtoken'))){
                var options = {
                    uri: 'http://localhost:1337/logging/register/',
                    method: 'POST',
                };

                if (!req.url.match(/^\/file\/pPreview\//)) {
                    res.setHeader('Content-disposition', 'attachment; filename=\"' + fileModel.name + '\"');

                    if (req.headers['user-agent'].indexOf('Linux') > -1 || req.headers['user-agent'].indexOf('Window') > -1 || req.headers['user-agent'].indexOf('Mac') > -1) {
                        var user_platform = "Web Application";
                    } else {
                        var user_platform = req.headers['user-agent'];
                    }



                    /* Logging Of File Download */
                    options.json = {
                        user_id: req.session.Account?req.session.Account.id:'Anonymous',
                        text_message: 'has downloaded ' + fileModel.name,
                        activity: 'download',
                        on_user: fileModel.id,
                        ip: '',//req.session.Account ? req.headers['ip'] : req.session.Account.ip,
                        platform: user_platform,
                    };
                    
                    request(options, function (err, response, body) {
                        if (err)
                            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    });
                }
    //                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&  FS name  &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    //                    console.log(req.url);
    //                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&& FS name &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');

                // set content-type header
                res.setHeader('Content-Type', fileModel.mimetype);
                options.uri = "http://localhost:1337/file/download/" + fileModel.fsName + "?_session=" + JSON.stringify(_session);

                if(fileModel.isOnDrive){

                    fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {
                      if (err) {
                        console.log('Error loading client secret file: ' + err);
                        return;
                      }
                      // Authorize a client with the loaded credentials, then call the
                      // Drive API.

                      console.log('========================================================================');
                      console.log(req.param('drive_action'));
                      // console.log('========================================================================');
                      // console.log(JSON.parse(content));
                      // console.log(sails);
                      sails.controllers.directory.authorize('file_open_by_pathID', fileModel.uploadPathId, req.param('refresh_token'), JSON.parse(content), function (auth, driveUploadPathId) {

                        console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
                        console.log(auth);
                        console.log(driveUploadPathId);

                        var google = require('googleapis');

                        var drive = google.drive({
                          version: 'v2',
                          auth: auth
                        });

                        var fileId = fileModel.fsName;
                        // res.setHeader('Content-Type', fileModel.mimetype);
                        console.log('fileId fileModel', fileId, fileModel.mimetype);
                        /*var dest = fs.createWriteStream('/tmp/'+fileModel.name);
                        drive.files.get({
                          fileId: fileId,
                          alt: 'media'
                        }, {
                          encoding: null // Make sure we get the binary data
                        }, function (err, buffer) {
                          // Nice, the buffer is actually a Buffer!
                          buffer.pipe(res);
                        });*/
                        /*drive.files.get({
                           fileId: fileId,
                           // mimeType: fileModel.mimetype,//'application/pdf'
                           alt: 'media'
                        })
                        .on('end', function() {
                          console.log('Done');
                        })
                        .on('error', function(err) {
                          console.log('Error during download', err);
                        })
                        .pipe(res);*/
                        var doc_mimes = [
                            // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',//Export only supports Google Docs.
                            'application/vnd.google-apps.document',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'application/vnd.google-apps.spreadsheet'
                        ];
                        if(_.contains( doc_mimes, fileModel.mimetype)){
                            console.log('Downloading DOCS');
                            var proxyReq_temp = drive.files.export({
                               fileId: fileId,
                               mimeType: fileModel.mimetype,//'application/pdf'
                               // alt: 'media'
                            })
                            .on('end', function() {
                              console.log('Done');
                            })
                            .on('error', function(err) {
                              console.log('Error during doc download', err);
                            });
                            proxyReq_temp.pipe(
                                new stream.PassThrough().pipe(
                                    fileSystem.createWriteStream( "./copy_" + fileModel.fsName )
                                )
                            );

                            var proxyReq = proxyReq_temp.pipe(res);
                        }else{
                            console.log('Downloading FILES');
                            var proxyReq_temp = drive.files.get({
                               fileId: fileId,
                               // mimeType: fileModel.mimetype,//'application/pdf'
                               alt: 'media'
                            })
                            .on('end', function() {
                              console.log('Done');
                            })
                            .on('error', function(err) {
                              console.log('Error during media download', err);
                            }).pipe(res);
                            // proxyReq_temp.pipe(
                            //     new stream.PassThrough().pipe(
                            //         fileSystem.createWriteStream( "./copy_" + fileModel.fsName )
                            //     )
                            // );

                            // var proxyReq = proxyReq_temp.pipe(res);
                        }
                      });
                    });

                }else{
                    // var proxyReq = request.get(options).pipe(res);
                    // if (req.url.match(/^\/file\/open\//)) {//open
                        //Rishabh: Backpressure issue reolved
                        // http://www.bennadel.com/blog/2817-the-affect-of-back-pressure-when-piping-data-into-multiple-writable-streams-in-node-js.htm
                        var proxyReq_temp = request.get(options);
                        proxyReq_temp.pipe(
                            new stream.PassThrough().pipe(
                                fileSystem.createWriteStream( "./copy_" + fileModel.fsName )
                            )
                        );

                        var proxyReq = proxyReq_temp.pipe(res);
                    // }else{//download
                    //     var proxyReq = request.get(options).pipe(res);
                    // }
                    proxyReq.on('error', function (err) {
                        res.send(err, 500)
                    });
                }
            }else{
                res.send(403);
            }
        }

    }).error(function (err) {
        res.send(err, 500);
    });
    return;
  },

  subscribedPlan: function(req, res){
    
    var sql = "SELECT *,DATE_FORMAT(DATE(createdAt),'%d %b %y') AS acc_created, DATE_FORMAT(DATE_ADD(DATE(createdAt), INTERVAL duration MONTH),'%d %b %y') as expiryDate FROM transactiondetails "+
              "WHERE is_deleted=0 AND account_id=? ORDER BY id DESC";
        sql = Sequelize.Utils.format([sql,req.session.Account.id]);
        sequelize.query(sql, null, {
          raw: true
        }).success(function(dirs) {
          res.json(dirs, 200);
      });
  },

 listSubscription:function(req, res){
    
    var sql = "SELECT id, features, price, users_limit, IF(quota/1000000000 = '1000', 'Unlimited', quota/1000000000) as quota, is_default, is_active, duration, "+
    "IF(duration >= 12,CONCAT(duration/12,'','Y'),CONCAT(duration,'','M')) AS durat from subscription "+
    "WHERE is_active IS NULL";
    sql = Sequelize.Utils.format([sql]);

    console.log("Printing SQL STATMENT");
    console.log(sql);

    sequelize.query(sql, null, {
          raw: true
    }).success(function(dirs) {
        if(dirs.length){ // check for no records exists
            res.json(dirs, 200);
        }else{
            res.json({
              features: 'error_123',
              notFound : true,  
            });
        }
    });

  },

  upgradePayment: function(req, res){
    var request = require('request');
    var paypal_sdk = require('paypal-rest-sdk');

    var sub_id = req.params.id;
    // var temp_id = req.body.temp;
    // var sub_name = req.body.sub_name;
    // var d = new Date();
    // var y = d.getFullYear(); 
    // var duration_to = parseInt(req.body.duration)+y;

      paypal_sdk.configure({
      'host': 'api.sandbox.paypal.com',
      'client_id': 'Acp-phDclj-YRVsO7Id0BPSqvV3KkjqwkMbGxgA1fY2kIJVsWztWmB19XJlI',
      'client_secret': 'EBCNCRCjlhhTBUaHNv6ViNx5O2VsHmuu7veONAKw-t7hxtLqqQBu3rd_RUIr' });
      paypal_sdk.generate_token(function(error, token){
        if(error){
          
        } else {
        }
      });

      var payment_details = {
        "intent": "sale",
        "payer": {
        "payment_method": "credit_card",
        "funding_instruments": [{
        "credit_card": {
        "type": req.params.card_type,
        "number": req.params.customer_credit_card_number,
        "expire_month": req.params.cc_expiration_month,
        "expire_year": req.params.cc_expiration_year,
        "cvv2": req.params.cc_cvv2_number,
        "first_name": req.params.f_name,
        "last_name": req.params.l_name,
        "billing_address": {
          "line1": req.params.address,
          "city": req.params.city,
          "state": req.params.state,
          "postal_code": req.params.customer_zip,
          "country_code": req.params.country_code }}}]},
  "transactions": [{
    "amount": {
      "total": req.params.amount,
      "currency": "USD",
      "details": {
        "subtotal": req.params.amount,
        "tax": "0.00",
        "shipping": "0.00"}},
    "description": "This is the payment transaction description." }]};

    console.log('*****yyy****');
    console.log(payment_details);
    

  paypal_sdk.payment.create(payment_details, function(error, payment){
    if(error){
      
    } else {
      if(payment.state === 'approved'){

        var sql = "UPDATE account SET subscription_id="+sub_id+" WHERE id = ?";
        sql = Sequelize.Utils.format([sql, req.session.Account.id]);
        sequelize.query(sql, null, {
          raw: true
        }).success(function(dirs) {
        
            Subscription.find({
              where: { id: sub_id }
            }).done(function(err, subscription) {
             
               // Save to transactionDetails table
              var tran_options = {
                uri: 'http://localhost:1337/transactiondetails/register/' ,
                method: 'POST',
              };

            tran_options.json =  {
              trans_id        : payment.id,
              account_id      : req.session.Account.id,
              created_date    : payment.create_time,
              users_limit     : subscription.users_limit,
              quota           : subscription.quota,
              plan_name       : subscription.features,
              plan_id         : subscription.id,
              price           : subscription.price,
              duration        : subscription.duration,
              paypal_status   : payment.state,
          };

        
      request(tran_options, function(err1, response1, body1) {
      if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
//        Resend using the original response statusCode
//        use the json parsing above as a simple check we got back good stuff

         /*Create logging*/
            var options = {
              uri: 'http://localhost:1337/logging/register/' ,
              method: 'POST',
            };

            options.json =  {
                user_id     : req.session.Account.id,
                text_message: 'has upgraded own subscription plan.',
                activity    : 'upgrade',
                on_user     : req.session.Account.id,
                ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                platform    : req.headers.user_platform,
            };

          request(options, function(err21, response21, body21) {
            if(err) return res.json({ error: err21.message, type: 'error' }, response21 && response21.statusCode);
                res.json(body1, response1 && response1.statusCode);
            });
          /*End logging*/

        });

      // end transaction history
      });

    });


      }else{
        console.log('**not approved**');
      }
      console.log('**payment success11**');
      console.log(payment);
    }
  });
},

	// Upgrade Free Subscription
  upgradeFree:function(req, res){
    var request = require('request');

    var sql = "UPDATE account SET subscription_id="+req.params.id+" WHERE id = ?";
        sql = Sequelize.Utils.format([sql, req.session.Account.id]);
        sequelize.query(sql, null, {
          raw: true
        }).success(function(account) {

             Subscription.find({
                where: { id: req.params.id }
             }).done(function(err, subscription) {
                console.log('**in subscc**');
                console.log(subscription);
                // Save to transactionDetails table
              var tran_options = {
                  uri: 'http://localhost:1337/transactiondetails/register/' ,
                  method: 'POST',
                };

            var created_date = new Date();
            tran_options.json =  {
              trans_id        : 'free',
              account_id      : req.session.Account.id,
              created_date    : created_date,
              users_limit     : subscription.users_limit,
              quota           : subscription.quota,
              plan_name       : subscription.features,
              plan_id         : subscription.id,
              price           : subscription.price,
              duration        : subscription.duration,
              paypal_status   : '',
           };

          console.log('***this is in history**');
          console.log(tran_options);

          request(tran_options, function(err1, response1, body1) {
          if(err1) return res.json({ error: err1.message, type: 'error' }, response1 && response1.statusCode);
            // res.json(body1, response1 && response1.statusCode);

            /*Create logging*/
            var options = {
              uri: 'http://localhost:1337/logging/register/' ,
              method: 'POST',
            };

            options.json =  {
              	user_id     : req.session.Account.id,
              	text_message: 'has upgraded own subscription plan.',
              	activity    : 'upgrade',
              	on_user     : req.session.Account.id,
		ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                platform    : req.headers.user_platform,

            };

          request(options, function(err21, response21, body21) {
            if(err) return res.json({ error: err21.message, type: 'error' }, response21 && response21.statusCode);
                res.json({'success':'1'});
            });
          /*End logging*/
          
          });

          // end transaction history
          });

      });
  },

};
_.extend(exports, SubscriptionController);
