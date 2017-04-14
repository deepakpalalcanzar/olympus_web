/**
 * Utilities For Copying A Directory
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

  return inodeService.uniqueName('directory', name, parentId, cb);

};


/**
 * Create a new Directory inside a Target Directory
 *
 * @apram {Object} Waterline model to use as a source
 * @param {Integer} target Directory ID
 * @param {Function} callback
 */

Utils.createDirectory = function (source, targetId, cb) {

  // Build a new directory based off the source
  var clone = source.toObject();

  // Remove the id and timestamps
  delete clone.id;
  delete clone.createdAt;
  delete clone.updatedAt;

  // Remove the Owner ID if there is one
  if(clone.OwnerId) delete clone.OwnerId;

  // Set the Directory ID to the targetId
  clone.DirectoryId = targetId;

  Utils.uniqueName(clone.name, targetId, function(err, newName) {
    if (err) return cb(err);

    // Set the clone name
    clone.name = newName;

    // Create a new directory from the clone
    Directory.create(clone).exec(function(err, newDir) {
      if (err) return cb(err);

      // Set new permissions for copied directory
      Utils.createPermissions(newDir.id, targetId, function(err) {
        if(err) return cb(err);
        cb(null, newDir);
      });
    });
  });
};


/**
 * Create New Directory Permissions, copied down from the Target Directory
 *
 * @param {Integer} newly copied Directory ID
 * @param {Integer} parent Directory ID
 * @param {Function} callback
 */

Utils.createPermissions = function (childId, parentId, cb) {

  // Find the Target Directory permissions
  DirectoryPermission.find({ DirectoryId: parentId }).exec(function (err, perms) {
    if (err) return cb(err);
    if (perms.length === 0) {
      return cb(new Error('No Directory Permissions for Directory with Id ' + parentId));
    }

    // Copy all of the permissions from the target directory to our newly created directory
    function copyItem(item, next) {
      item.copy(childId, next);
    }

    async.each(perms, copyItem, cb);
  });
};


/**
 * Recursive Check
 *
 * Ensure we are not copying a directory into itself or any child directories.
 * Starts at the targetId and works it's way up the tree ensuring we never hit the sourceId.
 *
 * @param {Integer} ID of the directory we want to copy
 * @param {Integer} ID of the directory we are copying to
 * @param {Function} callback
 */

Utils.recursiveCheck = function (sourceId, targetId, cb) {

  // Create a stack to hold recursive items
  var stack = [];

  // Look up target directory
  Directory.findOne(targetId).exec(function(err, dir) {
    if (err) return cb(err);
    if (dir.id === sourceId) return cb(new Error('Can\'t copy a directory into itself'));

    stack.push(dir);

    // kick off recursive parsing
    processStack();
  });


  function processStack() {

    if(stack.length === 0) return cb();

    // Pop an item off the stack
    var item = stack.pop();

    // Check it's not the source ID
    if (item.id === sourceId) return cb(new Error('Can\'t copy a directory into a child directory'));

    // If no DirectoryId we made it to the top so we are all good
    if (!item.DirectoryId) return cb();

    // Look up the parent directory
    Directory.findOne(item.DirectoryId).exec(function(err, dir) {
      if(err) return cb(err);

      // Push the item to the stack and continue on
      stack.push(dir);

      processStack();
    });
  }

};


/**
 * Recursively Copy A Directory
 *
 * @param {Object} Waterline model to copy
 * @param {Integer} target Directory ID
 * @param {Function} callback
 */

Utils.recursiveCopy = function (source, targetId, cb) {

  // Create a stack to hold recursive items
  var stack = [];

  // Hold the top level copied directory
  var topLevelCopy = null;

  /**
   * Copy the parent directory and kick off recursive processStack Calls
   */

  copyDirectory({ val: source, parent: targetId }, cb);


  /**
   * Recurisvely Parse a single stack item
   *
   * Manages processing stack items and copying over permissions to the new parent directory.
   */

  var processStack = function() {

    if(stack.length === 0) return cb(null, topLevelCopy);

    // Pop an item off the stack
    var item = stack.pop();

    /**
     * Handle copying a file over
     */

    if(item.type === 'file') {
      return copyFile(item, cb);
    }

    /**
     * Handle copying a directory
     */

    if(item.type === 'directory') {
      return copyDirectory(item, cb);
    }

  };


  /**
   * Copy a File from the stack
   */

  function copyFile(item, cb) {
    item.val.copy(item.parent, item.val.name, function(err) {
      if(err) return cb(err);

      // run processStack again
      return processStack();
    });
  }

  /**
   * Copy a Directory from the stack
   */

  function copyDirectory(item, cb) {

    Utils.createDirectory(item.val, item.parent, function(err, newDir) {
      if(err) return cb(err);

      // Store the top-level directory to return
      if (!topLevelCopy) topLevelCopy = newDir;

      // Lookup directory files
      File.find({ DirectoryId: item.val.id }).exec(function(err, files) {
        if(err) return cb(err);

        files.forEach(function(file) {
          stack.push({ type: 'file', val: file, parent: newDir.id });
        });

        // Lookup children directories
        Directory.find({ DirectoryId: item.val.id }).exec(function(err, dirs) {

          dirs.forEach(function(dir) {
            stack.push({ type: 'directory', val: dir, parent: newDir.id });
          });

          // run processStack again
          return processStack();
        });
      });
    });
  }
};
