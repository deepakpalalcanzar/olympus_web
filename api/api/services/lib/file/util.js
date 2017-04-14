/**
 * General file utilities
 */

var async = require('async');

var Utils = module.exports = {};

var inodeService = require('../inode.js');
/**
 * Ensure A Unique Name for each child directory
 *
 * @param {String} new name for file
 * @param {Integer} directory ID to check uniqueness in
 * @param {Function} callback
 */

Utils.uniqueName = function (name, parentId, cb) {

  return inodeService.uniqueName('file', name, parentId, cb);

};
