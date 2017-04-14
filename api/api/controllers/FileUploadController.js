// /*---------------------
// 	:: File
// 	-> controller
// ---------------------*/
// var crypto       = require('crypto'),
//     uuid         = require('node-uuid'),
//     fileService  = require('../services/lib/file/util');
//     emailService = require('../services/email');
//     knox         = require('knox');
//     fsx          = require('fs-extra');  
//     path = require('path');

// var encryptedData = {};

// var FileUploadController = {

// 	upload: function(req, res){
		
// 		if(req.param('Filename')){
//             var uploadStream = req.file('Filedata');
//         }else{
//             var uploadStream = req.file('files[]');
//         }
		
// 		uploadStream.on('error', function (err){ 
//             return res.write(JSON.stringify({error: err}), 'utf8');
//         });

//     	if (req.param('data')) {
//     		data = JSON.parse(req.param('data'));
//     	}else if (req.param('id')) {
//     		data = { parent: { id: req.param('id') }};
//     	}else if (req.param('parent_id')) {
//     		data = { parent: { id: req.param('parent_id') } };
//     	}

// 		Directory.workgroup({id:data.parent.id}, function(err, workgroup) {
      
//             var receiver = global[sails.config.receiver+'Receiver'].newReceiverStream({
//                 maxBytes: workgroup.quota - workgroup.size,
//                 totalUploadSize: req.headers['content-length']
//             });

//             receiver.on('progress', function(progressData){
//                 progressData.parentId = typeof req.param('data') == 'undefined' ? req.param('parent_id') : data.parent.id;
//                 res.write(JSON.stringify(progressData), 'utf8')
//             });

//             uploadStream.upload(receiver, function (err, files) {

//                 if (err) {
//                     return res.write(JSON.stringify({error: err}), 'utf8');
//                 }

//                 var file = files[0];
//                 // Find the file with the same name in a database             
//                 File.findOne({   
//                     name: file.filename,
//                     DirectoryId: data.parent.id,
//                 }).exec(function (err, fileData){
//                     // If File exist in a database then find the maximum version of that file               
//                     if(fileData){ 

//                         var versionData = new Array();
//                         var fileVersionData = new Array();
                        
//                         Version.find({
//                             parent_id: fileData.id 
//                         }).done(function (err, maxData){

//                             if(maxData.length == '0'){

//                                 if(fileData.size == file.size){

//                                     streamAdaptor.firstFile( 
//                                         { first: fileData.fsName, second:file.extra.fsName}, function (rmErr) {
//                                         var parsedResponse = JSON.parse(rmErr)
//                                         if(parsedResponse.first === parsedResponse.second){
//                                             fsx.unlink('/var/www/html/olympus/olypmus-web/api/files/'+file.extra.fsName);
//                                             // fsx.unlink('/home/alcanzar/api/files/'+file.extra.fsName);
//                                             return res.end(JSON.stringify({error: "FileExist"}), 'utf8');
//                                         }
//                                     });

//                                 }else{
                                
//                                     res.end(JSON.stringify({
//                                         origParams: req.params.all(),
//                                         name:     file.filename,
//                                         size:     file.size,
//                                         fsName:   file.extra.fsName,
//                                         mimetype: file.type,
//                                         version:  '1' ,
//                                         oldFile: fileData.id
//                                     }), 'utf8');

//                                 }

//                             }else{

//                                 maxData.forEach(function(applicant)  {
//                                     versionData.push(applicant.version);
//                                     fileVersionData.push(applicant.FileId);
//                                 });

//                                 var findMax = Math.max.apply(Math, versionData);
//                                 var maxElementIndex = versionData.indexOf(Math.max.apply(Math, versionData));

//                                 File.findOne({
//                                     id: fileVersionData[maxElementIndex]
//                                 }).done(function (err, latestFile){
//                                     if(latestFile.size == file.size){
//                                         streamAdaptor.firstFile( 
//                                             { first:latestFile.fsName, second:file.extra.fsName}, function (rmErr) {
//                                             var parsedResponse = JSON.parse(rmErr)
//                                             if(parsedResponse.first === parsedResponse.second){
//                                                 fsx.unlink('/var/www/html/olympus/olypmus-web/api/files/'+file.extra.fsName);
//                                                 // fsx.unlink('/home/alcanzar/api/files/'+file.extra.fsName);
//                                                 return res.end(JSON.stringify({error: "FileExist"}), 'utf8');
//                                             }
//                                         });
//                                     }else{

//                                         res.end(JSON.stringify({
//                                             origParams: req.params.all(),
//                                             name:     file.filename,
//                                             size:     file.size,
//                                             fsName:   file.extra.fsName,
//                                             mimetype: file.type,
//                                             version: parseInt(findMax) + 1 ,
//                                             oldFile: fileData.id
//                                         }), 'utf8');
//                                     }
//                                 });
//                             }
//                         });
//                     }else{
                          
//                         res.end(JSON.stringify({
//                             origParams: req.params.all(),
//                             name: file.filename,
//                             size: file.size,
//                             fsName: file.extra.fsName,
//                             mimetype: file.type,
//                             version: 0,
//                             oldFile: 0                        
//                         }), 'utf8');
//                     }
//                 });
//             });
//         });
// 	}
// };


// var streamAdaptor = {
//     firstFile: function (options, cb) {
//         var hash = crypto.createHash('md5');
//         var s    = fsx.createReadStream('/var/www/html/olympus/olypmus-web/api/files/'+options.first);
//         s.on('readable', function () {
//             var chunk;
//             while (null !== (chunk = s.read())) {
//               hash.update(chunk);
//             }
//         }).on('end', function () {
//             encryptedData["first"] = hash.digest('hex');
//         });

//         var hs = crypto.createHash('md5');
//         var nw= fsx.ReadStream('/var/www/html/olympus/olypmus-web/api/files/'+options.second);
//         nw.on('readable', functDirectory.workgroup({id:data.parent.id}, function(err, workgroup) {
      
//             var receiver = global[sails.config.receiver+'Receiver'].newReceiverStream({
//                 maxBytes: workgroup.quota - workgroup.size,
//                 totalUploadSize: req.headers['content-length']
//             });

//             receiver.on('progress', function(progressData){
//                 progressData.parentId = typeof req.param('data') == 'undefined' ? req.param('parent_id') : data.parent.id;
//                 res.write(JSON.stringify(progressData), 'utf8')
//             });

//             uploadStream.upload(receiver, function (err, files) {

//                 if (err) {
//                     return res.write(JSON.stringify({error: err}), 'utf8');
//                 }

//                 var file = files[0];
//                 // Find the file with the same name in a database             
//                 File.findOne({   
//                     name: file.filename,
//                     DirectoryId: data.parent.id,
//                 }).exec(function (err, fileData){
//                     // If File exist in a database then find the maximum version of that file               
//                     if(fileData){ 

//                         var versionData = new Array();
//                         var fileVersionData = new Array();
                        
//                         Version.find({
//                             parent_id: fileData.id 
//                         }).done(function (err, maxData){

//                             if(maxData.length == '0'){

//                                 if(fileData.size == file.size){

//                                     streamAdaptor.firstFile( 
//                                         { first: fileData.fsName, second:file.extra.fsName}, function (rmErr) {
//                                         var parsedResponse = JSON.parse(rmErr)
//                                         if(parsedResponse.first === parsedResponse.second){
//                                             fsx.unlink('/var/www/html/olympus/olypmus-web/api/files/'+file.extra.fsName);
//                                             // fsx.unlink('/home/alcanzar/api/files/'+file.extra.fsName);
//                                             return res.end(JSON.stringify({error: "FileExist"}), 'utf8');
//                                         }
//                                     });

//                                 }else{
                                
//                                     res.end(JSON.stringify({
//                                         origParams: req.params.all(),
//                                         name:     file.filename,
//                                         size:     file.size,
//                                         fsName:   file.extra.fsName,
//                                         mimetype: file.type,
//                                         version:  '1' ,
//                                         oldFile: fileData.id
//                                     }), 'utf8');

//                                 }

//                             }else{

//                                 maxData.forEach(function(applicant)  {
//                                     versionData.push(applicant.version);
//                                     fileVersionData.push(applicant.FileId);
//                                 });

//                                 var findMax = Math.max.apply(Math, versionData);
//                                 var maxElementIndex = versionData.indexOf(Math.max.apply(Math, versionData));

//                                 File.findOne({
//                                     id: fileVersionData[maxElementIndex]
//                                 }).done(function (err, latestFile){
//                                     if(latestFile.size == file.size){
//                                         streamAdaptor.firstFile( 
//                                             { first:latestFile.fsName, second:file.extra.fsName}, function (rmErr) {
//                                             var parsedResponse = JSON.parse(rmErr)
//                                             if(parsedResponse.first === parsedResponse.second){
//                                                 fsx.unlink('/var/www/html/olympus/olypmus-web/api/files/'+file.extra.fsName);
//                                                 // fsx.unlink('/home/alcanzar/api/files/'+file.extra.fsName);
//                                                 return res.end(JSON.stringify({error: "FileExist"}), 'utf8');
//                                             }
//                                         });
//                                     }else{

//                                         res.end(JSON.stringify({
//                                             origParams: req.params.all(),
//                                             name:     file.filename,
//                                             size:     file.size,
//                                             fsName:   file.extra.fsName,
//                                             mimetype: file.type,
//                                             version: parseInt(findMax) + 1 ,
//                                             oldFile: fileData.id
//                                         }), 'utf8');
//                                     }
//                                 });
//                             }
//                         });
//                     }else{
                          
//                         res.end(JSON.stringify({
//                             origParams: req.params.all(),
//                             name: file.filename,
//                             size: file.size,
//                             fsName: file.extra.fsName,
//                             mimetype: file.type,
//                             version: 0,
//                             oldFile: 0                        
//                         }), 'utf8');
//                     }
//                 });
//             });
//         });ion () {
//             var chunk;
//             while (null !== (chunk = nw.read())) {
//               hs.update(chunk);
//             }
//         }).on('end', function () {
//             encryptedData["second"] = hs.digest('hex');
//         });
//         return cb(JSON.stringify(encryptedData));
//     }
// };


// module.exports = FileUploadController;