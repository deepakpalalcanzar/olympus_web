/*---------------------
  :: Subscription
  -> model
---------------------*/

var bcrypt      = require('bcrypt'),
    lockUtils   = require('../services/lib/account/lock'),
    deleteUtils = require('../services/lib/account/destroy'),
    crypto      = require('crypto'),
    Q           = require('q');

module.exports = {

    attributes: {

        features: {
          type: 'string',
          unique: false,
          required: true
        },

        price: {
          type: 'decimal',
          required: true
        },

        duration: {
          type: 'string',
          required: true
        },

        users_limit: 'string',

        quota: 'string',

        is_default: {
          type: 'boolean',
          defaultsTo: false
        },

        is_active: {
          type: 'boolean',
          defaultsTo: false
        }

    },

 // creates an account, returning a promise if no callback is specified
    createSubscription: function (options, cb) {

      var quotaInBytes = options.quota * 1000000000 ;

      async.auto({
        isDefault: function(cbcheckdefault) {

          if(options.is_default == '1'){

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

            Subscription.create({

              features    : options.features,
              price       : options.price,
              duration    : options.duration,
              users_limit : options.users_limit,
              quota       : quotaInBytes,
              is_default  : options.is_default,
              is_active   : null

                    }).exec(function foundAccount (err, account) {

                if (err) return cb && cb(err);
                cb(account);

            });
        }],
      });
    }
};
