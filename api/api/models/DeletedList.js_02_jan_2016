/*---------------------
  :: DeletedList
  -> model
---------------------*/
var deleteUtils = require('../services/lib/account/destroy');
var  async = require('async');

module.exports = {
  
    attributes: {
    
        type        : 'integer',
        deleted_id  : 'integer',
        sync_time   : 'datetime',
        user_id   	: 'integer',
        account_id  : 'integer',
        directory_id: 'integer',
        permission  : 'string',

    },

    restore: function(options, cb){

        DeletedList.find({
            deleted_id : options.file_id 
        }).then(function (res) {

            if(options.type === 'file') {

                async.auto({

                    fileUpdate: function(cb){
                        File.update({
                            id: options.file_id
                        }, {
                            deleted         : null,
                            deleteDate      : null,
                            DirectoryId     : res[0].directory_id                    
                        }).exec(cb);
                    }, 

                    filePermissionUpdate:function(cb){
                        res.forEach(function (deletedlist) {
                            FilePermission.create({
                                type        : deletedlist.permission,
                                orphan      : null,
                                AccountId   : deletedlist.account_id,
                                FileId      : deletedlist.deleted_id
                            }).exec(cb);
                        });
                    }

                }, function(err, result){
                    if (err) cb(null ,err);

                    cb(null, result);

                });
            }else if (options.type === 'directory'){

                console.log("alksdjalksdjklasdjkals")

                async.auto({

                    fileUpdate: function(cb){
                        Directory.update({
                            id: options.file_id
                        }, {
                            deleted         : null,
                            deleteDate      : null,
                            DirectoryId     : res[0].directory_id                    
                        }).exec(cb);
                    }, 

                    filePermissionUpdate : function(cb){
                        res.forEach(function (deletedlist) {
                            DirectoryPermission.create({
                                type        : deletedlist.permission,
                                orphan      : null,
                                AccountId   : deletedlist.account_id,
                                DirectoryId : deletedlist.deleted_id
                            }).exec(cb);
                        });
                    }

                }, function(err, result){
                    if (err) cb(null ,err);

                    cb(null, result);

                });    

            }

            
        });
    }
};
