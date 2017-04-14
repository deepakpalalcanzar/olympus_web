/**
 * Utilities For Locking An Account
 */

var Utils = module.exports = {};

/**
 * Recursively Lock an Account's workgroups
 *
 * @param {Integer} Account ID
 * @param {Function} callback
 */

Utils.recursiveLock = function (accountId, lockState, cb) {

  // Create a stack to hold recursive items
  var stack = [];

  /**
   * Find All Workgroups and kick off recursive locking
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
   * Manages processing stack items and locking directories and files.
   */

  var processStack = function() {

    if(stack.length === 0) return cb();

    // Pop an item off the stack
    var item = stack.pop();

    /**
     * Handle locking a file
     */

    if(item.type === 'file') {
      return lockFile(item, lockState, cb);
    }

    /**
     * Handle locking a directory
     */

    if(item.type === 'directory') {
      return lockDirectory(item, lockState, cb);
    }

  };


  /**
   * Lock a File from the stack
   */

  function lockFile(item, lockState, cb) {

    // Flag file as locked
    item.val.isLocked = lockState;

    item.val.save(function(err) {
      if(err) return cb(err);

      // run processStack again
      return processStack();
    });
  }

  /**
   * Lock a Directory from the stack
   */

  function lockDirectory(item, lockState, cb) {

    // Flag directory as locked
    item.val.isLocked = lockState;

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
