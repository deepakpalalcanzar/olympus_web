/*---------------------
  :: Logging
  -> model
---------------------*/

var bcrypt = require('bcrypt'),
  lockUtils = require('../services/lib/account/lock'),
  deleteUtils = require('../services/lib/account/destroy'),
  crypto = require('crypto'),
  Q = require('q');

module.exports = {

  attributes: {

    user_id: {
      type: 'integer',
    },

    text_message: 'string',

    action: 'string',

    on_user: 'integer',

    ip_address:  'string',
    
    platform: 'string',


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

      this.save(function (err) {
        if (err) return cb(err);

        deleteUtils.recursiveDelete(self.id, function (err) {
          if (err) return cb(err);
          cb(null, self);
        });
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
  createLog: function (options, cb) {
    Logging.create({
      user_id         : options.user_id,
      text_message    : options.text_message,
      action          : options.activity,
      on_user         : options.on_user,
      ip_address      : options.ip,
      platform        : options.platform,
      
     
    }).exec(function foundAccount (err, logging) {
      console.log(err);
        if (err) return cb && cb(err);
        return cb && cb(null, logging);
    });
  },

};
