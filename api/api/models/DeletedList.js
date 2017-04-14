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

            async.auto({

                fileUpdate: function(cb){
                    File.update({
                        id: options.file_id
                    }, {
                        deleted         : null,
                        deleteDate      : null,
                        DirectoryId     : options.directory_id === '' ? res[0].directory_id : options.directory_id                    
                    }).exec(cb);


                    DeletedList.update({
                        id: res[0].directory_id
                    }, {
                        deleted_id   : null,
                        directory_id : null                    
                    }).then(function(per){
                    });

                }, 

                filePermissionUpdate:function(cb){
                    res.forEach(function (deletedlist) {
                        FilePermission.create({
                            type        : deletedlist.permission,
                            orphan      : null,
                            AccountId   : deletedlist.account_id,
                            FileId      : deletedlist.deleted_id
                        }).exec(cb);


                        DeletedList.update({
                            id: deletedlist.id
                        }, {
                            deleted_id   : null,
                            directory_id : null                    
                        }).then(function(per){

                        });

                    });
                }
            }, function(err, result){
                if (err) cb(null ,err);
                cb(null, result);
            });
        });
    },


    restoreParent: function(options, finalcallback){

        var array = [];
        var arrayFile = [];

        DeletedList.find({
            directory_id : options.file_id 
        }).then(function (res) {
              
            if(res.length > 0){


                async.each(res,//1st array of items
                  // 2nd param is the function that each item is passed to
                  function(deletedlist, cb){// Call an asynchronous function, often a save() to DB
                    
                    if( deletedlist.type === 2 ) {
                        if(array.length > 0){
                            if(array.indexOf(deletedlist.deleted_id) === -1){
                                array.push(deletedlist.deleted_id);
                                var opt = { file_id : deletedlist.deleted_id, directory_id : deletedlist.directory_id };
                                DeletedList.udpateDirectory(opt, function(err, file){
                                    DeletedList.restoreParent(opt, function(err,file){
                                        return cb && cb(null, file);
                                    });
                                });
                            }
                        }else{
                            array.push(deletedlist.deleted_id);
                            var opt = { file_id : deletedlist.deleted_id, directory_id : deletedlist.directory_id };
                            DeletedList.udpateDirectory(opt, function(err, file){
                                DeletedList.restoreParent(opt, function(err,file){
                                    return cb && cb(null, file);
                                });
                            });
                        }
                    }else{

                        var fileopt = { file_id : deletedlist.deleted_id, directory_id : deletedlist.directory_id };
                        
                        if(arrayFile.length > 0){
                            if(arrayFile.indexOf(deletedlist.deleted_id) === -1){
                                arrayFile.push(deletedlist.deleted_id);
                                DeletedList.updateFile(fileopt, function(err, file){
                                    return cb && cb(null, file);
                                });
                            }
                        }else{
                            arrayFile.push(deletedlist.deleted_id);
                            DeletedList.updateFile(fileopt, function(err, file){
                                return cb && cb(null, file);
                            });
                        }
                    }
                  },
                  // 3rd param is the function to call when everything's done
                  function(err){
                    // All tasks are done now
                    finalcallback();// doSomethingOnceAllAreDone();
                  }
                );

                /*res.forEach(function (deletedlist) {
                    if( deletedlist.type === 2 ) {
                        if(array.length > 0){
                            if(array.indexOf(deletedlist.deleted_id) === -1){
                                array.push(deletedlist.deleted_id);
                                var opt = { file_id : deletedlist.deleted_id, directory_id : deletedlist.directory_id };
                                DeletedList.udpateDirectory(opt, function(err, file){
                                    DeletedList.restoreParent(opt, function(err,file){
                                    });
                                });
                            }
                        }else{
                            array.push(deletedlist.deleted_id);
                            var opt = { file_id : deletedlist.deleted_id, directory_id : deletedlist.directory_id };
                            DeletedList.udpateDirectory(opt, function(err, file){
                                DeletedList.restoreParent(opt, function(err,file){
                                });
                            });
                        }
                   }else{

                        var fileopt = { file_id : deletedlist.deleted_id, directory_id : deletedlist.directory_id };
                        console.log('fileoptDeletedListDeletedListDeletedListDeletedListDeletedList');
                    console.log(fileopt);
                    console.log('fileoptDeletedListDeletedListDeletedListDeletedListDeletedList');
                        if(arrayFile.length > 0){
                            if(arrayFile.indexOf(deletedlist.deleted_id) === -1){
                                arrayFile.push(deletedlist.deleted_id);
                                DeletedList.updateFile(fileopt, function(err, file){
                                    return cb && cb(null, file);
                                });
                            }
                        }else{
                            arrayFile.push(deletedlist.deleted_id);
                            DeletedList.updateFile(fileopt, function(err, file){
                                return cb && cb(null, file);
                            });
                        }
                    }
                });*/
            }else{
                console.log('finalcallback'+ options.file_id);
                finalcallback();
            }
        });


    },


    

    updateFile : function(options, cb){

        async.auto({

            fileUpdate: function(cb){//Restore File

                File.update({
                    id: options.file_id
                }, {
                    deleted         : null,
                    deleteDate      : null,
                    DirectoryId     : options.directory_id === '' ? res[0].directory_id : options.directory_id                    
                }).exec(cb);
            }, 

            filePermissionUpdate:function(cb){//Restore File Permission
                DeletedList.find({
                    deleted_id : options.file_id 
                }).then(function (res) {
                    res.forEach(function (deletedlist) {
                        
                        FilePermission.create({
                        
                            type        : deletedlist.permission,
                            orphan      : null,
                            AccountId   : deletedlist.account_id,
                            FileId      : deletedlist.deleted_id
                        }).exec(cb);

                        DeletedList.update({//Since file is restored, Remove its entries from trash
                            deleted_id: options.file_id
                        }, {
                            deleted_id   : null,
                            directory_id : null                    
                        }).then(function(per){

                        });


                    });
                });
            }

        }, function(err, result){
            if (err) cb(null ,err);
            cb(null, result);
        });
    },


    udpateDirectory : function(options, cb){

        async.auto({
            fileUpdate: function(cb){
                Directory.update({
                    id: options.file_id
                }, {
                    deleted         : null,
                    deleteDate      : null,
                    DirectoryId     : options.directory_id === '' ? res[0].directory_id : options.directory_id                    
                }).exec(cb);
            }, 

            filePermissionUpdate:function(cb){
                
                DeletedList.find({
                    deleted_id  : options.file_id, 
                    type        : 2 
                }).then(function (res) {
                    res.forEach(function (deletedlist) {

                        DirectoryPermission.create({
                            type        : deletedlist.permission,
                            orphan      : null,
                            AccountId   : deletedlist.account_id,
                            DirectoryId : deletedlist.deleted_id
                        }).then(function (perm) {
                            // return perm;
                        });

                        DeletedList.update({
                            id: deletedlist.id
                        }, {
                            deleted_id   : null,
                            directory_id : null 
                        }).then(function(per){

                        });



                    }, cb());
                });
            }

        }, function(err, result){
            if (err) cb(null ,err);
            cb(null, result);
        });
    },

    deleteParent: function(options, finalcallback){

        console.log('vgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvgvg');
        var array = [];
        var arrayFile = [];

        DeletedList.find({
            directory_id : options.file_id 
        }).then(function (res) {

            async.each(res,//1st array of items
                  // 2nd param is the function that each item is passed to
                  function(deletedlist, cb){// Call an asynchronous function, often a save() to DB
                    
                    if( deletedlist.type === 2 ) {
                        console.log('hmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhmhm');
                        console.log(deletedlist);
                        if(array.length > 0){
                            if(array.indexOf(deletedlist.deleted_id) === -1){
                                array.push(deletedlist.deleted_id);
                                var opt = { file_id : deletedlist.deleted_id, directory_id : deletedlist.directory_id };
                                DeletedList.deleteDirectory(opt, function(err, file){
                                    DeletedList.deleteParent(opt, function(err,file){
                                        return cb && cb(null, file);
                                    });
                                });
                            }
                        }else{
                            array.push(deletedlist.deleted_id);
                            var opt = { file_id : deletedlist.deleted_id, directory_id : deletedlist.directory_id };
                            DeletedList.deleteDirectory(opt, function(err, file){
                                DeletedList.deleteParent(opt, function(err,file){
                                    return cb && cb(null, file);
                                });
                            });
                        }
                   }else{
                        console.log('hnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhn');
                        console.log(deletedlist);
                        var fileopt = { file_id : deletedlist.deleted_id, directory_id : deletedlist.directory_id };
                        /*if(arrayFile.length > 0){
                            if(arrayFile.indexOf(deletedlist.deleted_id) === -1){
                                arrayFile.push(deletedlist.deleted_id);
                                DeletedList.deleteFile(fileopt, function(err, file){
                                    console.log('callback file 111: '+file);
                                    return cb && cb(null, file);
                                });
                            }
                        }else{*/
                            arrayFile.push(deletedlist.deleted_id);
                            DeletedList.deleteFile(fileopt, function(err, file){
                                console.log('callback file 222: '+file);
                                return cb && cb(null, file);
                            });
                        // }
                    }
                  },
                  // 3rd param is the function to call when everything's done
                  function(err){
                    // All tasks are done now
                    finalcallback();// doSomethingOnceAllAreDone();
                  }
                );
            // res.forEach(function (deletedlist) {
                
            // });
        });


    },


    

    deleteFile : function(options, cb){

        async.auto({

            fileDelete: function(cb){

                console.log('deleting file:::::::::::::::::::::'+options.file_id);
                console.log(options);
                console.log(options.file_id);
                File.findOne(options.file_id).then(function (file) {
                    console.log('S3 START------------file');
                    console.log(file.fsName);

                    console.log('33333333333333333333333333333333333333rishabh');

                    // TrashController.deletePermanent();
                    async.auto({
                        getAdapterId: function(cb) {

                            File.findOne({where:{fsName:file.fsName}}).done(cb);
                        },
                        getAdapter: ['getAdapterId', function(cb, up) {

                            uploadPaths.findOne({where:{id:up.getAdapterId.uploadPathId}}).done(cb);
                        }],
                        downloadTask: ['getAdapter', function(cb, up) {

                            var current_receiver        = up.getAdapter.type;
                            var current_receiverinfo    = up.getAdapter;
                            console.log('File ReceiverDeletedList: '+current_receiver);

                            var receiver = global[current_receiver + 'Receiver'].deleteobject({
                                id: file.fsName,
                                receiverinfo: current_receiverinfo
                            },function(err,data){
                                console.log('err');
                                console.log(err);
                                console.log(data);
                                console.log('data');

                                var fs = require('fs');

                                DeletedList.destroy({deleted_id:options.file_id}).exec(function (err){
                                  if (err) {
                                    console.log(err);
                                  }
                                  console.log('Any file with deleted_id : '+options.file_id+' have now been deleted, if there were any.');
                                  // return res.ok();

                                    fs.unlink(sails.config.appPath + '/files/' + file.fsName, function(err){
                                      // if (err) console.log(err);
                                    });
                                    fs.unlink(sails.config.appPath + '/files/thumbnail-' + file.fsName, function(err){
                                      // if (err) console.log(err);
                                    });
                                    fs.unlink(sails.config.appPath + '/files/thumbnail-thumbnail-' + file.fsName, function(err){
                                      // if (err) console.log(err);
                                    });
                                    fs.unlink(sails.config.appPath + '/../master/public/images/thumbnail/'+file.name, function(err){
                                      // if (err) console.log(err);
                                    });
                                    console.log('returning callback for '+file.fsName);
                                    return cb && cb();
                                });
                            });
                        }]
                    });
                    console.log('S3 END------------file');
                });
                console.log('END deleting file:::::::::::::::::::::'+options.file_id);
                // var receiver = global[sails.config.receiver + 'Receiver'].deleteobject({
                //     id: req.param('fsName')
                // },function(err,data){
                //     console.log(err);
                //     console.log(data);
                // });

                // File.destroy({
                //     id: options.file_id
                // }).exec(cb);
            }, 

            // filePermissionUpdate:function(cb){
            //     DeletedList.find({
            //         deleted_id : options.file_id 
            //     }).then(function (res) {
            //         res.forEach(function (deletedlist) {
                        
            //             FilePermission.create({
                        
            //                 type        : deletedlist.permission,
            //                 orphan      : null,
            //                 AccountId   : deletedlist.account_id,
            //                 FileId      : deletedlist.deleted_id
            //             }).exec(cb);

            //             DeletedList.update({
            //                 id: options.file_id
            //             }, {
            //                 deleted_id   : null,
            //                 directory_id : null                    
            //             }).then(function(per){

            //             });


            //         });
            //     });
            // }

        }, function(err, result){
            if (err) cb(null ,err);
            cb(null, result);
        });
    },


    deleteDirectory : function(options, cb){

        async.auto({
            fileDelete: function(cb){

                console.log('deleting directory:::::::::::::::::::::'+options.file_id);
                Directory.destroy({
                    id: options.file_id
                }).exec(cb);
            }, 

            // filePermissionUpdate:function(cb){
                
            //     DeletedList.find({
            //         deleted_id  : options.file_id, 
            //         type        : 2 
            //     }).then(function (res) {
            //         res.forEach(function (deletedlist) {

            //             DirectoryPermission.create({
            //                 type        : deletedlist.permission,
            //                 orphan      : null,
            //                 AccountId   : deletedlist.account_id,
            //                 DirectoryId : deletedlist.deleted_id
            //             }).then(function (perm) {
            //                 // return perm;
            //             });

            //             DeletedList.update({
            //                 id: deletedlist.id
            //             }, {
            //                 deleted_id   : null,
            //                 directory_id : null 
            //             }).then(function(per){

            //             });



            //         }, cb());
            //     });
            // }

        }, function(err, result){
            if (err) cb(null ,err);
            cb(null, result);
        });
    }
};
