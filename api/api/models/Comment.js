/*---------------------
  :: Comment
  -> model
---------------------*/
module.exports = {

  attributes: {

    payload: 'string',
    
    AccountId: 'integer',

    // Comment can belong to a Directory xor File
    // Both DirectoryId and FileId must not both be set at the same time
    DirectoryId: 'integer',
    FileId: 'integer'
  }
};
