/**
 * Helpers for handling permissions
 */

var Permissions = module.exports = {};

// Allow stronger privileges to override weaker restrictions
Permissions.expandPermission = function(action) {
  var type = [];

  switch(action) {
  case 'read':
    type.push('read');
    type.push('comment');
    type.push('write');
    type.push('admin');
    break;
  case 'comment':
    type.push('comment');
    type.push('write');
    type.push('admin');
    break;
  case 'write':
    type.push('write');
    type.push('admin');
    break;
  case 'admin':
    type.push('admin');
    break;
  default:
    throw new Error('Checking permission on unknown action type,' + action + '!');
  }

  return type;
};
