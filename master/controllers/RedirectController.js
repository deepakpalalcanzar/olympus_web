/**
 * Redirect New API Methods to New Server
 */
var request = require('request');
var fs = require( "fs" );
var stream = require( "stream" );

var RedirectController = {
    redirect: function (req, res) {


	//console.log("sending request sending request sending request sending request sending request sending request");
	//console.log(req.headers['ip']);
	//console.log(req.session.Account.ip);
	//console.log("sending request sending request sending request sending request sending request sending request");

// hack the session bro
        var _session = {
            authenticated: true,
            Account: req.session.Account
        };

// Strip original headers of host and connection status
        var headers = req.headers;
        delete headers.host;
        delete headers.connection;
        if(req.url == '/files/content' || req.url.match(/^\/files\/content\//)){
            console.log('IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII');
            console.log('http://localhost:1337' + req.path);
            console.log('IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII');
        }
// Build options for request
        var options = {
            uri: 'http://localhost:1337' + req.path,
            method: req.method,
            headers: headers
        };

        if (req.method === 'POST' && (req.url == '/files/content' || req.url.match(/^\/files\/content\//))) {

options.uri = 'http://localhost:1337/files/content';
options.name = req.param('name');
options.parent_id = req.param('parent_id');

console.log('|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||-|||');
console.log(req.params);
// console.log('headersheadersheadersheadersheadersheaders');
console.log(headers);
console.log('TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT-TTT');
console.log(options);
console.log('IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII=IIIIIIII');

            var proxyReq = req.pipe(request.post(options));
            proxyReq.on('data', function (data) {

                try {
                    data = JSON.parse(data.toString('utf8'));
                } catch (e) {
                    console.log('MASTERERRORMASTERERRORMASTERERRORMASTERERROR');
                    console.log(e);
                    data = {error: 'unknown error'};
                }

                try{
                    if (data.error) {
                        req.unpipe();
                        proxyReq.end();
                        console.log(data.error);
                        if(data.error == 'FileExist'){
                            console.log('redirecttrystartredirecttrystart');
                            var response = {
                                // total_count: data.filedata.length,
                                entries: data.filedata
                            };
                            console.log(response);
                            return res.json(data, 500);
                            console.log('redirecttryendredirecttryend');
                            return res.json(response);
                        }else if(data.error == 'adapter_error'){
                            return res.json(data, 500);
                        }else if(data.error == 'empty_file_error'){
                            return res.json(data, 500);
                        }else if(data.error == 'MalformedXML'){
                            return res.json(data, 500);
                        }
                        //req.end();//[TypeError: Object #<IncomingMessage> has no method 'end']
                        console.log('RETURNING DATA 777 ERROR RETURNING DATA ERROR RETURNING DATA ERROR ');
                        // return res.json({error: 'unknown error555', type: 'error'},500);
                        return res.send(500);
                    }

                    if (data.origParams) {
                        return afterUpload(data);
                    }
    // Get dir subscribers
                    var subscribers = Directory.roomName(data.parentId);
    // Broadcast a message to everyone watching this INode to update accordingly.
                    SocketService.broadcast('UPLOAD_PROGRESS', subscribers, {
                        id: data.parentId,
                        filename: data.name,
                        percent: data.percent
                    });
                    console.log('FORWARD SIX FORWARD SIX FORWARD SIX FORWARD SIX FORWARD SIX FORWARD SIX');
                } catch (e) {
                    console.log('FORWARD ONE FORWARD ONE FORWARD ONE FORWARD ONE FORWARD ONE FORWARD ONE');
                    console.log(e);
                    data = {error: 'unknown error'};
                    return res.json({error: 'unknown error555', type: 'error'},500);
                }

            });


            proxyReq.on('error', function (err) {
                return res.send(500);
            });
            return;
        }
        else if (req.url.match(/^\/file\/download\//) || req.url.match(/^\/file\/open\//)) {

            File.find(req.param('id')).success(function (fileModel) {
                // If we have a file model to work with...
                if (fileModel) {

                    var options = {
                        uri: 'http://localhost:1337/logging/register/',
                        method: 'POST',
                    };

                    // If the "open" param isn't set, force the file to download
                    if (!req.url.match(/^\/file\/open\//) || fileModel.mimetype == 'video/mp4') {
                        res.setHeader('Content-disposition', 'attachment; filename=\"' + fileModel.name + '\"');

                        if (req.headers['user-agent'].indexOf('Linux') > -1 || req.headers['user-agent'].indexOf('Window') > -1 || req.headers['user-agent'].indexOf('Mac') > -1) {
                            var user_platform = "Web Application";
                        } else {
                            var user_platform = req.headers['user-agent'];
                        }

// console.log(req.session.Account);
// console.log(req.headers['ip']);
// console.log(req.headers['x-forwarded-for'] +' || '+ req.connection.remoteAddress);//IP
                        /* Logging Of File Download */
                        options.json = {
                            user_id: req.session.Account.id,
                            text_message: 'has downloaded ' + fileModel.name,
                            activity: 'download',
                            on_user: fileModel.id,
                            ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                            platform: user_platform,
                        };
                        
                        request(options, function (err, response, body) {
                            if (err)
                                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                        });
                    }

                    if(fileModel.isOnDrive){

                        // fs.readFile( sails.config.appPath + "/public/drive_secret/" + 'client_secret.json', function processClientSecrets(err, content) {
                        //   if (err) {
                        //     console.log('Error loading client secret file: ' + err);
                        //     return;
                        //   }

                        SiteOptions.find({where: {id: 1}}).done(function (err, credentials) {

                            if (err)
                                return res.json({error: err, type: 'error'});

                            if(credentials.gdriveSync){
                              // Authorize a client with the loaded credentials, then call the
                              // Drive API.

                              console.log('========================================================================');
                              console.log(req.param('drive_action'));
                              // console.log('========================================================================');
                              // console.log(JSON.parse(content));
                              // console.log(sails);
                              sails.controllers.directory.authorize('file_open', req.session.Account.id, req.param('refresh_token'), credentials, function (auth, driveUploadPathId) {

                                console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
                                console.log(auth);
                                console.log(driveUploadPathId);

                                var google = require('googleapis');

                                var drive = google.drive({
                                  version: 'v2',
                                  auth: auth
                                });

                                var fileId = fileModel.fsName;
                                // res.setHeader('Content-Type', fileModel.mimetype);
                                console.log('fileId fileModel', fileId, fileModel.mimetype);
                                /*var dest = fs.createWriteStream('/tmp/'+fileModel.name);
                                drive.files.get({
                                  fileId: fileId,
                                  alt: 'media'
                                }, {
                                  encoding: null // Make sure we get the binary data
                                }, function (err, buffer) {
                                  // Nice, the buffer is actually a Buffer!
                                  buffer.pipe(res);
                                });*/
                                /*drive.files.get({
                                   fileId: fileId,
                                   // mimeType: fileModel.mimetype,//'application/pdf'
                                   alt: 'media'
                                })
                                .on('end', function() {
                                  console.log('Done');
                                })
                                .on('error', function(err) {
                                  console.log('Error during download', err);
                                })
                                .pipe(res);*/
                                var doc_mimes = [
                                    // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',//Export only supports Google Docs.
                                    'application/vnd.google-apps.document',
                                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                    'application/vnd.google-apps.spreadsheet'
                                ];
                                if(_.contains( doc_mimes, fileModel.mimetype)){
                                    console.log('Downloading DOCS');
                                    var proxyReq_temp = drive.files.export({
                                       fileId: fileId,
                                       mimeType: fileModel.mimetype,//'application/pdf'
                                       // alt: 'media'
                                    })
                                    .on('end', function() {
                                      console.log('Done');
                                    })
                                    .on('error', function(err) {
                                      console.log('Error during doc download', err);
                                    });
                                    proxyReq_temp.pipe(
                                        new stream.PassThrough().pipe(
                                            fs.createWriteStream( "./copy_" + fileModel.fsName )
                                        )
                                    );

                                    var proxyReq = proxyReq_temp.pipe(res);
                                }else{
                                    console.log('Downloading FILES');
                                    var proxyReq_temp = drive.files.get({
                                       fileId: fileId,
                                       // mimeType: fileModel.mimetype,//'application/pdf'
                                       alt: 'media'
                                    })
                                    .on('end', function() {
                                      console.log('Done');
                                    })
                                    .on('error', function(err) {
                                      console.log('Error during media download', err);
                                    }).pipe(res);
                                    // proxyReq_temp.pipe(
                                    //     new stream.PassThrough().pipe(
                                    //         fs.createWriteStream( "./copy_" + fileModel.fsName )
                                    //     )
                                    // );

                                    // var proxyReq = proxyReq_temp.pipe(res);
                                }
                              });
                            }else{
                                return res.json({error: 'driveSyncDisabled', type: 'error'});
                            }
                        });
                        // });//fs.readFile

                    }else if(fileModel.isOnDropbox){
                        // && fileModel.downloadLink
                        SyncDbox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
                            if (err)
                                res.send(404);
                            if(!err && tokenrow){
                                res.setHeader('Content-Type', fileModel.mimetype);
                                // var dest = fs.createWriteStream(sails.config.appPath + "/public/drive_secret/" + fileModel.fsName );
                                //curl -X POST https://content.dropboxapi.com/2/files/download --header "Authorization: Bearer y1Y8Lyc_ARAAAAAAAAAA_fEOHcRkiwqxc5Nw9zN3xmugf8JyrX2gGS3XjZQn5nl6" --header "Dropbox-API-Arg: {\"path\": \"/logo_square.png\"}" -o "./logosquares222.png"
                                var https = require('https');
                                var apiUrl = 'content.dropboxapi.com';
                                var options = {
                                  host: apiUrl,
                                  port: 443,
                                  path: '/2/files/download',
                                  method: 'POST',
                                  headers: {
                                    'Authorization': 'Bearer '+tokenrow.access_token,
                                    'Dropbox-API-Arg': '{\"path\": \"'+fileModel.downloadLink+'\"}'
                                  },
                                  rejectUnauthorized: false
                                };
                                https.request(options, function(apiRes) {
                                    // apiRes.pipe(dest);//Save to local disk
                                    apiRes.pipe(res);//Pipe to reponse
                                }).end();
                            }
                        });
                    }else if(fileModel.isOnBox){

                        SiteOptions.find({where: {id: 1}}).done(function (err, credentials) {

                            if (err)
                                return res.json({error: err, type: 'error'});

                            if(credentials.boxSync){
                                // && fileModel.downloadLink
                                SyncBox.find({where:{account_id: req.session.Account.id}}).done(function (err, tokenrow) {
                                    if (err)
                                        res.send(404);

                                    if(!err && tokenrow){

                                        var superagent = require('superagent');
                                        superagent
                                        .get('https://api.box.com/2.0'+'/'+'files'+ '/' +fileModel.downloadLink+ '/content')
                                        .set('Authorization', 'Bearer '+ tokenrow.access_token)
                                        .redirects(0)
                                        .end(function (boxfileres) {

                                            if(boxfileres.status == 401){
                                                //Refresh Token
                                                superagent
                                                .post('https://app.box.com/api' + '/oauth2/token')
                                                .field('grant_type', "refresh_token")
                                                .field('client_id', credentials.boxClientId)
                                                .field('client_secret', credentials.boxClientSecret)
                                                .field('refresh_token', tokenrow.refresh_token)
                                                .end(function (err, boxauthres) {
                                                    // console.log(boxauthres, err);
                                                    if(boxauthres.status != 200) {
                                                        console.log('Error: '+boxauthres.error.message);
                                                        return res.send(boxauthres.error.message, boxauthres.status)
                                                    }
                                                    tokenrow.access_token     = boxauthres.body.access_token;
                                                    tokenrow.refresh_token    = boxauthres.body.refresh_token;
                                                    tokenrow.save().done(function(err) {
                                                        //Set it as Active
                                                        //Again Try Downloading
                                                        superagent
                                                        .get('https://api.box.com/2.0'+'/'+'files'+ '/' +fileModel.downloadLink+ '/content')
                                                        .set('Authorization', 'Bearer '+ boxauthres.body.access_token)
                                                        .redirects(0)
                                                        .end(function (boxfileres) {

                                                          if(boxfileres.status != 302){//all error including 401
                                                            return res.send(boxfileres.error.message, boxfileres.status);
                                                          }else{

                                                              var https = require('https');
                                                              //var fs = require('fs');
                                                              //var file = fs.createWriteStream("10434240_750083801719895_7703617608028781310_n.gif");
                                                              var request = https.get(boxfileres.response.headers.location, function(response) {
                                                                console.log('downloading');
                                                                response.pipe(res);
                                                              });
                                                          }
                                                        });
                                                    });
                                                });

                                            }else if(boxfileres.status != 302){//other error

                                                return res.send(boxfileres.error.message, boxfileres.status);

                                            }else{

                                                var https = require('https');
                                                //var fs = require('fs');
                                                //var file = fs.createWriteStream("10434240_750083801719895_7703617608028781310_n.gif");
                                                var request = https.get(boxfileres.response.headers.location, function(response) {
                                                    console.log('downloading');
                                                    response.pipe(res);
                                                });
                                            }
                                        });
                                    }
                                });
                            }else{
                                return res.json({error: 'boxSyncDisabled', type: 'error'});
                            }
                        });
                    }else{

//                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&  FS name  &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
//                    console.log(req.url);
//                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&& FS name &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');


                        // set content-type header
                        res.setHeader('Content-Type', fileModel.mimetype);
                        options.uri = "http://localhost:1337/file/download/" + fileModel.fsName + "?_session=" + JSON.stringify(_session);

                        // var proxyReq = request.get(options).pipe(res);
                        // if (req.url.match(/^\/file\/open\//)) {//open
                            //Rishabh: Backpressure issue reolved
                            // http://www.bennadel.com/blog/2817-the-affect-of-back-pressure-when-piping-data-into-multiple-writable-streams-in-node-js.htm
                            var proxyReq_temp = request.get(options);
                            proxyReq_temp.pipe(
                                new stream.PassThrough().pipe(
                                    fs.createWriteStream( "./copy_" + fileModel.fsName )
                                )
                            );

                            var proxyReq = proxyReq_temp.pipe(res);
                        // }else{//download
                        //     var proxyReq = request.get(options).pipe(res);
                        // }
                        proxyReq.on('error', function (err) {
                            res.send(err, 500)
                        });
                    }
                }

            }).error(function (err) {
                res.send(err, 500);
            });
            return;
        } else if (req.url.match(/^\/file\/thumbnail\//)) {

            if(req.param('id') != '{{id}}'){//avoid template load-time calling
                File.find(req.param('id')).success(function (fileModel) {
                    // If we have a file model to work with...
                    if (fileModel) {
                        // set content-type header
                        res.setHeader('Content-Type', fileModel.mimetype);
                        
                     // if (sails.config.fileAdapter.adapter == "s3") {
                     //        var fsNamethumbanil = fileModel.fsName;
                     //    } else {
                     //        if (fileModel.thumbnail == "1") {
                     //            var fsNamethumbanil = "thumbnail-" + fileModel.fsName;
                     //        } else {
                     //            var fsNamethumbanil = fileModel.fsName;
                     //        }
                     //    }
                         if(fileModel.isOnBox){
                            SyncBox.find({where:{id: fileModel.uploadPathId}}).done(function (err, tokenrow) {
                                if (err) {
                                    console.log('Error loading client secret file: ' + err);
                                    return res.send(500);
                                }
                                if( tokenrow ){
                                    var thumb_extension = "jpg";
                                    // curl https://api.box.com/2.0/files/FILE_ID/thumbnail.png?min_height=256&min_width=256 \ -H "Authorization: Bearer ACCESS_TOKEN"
                                    options.uri = "https://api.box.com/2.0/files/"+fileModel.downloadLink+"/thumbnail."+thumb_extension+"?min_height=32&min_width=32";//PNG:32|64|128|256 JPG:32|94|160|320

                                    var superagent = require('superagent');
                                    var boxRequest = superagent
                                    .get(options.uri)
                                    .set('Authorization', 'Bearer '+tokenrow.access_token)
                                    .redirects(0);
                                    INodeService.doBoxRequest(tokenrow, boxRequest,function onBoxComplete (err, boxfile) {
                                        if(boxfile.status == 202 || boxfile.status == 200){
                                          boxfile.pipe(res);
                                        }else{
					    console.log('Box thumb not found');
                                           //console.log(boxfile, err, 'boxfile');
                                        }
                                    });
                                }
                            });
                         }else{
                     var fsNamethumbanil = fileModel.fsName;                    
                        
                        options.uri = "http://localhost:1337/file/thumbnaildownload/" + fsNamethumbanil + "?_session=" + JSON.stringify(_session);
                        var proxyReq = request.get(options).pipe(res);
                        proxyReq.on('error', function (err) {
                            res.send(err, 500)
                        });
                        }
                    }// Otherwise serve up the anonymous avatar image
                    else {
                        res.setHeader('Content-Type', 'image/png');
                        fs.readFile(__dirname + '/../../public/images/avatar_anonymous.png', function (err, data) {
                            if (err)
                                return res.send(500);
                            res.send(data);
                        });
                    }
                }).error(function (err) {
                    res.send(err, 500);
                });
            }else{
                res.send(500);
            }
            return;
        } else if (req.url.match(/^\/images\/profile\//)) {

            if(req.param('filename') != '{{filename}}'){//avoid template load-time calling

                console.log('TESTTTESTTTESTTTESTTTESTTTESTTTESTTTESTTTESTTTESTT');
                Account.find({where:{avatar_image:req.param('filename')}}).success(function (account) {

                    console.log('accountaccountaccountaccountaccountaccount');
                    // If we have a file model to work with...
                    if (account) {

                        console.log(account.length);
                        // set content-type header
                        res.setHeader('Content-Type', account.mimetype);

                        var fsNameprofile = account.avatar_image;

                        var headers = req.headers;
                        delete headers.host;
                        delete headers.connection;
                        
                        // Build options for request
                        var options = {
                            uri: 'http://localhost:1337/files/profiledownload/',
                            method: 'POST',
                            headers: headers,
                            json: {
                                id: account.id,
                                avatar_image: account.avatar_image
                            }
                        };

                        console.log(options.json);

                        var proxyReq = request.post(options).pipe(res);
                        proxyReq.on('error', function (err) {
                            console.log('chunlErrorchunlErrorchunlErrorchunlErrorchunlError');
                            console.log(err);
                            res.send(err, 500)
                        });
                        // proxyReq.on('data', function (data) {
                        //     console.log('chunkRecivedchunkRecivedchunkRecivedchunkRecived');
                        // });
                    }// Otherwise serve up the anonymous avatar image
                    else {
                        res.setHeader('Content-Type', 'image/png');
                        fs.readFile(__dirname + '/../../public/images/avatar_anonymous.png', function (err, data) {
                            if (err)
                                return res.send(500);
                            res.send(data);
                        });
                    }
                }).error(function (err) {
                    res.send(err, 500);
                });
            }else{
                res.send(500);
            }
            return;
        } else if (req.url.match(/^\/images\/enterprises\//)) {

            if(req.param('filename') != '{{filename}}'){//avoid template load-time calling

                console.log('TESTTTESTTTESTTTESTTTESTTTESTTTESTTTESTTTESTTTESTT');
                Account.find({where:{enterprise_fsname:req.param('filename')}}).success(function (account) {

                    console.log('accountaccountaccountaccountaccountaccount');
                    // If we have a file model to work with...
                    if (account) {

                        console.log(account.length);
                        // set content-type header
                        res.setHeader('Content-Type', account.mimetype);

                        var fsNameprofile = account.enterprise_fsname;

                        var headers = req.headers;
                        delete headers.host;
                        delete headers.connection;
                        
                        // Build options for request
                        var options = {
                            uri: 'http://localhost:1337/files/logodownload/',
                            method: 'POST',
                            headers: headers,
                            json: {
                                id: account.id,
                                enterprise_fsname: account.enterprise_fsname
                            }
                        };

                        console.log(options.json);

                        var proxyReq = request.post(options).pipe(res);
                        proxyReq.on('error', function (err) {
                            console.log('chunlErrorchunlErrorchunlErrorchunlErrorchunlError');
                            console.log(err);
                            res.send(err, 500)
                        });
                        // proxyReq.on('data', function (data) {
                        //     console.log('chunkRecivedchunkRecivedchunkRecivedchunkRecived');
                        // });
                    }// Otherwise serve up the anonymous avatar image
                    else {
                        res.setHeader('Content-Type', 'image/png');
                        fs.readFile(__dirname + '/../../public/images/avatar_anonymous.png', function (err, data) {
                            if (err)
                                return res.send(500);
                            res.send(data);
                        });
                    }
                }).error(function (err) {
                    res.send(err, 500);
                });
            }else{
                res.send(500);
            }
            return;
        }
        // Set Body payload if this is a POST or PUT request
        else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            var body = req.body || {};
            body._session = _session;
            options.body = JSON.stringify(body);
        }

        // Make a request to the new API
        request(options, after);

        function after(err, response, body) {
            if (err)
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
            if (response && response.statusCode !== 200) {
                return res.json({error: body, type: 'error'}, response.statusCode);
            }

            // Try and parse the JSON response
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.log(e.stack, 'body ->', body);
                return res.json({error: e.message, type: 'error'});
            }

            // Resend using the original response statusCode
            // use the json parsing above as a simple check we got back good stuff
            res.json(body, response && response.statusCode);

        }
        ;

        function afterUpload(body) {

            var preFile = body.oldFile;
            var parsedFormData;
            if (body.origParams.data) {
                parsedFormData = JSON.parse(body.origParams.data);
            }
            else if (body.origParams.id) {
                parsedFormData = {
                    parent: {
                        id: body.origParams.id,
                    }
                };
            }
            // API parameters
            else if (body.origParams.parent_id) {
                parsedFormData = {
                    parent: {
                        id: body.origParams.parent_id,
                    }
                };
            }

            var fileOptions = {
                name: body.name,
                size: body.size,
                type: body.mimetype,
                fsName: body.fsName,
                oldFile: preFile,
                oldFileName: body.oldFileName,
                version: body.version,
                parentId: parsedFormData.parent.id,
                replaceFileId: req.param('replaceFileId'),
                account_id: req.session.Account.id, // AF
                thumbnail: body.thumbnail ? body.thumbnail: "1",
                md5checksum: body.md5checksum,
                uploadPathId: body.uploadPathId,
                isOnDrive: body.isOnDrive,
                isOnDropbox: body.isOnDropbox,
                isOnBox: body.isOnBox,
                viewLink: body.viewLink,
                downloadLink: body.downloadLink,
                iconLink: body.iconLink,
            };

            File.handleUpload(fileOptions, function (err, resultSet) {

                if (err)
                    return res.send(err, 500);

                //-----------------------------Create Log--------------------------------

                console.log('4444444444444444444444444444444444444444');
                var options = {
                    uri: 'http://localhost:1337/logging/register/',
                    method: 'POST',
                };

                
                var user_platform;
                if (req.headers.user_platform) {
                    user_platform = req.headers.user_platform;
                } else {
                    if ( req.headers['user-agent'] && (req.headers['user-agent'].indexOf('Linux') > -1 || req.headers['user-agent'].indexOf('Window') > -1 || req.headers['user-agent'].indexOf('Mac') > -1) ){
                        var user_platform = "Web Application";
                    } else {
                        var user_platform = req.headers['user-agent'];
                    }
                }
                if (user_platform == "Apache-HttpClient/UNAVAILABLE (java 1.4)") {
                    user_platform = "Android - Phone"
                }

                /* Logging Of File Download */
                options.json = {
                    user_id: req.session.Account.id,
                    text_message: 'has uploaded a file ' + body.fsName,
                    activity: 'Uploaded',
                    on_user: req.session.Account.id,//req.session.Account.id,
                    ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                    platform: user_platform
                };

                request(options, function (err, response, body) {
                    if (err)
                        console.log('ERROR in logging: '+err);// return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                });
                //-----------------------------Create Log--------------------------------

                var response = {
                    total_count: resultSet.length,
                    entries: resultSet
                };
                res.json(response);

            });
        }
        ;

        function afterUploadCheck(body) {

            var preFile = body.oldFile;
            var parsedFormData;
            if (body.origParams.data) {
                parsedFormData = JSON.parse(body.origParams.data);
            }
            else if (body.origParams.id) {
                parsedFormData = {
                    parent: {
                        id: body.origParams.id,
                    }
                };
            }
            // API parameters
            else if (body.origParams.parent_id) {
                parsedFormData = {
                    parent: {
                        id: body.origParams.parent_id,
                    }
                };
            }

            File.find(req.param('id')).success(function (fileModel) {
                // If we have a file model to work with...
                if (fileModel) {
console.log('GTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGT');
console.log(fileModel);
console.log('GTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGTGT');
res.send(fileModel);
                }

            }).error(function (err) {
                res.send(err, 500);
            });

            /*File.handleUpload({
                name: body.name,
                size: body.size,
                type: body.mimetype,
                fsName: body.fsName,
                oldFile: preFile,
                version: body.version,
                parentId: parsedFormData.parent.id,
                replaceFileId: req.param('replaceFileId'),
                account_id: req.session.Account.id, // AF
                thumbnail: "1",

            }, function (err, resultSet) {

                if (err)
                    return res.send(err, 500);
                var response = {
                    total_count: resultSet.length,
                    entries: resultSet
                };
                res.json(response);


            });*/
        }
    },
    redirectQuota: function (req, res) {
        req.path = '/folders/quota';

        // hack the session bro
        var _session = {
            authenticated: true,
            Account: req.session.Account
        };

        // Strip original headers of host and connection status
        var headers = req.headers;
        delete headers.host;
        delete headers.connection;

        // Build options for request
        var options = {
            uri: 'http://localhost:1337' + req.path,
            method: req.method,
            headers: headers
        };

        options.json = {
            folderId: req.param('folderId'),
            quota: req.param('quota'),
            _session: {
                authenticated: true,
                Account: req.session.Account
            }
        }

        // Make a request to the new API
        request(options, function (err, response, body) {
            if (err)
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);

            // Resend using the original response statusCode
            // use the json parsing above as a simple check we got back good stuff
            res.json(body, response && response.statusCode);
        });
    }

};

_.extend(exports, RedirectController);
