/*---------------------
  :: AdminUser
  -> controller
---------------------*/
var destroy = require('../services/lib/account/destroy'),
    crypto = require('crypto');
    
var AdminUserController = {
    register: function (req, res) {
        AdminUser.createAdminUser(req.body, function(err, adminuser) {
            if (err) return res.json({error: 'Error creating adminuser',type: 'error'});
            return  res.json({
                        adminuser: {id: adminuser.id,email_msg : req.body.email_msg,}
                    });
        });
    },
};
module.exports = AdminUserController;
