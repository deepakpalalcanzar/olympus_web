/*---------------------
  :: Subscription
  -> controller
---------------------*/
var destroy = require('../services/lib/account/destroy'),
    crypto = require('crypto');
    
var ProfileController = {

    profileUpdate: function(req, res){

        if (!req.param('id')) {
          return res.send({
            error: new Error('Must include an Account ID').message,
            type: 'error'
          }, 400);
        }

// Look up Account for currently logged-in user
        Profile.findOne(req.param('id')).then(function (profile) {

// Make sure an Account exists with that ID
            if (!profile) return res.json({
                error: 'No Account found with that ID',
                type: 'error'
            }, 400);

// Update Model Values
            if (req.param('name')) profile.name                       = req.param('name');
            if (req.param('user_managment')) profile.user_managment   = req.param('user_managment');
            if (req.param('enterprises_management')) profile.enterprises_managment = req.param('enterprises_management');
            if (req.param('subscription')) profile.subscription_managment                     = req.param('subscription');
            if (req.param('workgroup_managment_of_users')) profile.user_workgroup_mangment = req.param('workgroup_managment_of_users');
            if (req.param('workgroup_managment_of_enterprises')) profile.enterprises_workgroup_managment = req.param('workgroup_managment_of_enterprises');
            if (req.param('manage_admins')) profile.manage_admins           = req.param('manage_admins');
            if (req.param('manage_superadmin')) profile.superadmins   = req.param('manage_superadmin');
            if (req.param('manage_admin_user')) profile.manage_admin_user   = req.param('manage_admin_user');

// Save the Account, returning a 200 response
            profile.save(function (err) {
                if (err) return res.json({
                    error: err.message,
                    type: 'error'
                });
                return res.json(profile, 200);
            });

        }).fail(function (err) {
            return res.json({
                error: err.message,
                type: 'error'
            }, 500);
        });

    }

};
module.exports = ProfileController;