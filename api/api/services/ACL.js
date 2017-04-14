/**
 * Access Control Mappings
 */

var async = require('async'),
    permissionUtils = require('./lib/permissions'),
    ACL = require('../../config/acl');

module.exports = function(target, inodeId, inodeType, accountId, cb) {

  // Find ACL Mapping based on controller and action
  // if no ACL is defined deny the request
  if(!ACL[target.controller]) return cb(false);

  var action = ACL[target.controller][target.action];

  // Check if Account is an Admin, if so they can do anything
  Account.findOne(accountId).exec(function(err, account) {
    if (err) return cb(err);
    if (!account) return cb(new Error('Incorrect Account Id'));
    if (account && account.isAdmin) return cb(null, true);

    // If inodeType is not an Directory or File what do we check?
    if (inodeType.toLowerCase() != 'directory' && inodeType.toLowerCase() != 'file') {
      return cb(null, false);
    }

    // Lookup the inode
    global[inodeType].findOne(inodeId).exec(function(err, inode) {
      if (err) return cb(err);
      if (!inode) return cb(new Error('No ' + inodeType + ' exists for id=' + inodeId));

      var criteria = {
        AccountId: accountId,
        type: permissionUtils.expandPermission(action)
      };

      criteria[inodeType + 'Id'] = inodeId;

      if(inodeType === 'File') {
        return FilePermission.find(criteria).exec(function(err, perms) {
          if(err) return cb(err);
          if(perms.length === 0) return cb(null, false);
          return cb(null, true);
        });
      }

      if(inodeType === 'Directory') {
        return DirectoryPermission.find(criteria).exec(function(err, perms) {
          if(err) return cb(err);
          if(perms.length === 0) return cb(null, false);
          return cb(null, true);
        });
      }

    });
  });

};
