// Custom URL mappings
// *********************
// Use for situations where:
//    /controllerName/methodName
// and backbone semantics (routing by HTTP verb) are not enough
//
// You can override default url mappings (404,500,home) here as well.
//
module.exports = {
    /**
     * OlD API Methods
     */

    '/': {
        controller: 'meta',
        action: 'home'
    },
    '/500': {
        controller: 'meta',
        action: 'error'
    },
    '/404': {
        controller: 'meta',
        action: 'notfound'
    },
    // Account Methods

    '/account/fetch': {
        controller: 'account',
        action: 'fetch'
    },
    '/account/read': {
        controller: 'account',
        action: 'read'
    },
    '/account/imageUpload': {
        controller: 'account',
        action: 'imageUpload'
    },
    '/account/avatar': {
        controller: 'account',
        action: 'avatar'
    },
    '/account/listUserWorkgroup': {
        controller: 'account',
        action: 'listUserWorkgroup'
    },
    '/account/updateUserPassword': {
        controller: 'account',
        action: 'updateUserPassword'
    },
    '/account/updateUserData': {
        controller: 'account',
        action: 'updateUserData'
    },
    '/account/delAccount': {
        controller: 'account',
        action: 'delAccount'
    },
    '/file/exportDatabase': {
        controller: 'file',
        action: 'exportDatabase'
    },
    // Directory Methods

    '/directory/read': {
        controller: 'directory',
        action: 'read'
    },
    
    '/directory/workgroups': {
        controller: 'directory',
        action: 'workgroups'
    },

    '/directory/dispatchAPI': {
        controller: 'directory',
        action: 'dispatchAPI'
    },
    '/directory/ls': {
        controller: 'directory',
        action: 'ls'
    },

    '/directory/deletedls': {
        controller: 'directory',
        action: 'deletedls'
    },
    
    '/directory/info': {
        controller: 'directory',
        action: 'info'
    },
    '/directory/items': {
        controller: 'directory',
        action: 'items'
    },
    '/directory/comments': {
        controller: 'directory',
        action: 'comments'
    },
    '/directory/mkdir': {
        controller: 'directory',
        action: 'mkdir'
    },
    '/directory/upload': {
        controller: 'directory',
        action: 'upload'
    },
    '/directory/mv': {
        controller: 'directory',
        action: 'mv'
    },
    '/directory/rename': {
        controller: 'directory',
        action: 'rename'
    },
    '/directory/swarm': {
        controller: 'directory',
        action: 'swarm'
    },
    '/directory/activity': {
        controller: 'directory',
        action: 'activity'
    },
    '/directory/permissions': {
        controller: 'directory',
        action: 'permissions'
    },
    '/directory/addPermission': {
        controller: 'directory',
        action: 'addPermission'
    },
    '/directory/updatePermission': {
        controller: 'directory',
        action: 'updatePermission'
    },
    '/directory/removePermission': {
        controller: 'directory',
        action: 'removePermission'
    },
    '/account/deletePermission': {
        controller: 'account',
        action: 'deletePermission'
    },
    '/directory/join': {
        controller: 'directory',
        action: 'join'
    },
    '/directory/leave': {
        controller: 'directory',
        action: 'leave'
    },
    '/directory/addComment': {
        controller: 'directory',
        action: 'addComment'
    },
    '/directory/removeComment': {
        controller: 'directory',
        action: 'removeComment'
    },
    '/directory/delete': {
        controller: 'directory',
        action: 'delete'
    },
    '/directory/subscribe': {
        controller: 'directory',
        action: 'subscribe'
    },
    '/directory/enablePublicSublinks': {
        controller: 'directory',
        action: 'enablePublicSublinks'
    },
    '/directory/copy': {
        controller: 'directory',
        action: 'copy'
    },
    '/directory/quota': {
        controller: 'directory',
        action: 'quota'
    },
    '/directory/setQuota': {
        controller: 'directory',
        action: 'setQuota'
    },
    '/directory/setLock': {
        controller: 'directory',
        action: 'setLock'
    },
    '/directory/assignPermission': {
        controller: 'directory',
        action: 'assignPermission'
    },
    '/directory/dataSync': {
        controller: 'directory',
        action: 'dataSyncing'
    },

    //drive route
    '/directory/syncdrive': {
        controller: 'directory',
        action: 'syncdrive'
    },
    // File Routes

    '/file/stat': {
        controller: 'file',
        action: 'stat'
    },
    /*'/file/version': {
     controller: 'file',
     action: 'stat'
     },*/

    '/file/read': {
        controller: 'file',
        action: 'read'
    },
    '/file/content': {
        controller: 'file',
        action: 'content'
    },
    '/file/public': {
        controller: 'file',
        action: 'public'
    },
    '/file/retrieve': {
        controller: 'file',
        action: 'retrieve'
    },
    '/file/dispatchAPI': {
        controller: 'file',
        action: 'dispatchAPI'
    },
    '/file/info': {
        controller: 'file',
        action: 'info'
    },
    '/file/apiDownload': {
        controller: 'file',
        action: 'apiDownload'
    },
    '/file/update': {
        controller: 'file',
        action: 'update'
    },
    '/file/comments': {
        controller: 'file',
        action: 'comments'
    },
    '/file/_download': {
        controller: 'file',
        action: '_download'
    },
    '/file/rename': {
        controller: 'file',
        action: 'rename'
    },
    '/file/mv': {
        controller: 'file',
        action: 'mv'
    },
    '/file/swarm': {
        controller: 'file',
        action: 'swarm'
    },
    '/file/permissions': {
        controller: 'file',
        action: 'permissions'
    },
    '/file/addPermission': {
        controller: 'file',
        action: 'addPermission'
    },
    '/file/updatePermission': {
        controller: 'file',
        action: 'updatePermission'
    },
    '/file/removePermission': {
        controller: 'file',
        action: 'removePermission'
    },
    '/file/join': {
        controller: 'file',
        action: 'join'
    },
    '/file/leave': {
        controller: 'file',
        action: 'leave'
    },
    '/file/activity': {
        controller: 'file',
        action: 'activity'
    },
    '/file/listVersion/:id': {
        controller: 'file',
        action: 'version'
    },
    '/file/addComment': {
        controller: 'file',
        action: 'addComment'
    },
    '/file/removeComment': {
        controller: 'file',
        action: 'removeComment'
    },
    '/file/delete': {
        controller: 'file',
        action: 'delete'
    },
    '/file/subscribe': {
        controller: 'file',
        action: 'subscribe'
    },
    '/file/copy': {
        controller: 'file',
        action: 'copy'
    },
    '/file/enablePublicLink': {
        controller: 'file',
        action: 'enablePublicLink'
    },
    '/tempaccount/dataSync/:access_token/:lastsync': {
        controller: 'tempaccount',
        action: 'dataSyncing'
    },
    '/tempaccount/listDeletedItems/:access_token/:lastsync': {
        controller: 'tempaccount',
        action: 'listDeletedItems'
    },
    // iNode Routes



    // Folders Links

    '/folders/0': {
        controller: 'inode',
        action: 'topLevel'
    },
    '/folders/:id': {
      controller: 'directory',
      action: 'dispatchAPI'
    },

    '/folders/:id/items': {
        controller: 'directory',
        action: 'items'
    },
    '/folders/:id/comments': {
        controller: 'directory',
        action: 'comments'
    },
    'post /folders/:id/lock': {
        controller: 'directory',
        action: 'setLock'
    },
    '/folders/:id/delete': {
        controller: 'directory',
        action: 'delete'
    },
    '/folders': {
        controller: 'directory',
        action: 'dispatchAPI'
    },
    '/files/:id/comments': {
        controller: 'file',
        action: 'comments'
    },
    '/files/content': {
        controller: 'directory',
        action: 'upload'
    },
    '/file/createComment': {
        controller: 'tempaccount',
        action: 'createComment'
    },
    '/files/:id': {
        controller: 'file',
        action: 'dispatchAPI'
    },
    '/files/:id/delete': {
        controller: 'file',
        action: 'delete'
    },
    '/files/:id/content': {
        controller: 'file',
        action: 'apiDownload'
    },


    '/trash/:id/content': {
        controller: 'file',
        action: 'apiDownload'
    },

    '/trash/list' : {
        controller: 'trash',
        action: 'deletedList'
    },

    '/trash/deletePermanent' : {
        controller: 'trash',
        action: 'deletePermanent'
    },

    '/trash/restore' : {
        controller: 'trash',
        action: 'restore'
    },

    '/trash/restore/:id/:type': {
        controller: 'trash',
        action: 'restoreFileAPI'
    },

    '/trash/restore/:id/:type/:directory_id': {
        controller: 'trash',
        action: 'restoreFileAPI'
    },

    'trash/file_directory_list/:id': {
        controller: 'trash',
        action: 'file_directory_list'
    },

    'trash/emptyTrash': {
        controller: 'trash',
        action: 'emptyTrash'
    },


    /*
     // this doesn't seem to work.
     // ~mike, july 22nd
     
     'post /share/:controller/:id' : {
     controller: 'share',
     action: 'create'
     },
     
     'get /share/:id': {
     controller: 'share',
     action: 'download'
     },
     
     'delete /share/:id': {
     controller: 'share',
     action: 'delete'
     },
     */
    '/r/:key': {
        controller: 'file',
        action: 'retrieve'
    },
    '/account/avatar/:id': {
        controller: 'account',
        action: 'avatar'
    },
    '/file/public/:fsName/:pubName': {
        controller: 'file',
        action: 'public'
    },
    // Authentication mappings
    '/login/:email/:prometheus': {
        controller: 'auth',
        action: 'login'
    },
    '/login': {
        controller: 'auth',
        action: 'login'
    },
    '/authlogin': {
        controller: 'auth',
        action: 'authLogin'
    },
    '/verifyapi': {
        controller: 'auth',
        action: 'verifyapi'
    },
    '/authToken': {
        controller: 'auth',
        action: 'authToken'
    },
    '/logout': {
        controller: 'auth',
        action: 'logout'
    },
    '/verify': {
        controller: 'auth',
        action: 'verify'
    },
    '/account/create': {
        controller: 'account',
        action: 'register'
    },
    '/account/:id/quotas': {
        controller: 'auth',
        action: 'quota'
    },
    '/403': '/login',
    /*********************************************************
     * Redirect Routes for new API
     *********************************************************/


    '/files/:id/copy': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/files/:id/share': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/files/:id/shareurl': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/files/content': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/files/content/:parent_id/:name': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/files/check': {
        controller: 'redirect',
        action: 'redirect'
    },
    // '/files/content': {
    // controller: 'fileupload',
    //  action: 'upload'
    //},

    '/file/download/:id': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/file/thumbnail/:id/:filename': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/file/thumbnail/:id/': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/file/open/:id/:filename': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/file/open/:id': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/folders/:id/copy': {
        controller: 'redirect',
        action: 'redirect'
    },
    // '/folders/:id': {
    //     controller: 'redirect',
    //     action: 'redirect'
    // },
    '/folders/quota': {
        controller: 'redirect',
        action: 'redirectQuota'
    },

    '/images/profile/:filename': {
        controller: 'redirect',
        action: 'redirect'
    },

    '/images/enterprises/:filename': {
        controller: 'redirect',
        action: 'redirect'
    },

    '/share/:id/:name': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/account/:id': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/account/:id/lock': {
        controller: 'redirect',
        action: 'redirect'
    },
    '/profile/create': {
        controller: 'profile',
        action: 'create'
    },
    '/profile/apiRegister': {
        controller: 'profile',
        action: 'apiRegister'
    },
    '/adminuser/list': {
        controller: 'adminuser',
        action: 'list'
    },
    '/subscription/free/:id/:temp': {
        controller: 'subscription',
        action: 'free'
    },
    '/subscription/freeapi/:id/:temp': {
        controller: 'subscription',
        action: 'freeapi'
    },
    '/subscription/freeapi/:id/:temp/:type': {
        controller: 'subscription',
        action: 'freeapi'
    },
    '/subscription/paid/:id/:temp': {
        controller: 'subscription',
        action: 'paid'
    },

    '/subscription/paid/:id/:temp/:type': {
        controller: 'subscription',
        action: 'paid'
    },
    '/subscription/upgradepaid/:id': {
        controller: 'subscription',
        action: 'upgradepaid'
    },
    '/file/publicDownload/:fsName/:pubName': {
        controller: 'subscription',
        action: 'publicDownload'
    },

    '/file/pDownload/:dtoken/:fsName/:pubName': {
        controller: 'subscription',
        action: 'pDownload'
    },

    '/file/pPreview/:dtoken/:id/:filename': {
        controller: 'subscription',
        action: 'pPreview'
    },

    '/theme/getCurrentTheme': {
        controller: 'theme',
        action: 'getCurrentTheme'
    },

   'post /theme/getThemeConfiguration/:id': {
        controller: 'theme',
        action: 'getThemeConfiguration'
    },

    '/getSiteOptions': {
        controller: 'sitesettings',
        action: 'getSiteOptions'  
    },


'/auth/resetPassword/:emailid': {
        controller: 'auth',
        action: 'resetPassword'
    },

 '/auth/forgetPassword/:emailid': {
        controller: 'auth',
        action: 'forgetPassword'
    },

    '/syncdbox': {
        controller: 'meta',
        action: 'syncDbox'
    },
    '/syncBox': {
        controller: 'meta',
        action: 'syncBox'
    }
//  
//  '/log/:page': {
//    controller: 'logging',
//    action: 'listLog'
//  },

    /*  '/account/register': {
     controller: 'Account',
     action: 'register'
     }
     */
    // TODO: Add test routes if mode is 'development'
    // All the test routes are disabled for now.
    // Special download route for semantic download route and filenames
    // '/download/:path(.+)': {
    //  controller: 'file',
    //  action: 'download'
    // },

    // // test
    // '/directory/:id/t': {
    //  controller: 'directory',
    //  action: 'testroute'
    // },

    // // json test path
    // '/tj': {
    //  controller: 'settings',
    //  action: 'testjson'
    // },



};
