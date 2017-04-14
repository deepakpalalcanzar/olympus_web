/*---------------------
  :: FilePermission
  -> model
---------------------*/
module.exports = {

  attributes: {

    type    : 'string',
    orphan  : 'boolean',

    // This probably shouldn't be here
    // isLocked: 'boolean',

    AccountId: 'integer',
    FileId   : 'integer',


    /****************************************************
     * Instance Methods
     ****************************************************/


    /**
     * Copies Permissions from one file to another
     *
     * @param {Integer} File ID to move to
     * @param {Function} callback
     */

    copy: function(fileId, cb) {

      // Build a new permission set based off the original
      var clone = this.toObject();
      delete clone.FileId;
      delete clone.id;

      // set the new clone FileID to the new file's id
      clone.FileId = fileId;

      // Create the file permission record
      return FilePermission.create(clone).then(function(perms) {
        cb(null, perms);
      }).fail(cb)
    }

  }
};
