/*---------------------
  :: Account
  -> model
---------------------*/
var bcrypt = require('bcrypt'),
    lockUtils = require('../services/lib/account/lock'),
    deleteUtils = require('../services/lib/account/destroy'),
    crypto = require('crypto'),
    Q = require('q');

module.exports = {

    attributes: {

        email: {
          type: 'string',
          unique: true,
          required: true
        },

        password: {
          type: 'string',
          minLength: 3,
          required: true
        },

        name: {
          type: 'string',
          minLength: 3,
          maxLength: 25,
          required: true
        },

        phone: 'string',
        title: 'string',

        verified: {
          type: 'boolean',
          defaultsTo: false
        },

        verificationCode: 'string',
        avatar_fname: 'string',
        avatar_mimetype: 'string',
        enterprise_fsname: 'string',
        enterprise_mimetype: 'string',
        avatar_image: 'string',

        avatarUploadPathId: {
          type: 'integer',
          defaultsTo: 1
        },

        enpUploadPathId: {
          type: 'integer',
          defaultsTo: 1
        },

        isAdmin: {
          type: 'boolean',
          defaultsTo: false
        },

        isLdapUser: {
          type: 'boolean',
          defaultsTo: false
        },

        isADUser: {
          type: 'boolean',
          defaultsTo: false
        },

        deleted: {
          type: 'boolean',
          defaultsTo: false
        },

        
        deleteDate: 'datetime',
        isLocked: {
          type: 'boolean',
          defaultsTo: false
        },

        created_by: {
          type: 'integer',
        },

    // This is needed because sequelize tries to automap to this value
        shareId: {
          type: 'integer'
        },

        subscription_id: {
          type: 'integer'
        },
        is_enterprise: {
          type: 'boolean',
          defaultsTo: false
        },
        isSuperAdmin: {
          type: 'boolean',
          defaultsTo: false
        },

    /****************************************************
     * Instance Methods
     ****************************************************/

    /**
     * Override the destroy instance method to flag as deleted
     *
     * @param {Function} callback
     */

        destroy: function (cb) {
            var self = this;
    // Flag as deleted
            this.deleted = true;
            this.deleteDate = new Date();
            //Rishabh: fix for allowing sign up with an email again if account is deleted
            var currenttime = Date.now || function() {
              return +new Date;
            };
            this.email = this.email + '.disabled.' + (currenttime()/1000).toFixed();
            this.save(function (err) {
                if (err) return cb(err);
                // deleteUtils.recursiveDelete(self.id, function (err) {
                //     if (err) return cb(err);
                //     cb(null, self);
                // });
                cb(null, self);
            });
        },

/**
 * Override toJSON()
 */
        toJSON: function () {
            var obj = this.toObject();
            delete obj.password;
            delete obj.deleted;
            delete obj.verified;
            delete obj.verificationCode;
            return obj;
        },


    /**
     * Lock an account and recursively lock all directories and files within
     * any workgroups the account is owner of.
     */

        lock: function (lockState, cb) {
            var self = this;
    // Flag as locked
            this.isLocked = lockState;
            this.save(function (err) {
                if (err) return cb(err);
                lockUtils.recursiveLock(self.id, lockState, function (err) {
                  if (err) return cb(err);
                  cb(null, self);
                });
            });
        }
    },

  // creates an account, returning a promise if no callback is specified
    createAccount: function (options, cb) {

        var name                = options.name || options.email;
        var email               = options.email;
        var password            = options.password || crypto.randomBytes(10).toString('hex');
        var isAdmin             = options.isAdmin || false;
        var verificationCode    = crypto.randomBytes(20).toString('hex');
        var verified            = options.isVerified;
        var created_by          = options.created_by;
        var title               = options.title;
        var is_enterprise       = options.is_enterprise;
        var subscription_id     = options.subscription_id;
        var isLdapUser          = options.isLdapUser;
        var isADUser            = options.isADUser;
        Account.create({

            name            : options.name || options.email,
            email           : options.email,
            password        : options.password || crypto.randomBytes(10).toString('hex'),
            isAdmin         : options.isAdmin || false,
            verificationCode: crypto.randomBytes(20).toString('hex'),
            verified        : options.isVerified,
            created_by      : options.created_by,
            title           : options.title,
            is_enterprise   : options.is_enterprise,
            subscription_id : options.subscription_id,
            isLdapUser      : options.isLdapUser,
            isADUser        : options.isADUser

        }).exec(function foundAccount (err, account) {

            if (err) return cb && cb(err);
            // Now create a workgroup, assigning the new account as an admin
            if(typeof options.enterprise_name !== 'undefined'){
                var dirOptions = {
                    name:   options.enterprise_name + '\'s Workgroup',
                    quota:  options.quota
                };
            }else{
                var dirOptions = {
                    name: account.name + '\'s Workgroup',
                    quota: options.quota
                };
            }

            Directory.createWorkgroup(dirOptions, account.id, true, function (err, results) {
                if (err) return cb && cb(err);
                return cb && cb(null, account);
            });
        });
    },



  /****************************************************
   * Lifecycle Callbacks
   ****************************************************/

    beforeCreate: function encryptPassword(values, cb) {
        bcrypt.hash(values.password, 10, function (err, hash) {
            if (err) return cb(err);
            values.password = hash;
            cb();
        });
    },


    beforeSave: function encryptPassword(values, cb) {
        bcrypt.hash(values.password, 10, function (err, hash) {
            if (err) return cb(err);
            values.password = hash;
            cb();
        });
    }

};
