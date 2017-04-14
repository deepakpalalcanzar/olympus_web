/*---------------------
  :: AccountDeveloper
  -> model
---------------------*/
module.exports = {

  attributes: {
    api_key        : 'string',
    account_id     : 'integer',
    code           : 'string',
    access_token   : 'string',
    refresh_token  : 'string',
    code_expires   : 'datetime',
    access_expires : 'datetime',
    refresh_expires: 'datetime',
    scope          : 'integer'
  },

  SCOPE_READ: 1,
  SCOPE_WRITE: 2
};
