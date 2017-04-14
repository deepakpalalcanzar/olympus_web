/*---------------------
  :: Enterprises
  -> controller
---------------------*/
var destroy = require('../services/lib/account/destroy'),
    crypto = require('crypto');
    
var EnterprisesController = {
    register: function (req, res) {
        Enterprises.createEnterprises(req.body, function(err, enterprise) {
            if (err) return res.json({error: 'Error creating enterprise',type: 'error'});
            return  res.json({
                        enterprise: {id: enterprise.id,}
                    });
        });
    },

    update: function(req, res){

        var enterprise_id = req.param('enterprise_id');

        Subscription.findOne({
            id : req.param('subscription')
        }).done(function (err, subscription){
            
            if (err) return res.json({
                 error: new Error('Subscription selected dows not exist').message,
                type: 'error'
            }, 400);

            Account.findOne({
                id : req.param('enterprise_id')
            }).then(function (accountData){

                if (!accountData) return res.json({
                    error: 'No Account found with that ID',
                    type: 'error'
                }, 400);
                

                /* update enterprise*/
                    Enterprises.findOne({
                        id : req.param('ent_id')
                    }).then(function (entData){
            
                        if (req.param('enterprises_name')) entData.name = req.param('enterprises_name');
                        entData.save(function (err) {
                        if (err) return res.json({
                            error: err.message,
                            type: 'error'
                        });
                            return res.json(entData, 200);
                        });
                    });
                /* end update enterprise*/

                if( accountData.subscription_id == req.param('subscription') ){
// Update Model Values
                    if (req.param('email')) accountData.email = req.param('email');
                    if (req.param('owner_name')) accountData.name = req.param('owner_name');
// Save the Account, returning a 200 response
                    accountData.save(function (err) {
                        if (err) return res.json({
                            error: err.message,
                            type: 'error'
                        });
                        return res.json(accountData, 200);
                    });

                }else {

                    Account.count({
                        created_by: req.param('enterprise_id')
                    }).done(function(err, account){

                        if (err) return res.json({
                            error: new Error('Subscription selected rows not exist').message,
                            type: 'error'
                        }, 400);

                        Directory.count({
                            OwnerId: req.param('enterprise_id')
                        }).done(function(err, directory){

                            if (err) return res.json({
                                error: new Error('Error Occured').message,
                                type: 'error'
                            }, 400);
                            
                            Directory.findOne({
                                OwnerId: req.param('enterprise_id')
                            }).done(function(er, dir){

                                    //Check users limit if less than users send message
                                    if(subscription.users_limit < account){
                                        return res.json({
                                            type : 'error_users_limit',
                                        });
                                    }
                                    
                                    //Checkin quota
                                    if(((subscription.users_limit >= account ) && ((subscription.quota*1000000000) >= dir.size)) || (subscription.users_limit === 'Unlimited')){
                                    // Update Model Values
                                    if (req.param('email')) accountData.email = req.param('email');
                                    if (req.param('owner_name')) accountData.name = req.param('owner_name');
                                    if (req.param('subscription')) accountData.subscription_id = req.param('subscription');
                                    // Save the Account, returning a 200 response
                                    accountData.save(function (err) {
                                        if (err) return res.json({
                                            error: err.message,
                                            type: 'error'
                                        });
                                        return res.json(accountData, 200);
                                     });

                                    /*Update directory quota*/
                                    dir.quota = subscription.quota*1000000000;
                                    dir.save(function (err1) {
                                        if (err1) return res.json({
                                            error: err.message,
                                            type: 'error'
                                        });
                                    return res.json(dir, 200);
                                    });
                                    /*End Update directory*/
                                };
 
                            //End checking Quota
                            });
                            
                        });
                    });
                }
            });
        });
    }

};
module.exports = EnterprisesController;