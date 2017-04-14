/*---------------------
  :: FileDownloadLink
  -> model
---------------------*/
module.exports = {

  attributes: {

    file_id     : 'integer',
    link_key    : 'string',
    key_expires : 'datetime',
    access_token: 'string'
  }
};
