/**
 * Checks if an authenticated user has the ability to perform an action.
 */

var ACLService = require('../services/ACL'),
    Authenticated = require('./authenticated');

module.exports = function(req, res, next) {
  if (sails.config.environment === 'development') return next();
  // Check that the account is authenticated (logged in or has a valid api access token)
  // and then verify that the authenticated user has permission to do what they want
  Authenticated(req, res, function() {

    // capitalize inodeType for use with Model.getModelName()
    var controller = req.target.controller;
    var inodeType = controller.charAt(0).toUpperCase() + controller.slice(1);

    // Set an account id if available
    var accountId = req.session.Account ? req.session.Account.id : null;

    // Set the inodeId
    var inodeId = null;

    if(req.param('parent')) inodeId = req.param('parent');
    if(req.param('parent_id')) inodeId = req.param('parent_id');
    if(req.param('id')) inodeId = req.param('id');

    // If action unspecified, default to request action
    // action = action || req.param('action') || null;

    ACLService(req.target, inodeId, inodeType, accountId, function(err, allowed) {
      err && sails.log.warn(err);
      if (err) return res.send(403);
      if (!allowed) return res.send(403);

      // req.socket.join('Account_' + req.session.Account.id);
      return next();
    });
  });

};
