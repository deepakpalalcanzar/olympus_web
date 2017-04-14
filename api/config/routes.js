module.exports.routes = {

  // Explicitely listing required endpoints

  /**
   * FILES
   */

  'post /files/:id/copy': {
    controller: 'file',
    action: 'copy'
  },

  'get /files/:id/shareurl': {
    controller: 'file',
    action: 'shareurl'
  },

  'get /files/:id/thumbnail': {
    controller: 'file',
    action: 'thumbnail'
  },

  'post /files/content': 'FileController.upload',

  'post /files/profiledownload': 'FileController.profiledownload',

  'post /files/logodownload': 'FileController.logodownload',

  /**
   * FOLDERS
   */

  'post /folders/:id/copy': {
    controller: 'directory',
    action: 'copy'
  },

  'put /folders/:id': {
    controller: 'directory',
    action: 'update'
  },

  'post /folders/quota': {
    controller: 'directory',
    action: 'setQuota'
  },

  'get /folders/quota': {
    controller: 'directory',
    action:'getQuota'
  },

  /**
   * SHARES
   */

  'post /share/folder/:id': {
    controller: 'directory',
    action: 'share'
  },

  'post /share/file/:id': {
    controller: 'file',
    action: 'share'
  },

  /**
   * ACCOUNT
   */

  'put /account/:id': {
    controller: 'account',
    action: 'update'
  },

  'delete /account/:id': {
    controller: 'account',
    action: 'del'
  },

  'put /account/:id/lock': {
    controller: 'account',
    action: 'lock'
  },
  
  'post /account/register': {
    controller: 'account',
    action: 'register'
  }

};
