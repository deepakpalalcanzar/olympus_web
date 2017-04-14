/*---------------------
  :: DirectoryPermission
  -> model
---------------------*/
module.exports = {

  attributes: {

    type    : 'string',
    orphan  : 'boolean',

    // This probably shouldn't be here
    // isLocked: 'boolean',

    AccountId  : 'integer',
    DirectoryId: 'integer',


    /****************************************************
     * Instance Methods
     ****************************************************/


    /**
     * Copies Permissions from one directory to another
     *
     * @param {Integer} Directory ID to move to
     * @param {Function} callback
     * @returns {Promise}
     */

    copy: function(dirID, cb) {

      // Build a new permission set based off the original
      var clone = this.toObject();
      delete clone.DirectoryId;
      delete clone.id;

      // set the new clone DirectoryID to the new directory's id
      clone.DirectoryId = dirID;

      // Create the file permission record
      return DirectoryPermission.create(clone).then(function(clone){
        if(cb) cb(null, clone);
        return clone;
      }, function(err) {
        if(cb) cb(err);
        throw err;
      });
    }

  }
};
