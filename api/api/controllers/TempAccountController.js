/*---------------------
  :: TempAccount
  -> controller
---------------------*/

var destroy = require('../services/lib/account/destroy'),
    crypto = require('crypto'),
    emailService = require('../services/email');

var TempAccountController = {

    register: function (req, res) {



        if (!req.param('email')) return res.json({
            error: 'No email provided',
            type: 'error'
        }, 400);

    // If the requested account already exists, return it
        Account.findOne({
            email: req.param('email')
        }).exec(function (err, account) {

            if (err) return res.json({
                error: 'Error creating email',
                type: 'error'
            });

            if (account) return res.json({
                error: 'Account with that email already exists',
                type: 'error'
            });

            if(req.param('isVerified') && !req.param('password')) {
                return res.json({
                  error: 'Account cannot be verified without a password',
                  type: 'error'
                });
            }

            var options = {
                first_name      : req.param('first_name'),
                last_name       : req.param('last_name'),
                email             : req.param('email'),
                password          : req.param('password'),
                is_enterprise     : req.param('is_enterprise'),
                enterprise_name   : req.param('enterprise_name'),
                ip_address        : req.param('ip_address'),
            };
            
            TempAccount.createAccount(options, function(err, account) {

                if (err) return res.json({
                  error: 'Error creating account',
                  type: 'error'
                });

                if (!req.param('isVerified')) {
// send them a verfication email
                    emailService.sendVerifyEmail({
                        account: account
                    }, function (err, data) {

                        if (err) return res.json({
                          error: 'Error sending verification email',
                          type: 'error'
                        });

                        return res.json({
                          account: {
                            name: account.name,
                            email: account.email,
                            id   : account.id
                          }
                        });
                    });

                } else {
// send them a welcome email
                    emailService.sendWelcomeEmail({
                        account: account
                    }, function (err, data) {
                
                        if (err) return res.json({
                            error: 'Error sending welcome email',
                            type: 'error'
                        });

                        return res.json({
                            account: {
                              name   : account.name,
                              email  : account.email,
                              id     : account.id
                            }
                        });
                    });

                    return res.json({
                        account: {
                            name: account.name,
                            email: account.email,
                            id   : account.id
                        }
                    });
                }
            });
        });
    },


  /**
   * PUT /account/:id
   *
   * Updates a user's account params
   *
   * ACL should be done at the policy level before getting here
   * so we can just look up the Account by the `id` param.
   *
   * @param {String} email
   * @param {String} name
   * @param {String} phone
   * @param {String} title
   * @param {String} password
   */

    update: function (req, res) {

        if (!req.param('id')) {
            return res.send({
                error: new Error('Must include an Account ID').message,
                type: 'error'
            }, 400);
        }

        // Look up Account for currently logged-in user
        Account.findOne(req.param('id')).then(function (account) {

        // Make sure an Account exists with that ID
            if (!account) return res.json({
                error: 'No Account found with that ID',
                type: 'error'
            }, 400);

        // Update Model Values
            if (req.param('email')) account.email = req.param('email');
            if (req.param('name')) account.name = req.param('name');
            if (req.param('phone')) account.phone = req.param('phone');
            if (req.param('title')) account.title = req.param('title');
            if (req.param('password')) account.password = req.param('password');

        // Save the Account, returning a 200 response
            account.save(function (err) {
                if (err) return res.json({
                    error: err.message,
                    type: 'error'
                });
                return res.json(account, 200);
            });

        }).fail(function (err) {
            return res.json({
                error: err.message,
                type: 'error'
            }, 500);
        });
    },


  /**
   * DELETE /account/:id
   *
   * Destroys an account
   *
   * ACL should be done at the policy level before getting here
   * so we can just use the id param in the Account Query
   */

    del: function (req, res) {

        if (!req.param('id')) {
            return res.json({
                error: new Error('Must include an Account ID'),
                type: 'error'
            }, 400);
        }

        // Update Account and mark as deleted
        Account.findOne(req.param('id')).exec(function (err, account) {
            if (err) return res.json({ error: err, type: 'error' }, 400);
            
            if (!account) {
                return res.json({
                    error: new Error('No account found with that ID'),
                    type: 'error'
                }, 400);
            }

            account.destroy(function (err) {
                if (err) return res.json({ error: err, type: 'error' }, 400);
                res.json({ status: 'ok' }, 200);
            });
        });
    },


  /**
   * PUT /account/:id/lock
   *
   * Locks/unlocks an account and all directories and files under workgroups the account
   * is owner of.
   *
   * ACL should be done at the policy level before getting here
   * so we can just use the id param in the Account Query
   */

    lock: function (req, res) {
        
        if (!req.param('id')) {
            return res.json({
                error: new Error('Must include an Account ID'),
                type: 'error'
            }, 400);
        }

        // Update Account and mark as locked or unlocked depending on input
        Account.findOne(req.param('id')).exec(function (err, account) {

            if (err) return res.json({ error: err, type: 'error' }, 400);
            if (!account) {
                return res.json({
                    error: new Error('No account found with that ID'),
                    type: 'error'
                }, 400);
            }

            // !! will cast the variable to a boolean
            account.lock( !! req.param('lock'), function (err) {
                if (err) return res.json({ error: err, type: 'error' }, 400);
                res.json(account, 200);
            });
        });
    }
};

module.exports = TempAccountController;
