/*---------------------
  :: Enterprises
  -> model
---------------------*/
var bcrypt = require('bcrypt'),
    lockUtils = require('../services/lib/account/lock'),
    deleteUtils = require('../services/lib/account/destroy'),
    crypto = require('crypto'),
    Q = require('q');

module.exports = {

    attributes: {

        is_impersonate: 'boolean',

        name: 'string',

        account_id: 'integer',

        is_active: {
          type: 'boolean',
          defaultsTo: 0
        }

    },

    createEnterprises: function (options, cb) {

        if(options.error === 'Account with that email already exists'){
            
            var dirOptions = {
                name: options.name + '\'s Workgroup',
                quota: options.quota
            };

            Directory.createWorkgroup(dirOptions, options.account_id, true, function (err, results) {
                if (err) return cb && cb(err);
                    //return cb && cb(null, account);
            });

        }

        Enterprises.create({
            account_id      : options.account_id,
            name            : options.enterprises_name,
            is_active       : '1',
        }).exec(function foundAccount (err, account) {
            if (err) return cb && cb(err);   
            cb(account);   
        });
    },

    updateEnterprise: function(options, cb){

    },
    
};