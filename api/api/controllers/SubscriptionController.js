/*---------------------
  :: Subscription
  -> controller
---------------------*/
var destroy = require('../services/lib/account/destroy'),
    crypto = require('crypto');

var SubscriptionController = {

    register: function (req, res) {
        //Throws error when adding subscription from admin
        // Subscription.createSubscription(req.body, true, function(err, subscription) {
        //     if (err) return res.json({error: 'Error creating subscription',type: 'error'});
        //     return  res.json({
        //                 subscription: {id: subscription.id,}
        //             });
        // });

        //Rishabh
        Subscription.createSubscription(req.body, function(err, subscription) {
            if (err) return res.json({error: 'Error creating subscription',type: 'error'});
            return  res.json({
                        subscription: {id: subscription.id,}
                    });
        });

    },

    updateSubscription: function (req, res) {

        if (!req.param('id')) {
          return res.send({
            error: new Error('Must include an Account ID').message,
            type: 'error'
          }, 400);
        }

// Look up Account for currently logged-in user
        Subscription.findOne(req.param('id')).then(function (subscription) {

// Make sure an Account exists with that ID
            if (!subscription) return res.json({
                error: 'No Account found with that ID',
                type: 'error'
            }, 400);

// Update Model Values
            if (req.param('features')) subscription.features         = req.param('features');
            if (req.param('price')) subscription.price               = req.param('price');
            if (req.param('users_limit')) subscription.users_limit   = req.param('users_limit');
            if (req.param('quota')) subscription.quota               = req.param('quota') * 1000000000 ;
            if (req.param('is_default')) subscription.is_default     = req.param('is_default');
            if (req.param('duration')) subscription.duration     = req.param('duration');

            async.auto({
                isDefault: function(cbcheckdefault) {

                  if(subscription.is_default == '1'){

                    Subscription.update({ is_default: '1' }, { is_default: '0'}, function(err, users) {
                      // Error handling
                      if (err) {
                        console.log(err);
                        cbcheckdefault();
                      // Updated users successfully!
                      } else {
                        cbcheckdefault();
                      }
                    });
                  }
                },
                createPlan: ['isDefault', function(cbcheckdefault, up) {

// Save the Account, returning a 200 response
                    subscription.save(function (err) {
                        if (err) return res.json({
                            error: err.message,
                            type: 'error'
                        });

                        if(req.param('upd_existing') == 1){
                            TransactionDetails.update({
                                plan_id: req.param('id')
                            }, {
                                plan_name         : req.param('features'),
                                price             : req.param('price'),
                                users_limit       : req.param('users_limit'),
                                quota             : req.param('quota') * 1000000000,
                                duration          : req.param('duration')
                            }).exec(function(err, dir){
                                console.log(dir.length, ' plans updated.');
                            });
                        }
                        return res.json(subscription, 200);
                    });
                }],
            });
        }).fail(function (err) {
            return res.json({
                error: err.message,
                type: 'error'
            }, 500);
        });
    },
};
module.exports = SubscriptionController;
