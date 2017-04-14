/**
 * Utilities For Deleting An Account
 */

var Utils = module.exports = {};

/**
 * Recursively Delete an Account's workgroups
 *
 * @param {Integer} Account ID
 * @param {Function} callback
 */

Utils.recursiveDelete = function (accountId, cb) {

  // Create a stack to hold recursive items
  var stack = [];

  /**
   * Find All Workgroups and kick off recursive delete
   */

  Directory.find({ OwnerId: accountId }).exec(function(err, dirs) {
    if(err) return cb(err);

    dirs.forEach(function(dir) {
      stack.push({ type: 'directory', val: dir });
    });

    processStack();
  });


  /**
   * Recurisvely Parse a single stack item
   *
   * Manages processing stack items and deleting directories and files.
   */

  function processStack () {

    if(stack.length === 0) return cb();

    // Pop an item off the stack
    var item = stack.pop();

    /**
     * Handle deleting a file
     */

    if(item.type === 'file') {
      return deleteFile(item, cb);
    }

    /**
     * Handle deleting a directory
     */

    if(item.type === 'directory') {
      return deleteDirectory(item, cb);
    }

  };


  /**
   * Delete a File from the stack
   */

  function deleteFile(item, cb) {

    // Flag file as deleted
    item.val.deleted = true;
    item.val.deleteDate = new Date();

    item.val.save(function(err) {
      if(err) return cb(err);

      // run processStack again
      return processStack();
    });
  }

  /**
   * Delete a Directory from the stack
   */

  function deleteDirectory(item, cb) {

    // Flag directory as deleted
    item.val.deleted = true;
    item.val.deleteDate = new Date();

    item.val.save(function(err) {
      if(err) return cb(err);

      // Lookup directory files
      File.find({ DirectoryId: item.val.id }).exec(function(err, files) {
        if(err) return cb(err);

        files.forEach(function(file) {
          stack.push({ type: 'file', val: file });
        });

        // Lookup children directories
        Directory.find({ DirectoryId: item.val.id }).exec(function(err, dirs) {

          dirs.forEach(function(dir) {
            stack.push({ type: 'directory', val: dir });
          });

          // run processStack again
          return processStack();
        });
      });
    });
  }
};
