/**
 * Access Control List
 *
 * If controller action is not specified, a request will send a 403
 */

 module.exports = {

  account: {
    register: 'admin',
    update: 'admin',
    del: 'admin',
    lock: 'admin'
  },

  file: {
    copy: 'write',
    share: 'write',
    shareurl: 'write',
    thumbnail: 'write',
    update: 'write'
  },

  directory: {
    copy: 'read',
    share: 'read',
    getQuote: 'admin',
    setQuota: 'admin',
    update: 'write'
  },

  share: {
    update: 'write'
  }

};
