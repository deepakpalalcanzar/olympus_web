var UUIDGenerator = require('node-uuid');
var cacheRoute = require('booty-cache');
var fsx = require('fs-extra');
var csv = require("fast-csv");
var pagination = require('pagination');


var AccountController = {
    'delete': function (req, res) {
        // Find the account to "delete"
        // TODO: Modify Account Queries to skip 'deleted' accounts
        // TODO: Setup a cron job to remove deleted accounts after X time has passed
        // TODO: Add a config variable for deletion pending period.
        Account.find(req.param('id')).done(function (err, account) {
            // Go ahead and return if we have an error.
            if (err)
                return res.json(APIService.Error(err));
            // Update the account to be marked deleted.
            account.updateAttributes({deleted: true}).done(function (err) {
                return res.json(err ? APIService.Error(err) : APIService.Account.mini(account));
            });
        });
    },
    // used for autocomplete in the sharing settings for an inode
    fetch: function (req, res) {
        // If this is a private deployment, just send back a 403. We dont want to search for users.
        if (sails.config.privateDeployment) {
            return res.send(403);
        }

        Account.findAll({
            where: ['deleted = 0 AND (email LIKE ? OR name LIKE ?)', "%" + req.param('email') + "%", "%" + req.param('name') + "%"],
            limit: 5
        }).success(function (accounts) {
            res.json(APIService.Account.mini(accounts));
        });
    },
    createuploadlog: function (req, res) {

        var request = require('request');
        /*Create logging*/
        var opts = {
            uri: 'http://localhost:1337/logging/register/',
            method: 'POST',
        };

        var user_platform;
        if (req.headers.user_platform) {
            user_platform = req.headers.user_platform;
        } else {
            if (req.headers['user-agent']) {
                user_platform = req.headers['user-agent'];
            } else {
                user_platform = "Web Application";
            }
        }
        if (user_platform == "Apache-HttpClient/UNAVAILABLE (java 1.4)") {
            user_platform = "Android - Phone"
        }

        opts.json = {
		user_id: req.session.Account.id,
	        text_message: 'has Uploaded a File ' + req.params.name,
	        activity: 'Uploaded',
            	on_user: req.session.Account.id,
//            ip: req.session.Account.ip,
		ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
		platform: user_platform,
        };



        request(opts, function (err1) {

        });
        /*Create logging*/
    },
    searchdate: function (req, res) {

        var sdate = "'" + req.params.from + "'";
        var edate = "'" + req.params.to + "'";
        var action = "'" + req.params.activity + "'";
        var actioncon = req.params.activity;

        if (actioncon == 'all') {
            var sql = "SELECT l.text_message, l.ip_address, DATE_FORMAT( l.createdAt, '%b %d %Y %h:%i %p' ) AS created_at, a.name FROM `logging` l INNER JOIN account a ON l.user_id = a.id where l.user_id=" + req.session.Account.id + " And l.createdAt between " + sdate + " and " + edate + " ORDER BY l.id DESC ";
        } else {
            var sql = "SELECT l.text_message, l.ip_address, DATE_FORMAT( l.createdAt, '%b %d %Y %h:%i %p' ) AS created_at, a.name FROM `logging` l INNER JOIN account a ON l.user_id = a.id where l.user_id=" + req.session.Account.id + " And l.action = " + action + " And l.createdAt between " + sdate + " and " + edate + " ORDER BY l.id DESC ";
        }

        sql = Sequelize.Utils.format([sql]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (accounts) {

            if (accounts.length) {
                res.json(accounts, 200);
            } else {
                res.json({
                    name: 'error_123',
                    avatarSrc: '/images/38.png',
                    notFound: true,
                });
            }

        }).error(function (e) {
            throw new Error(e);
        });
    },
    search: function (req, res) {
// If this is a private deployment, just send back a 403. We dont want to search for users.
        if (sails.config.privateDeployment) {
            return res.send(403);
        }

        var arr= req.params.from_page.split('/');

        if (req.session.Account.isSuperAdmin === 1) {

            if (req.params.from_page == '#enterprises/'+arr['1']) {
                Account.findAll({
                    where: ['deleted = 0 AND is_enterprise=1 AND (email LIKE ? OR name LIKE ?)', "%" + req.params.term + "%", "%" + req.params.term + "%"],
                    limit: 20
                }).success(function (accounts) {
                    res.json(accounts);
                });
            } else if (req.params.from_page == '#listusers/'+arr['1']) {
                Account.findAll({
                    where: ['deleted = 0 AND is_enterprise=0 AND (email LIKE ? OR name LIKE ?)', "%" + req.params.term + "%", "%" + req.params.term + "%"],
                    limit: 20
                }).success(function (accounts) {
                    res.json(accounts);
                });
            }

        } else {

            if (req.params.from_page == '#enterprises/'+arr['1']) {
                Account.findAll({
                    where: ['deleted = 0 AND is_enterprise=1 AND (email LIKE ? OR name LIKE ?) AND created_by = ? ', "%" + req.params.term + "%", "%" + req.params.term + "%", req.session.Account.id],
                    limit: 20
                }).success(function (accounts) {
                    res.json(accounts);
                });
            } else if (req.params.from_page == '#listusers/'+arr['1']) {
                Account.findAll({
                    where: ['deleted = 0 AND is_enterprise=0 AND (email LIKE ? OR name LIKE ?) AND created_by = ? ', "%" + req.params.term + "%", "%" + req.params.term + "%", req.session.Account.id],
                    limit: 20
                }).success(function (accounts) {
                    res.json(accounts);
                });
            }
        }
    },
    register: function (req, res) {

        var request = require('request');
        var options = {
            uri: 'http://localhost:1337/account/register/',
            method: 'POST',
        };

        options.json = {
            name: req.params.name,
            email: req.params.email,
            isVerified: true,
            isAdmin: false,
            password: req.params.password,
            created_by: req.session.Account.id,
            workgroup: req.params.workgroup,
            title: req.params.title,
            subscription: req.params.subscription,
        };

        request(options, function (err, response, body) {
            if (err)
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
//	      Resend using the original response statusCode
//	      use the json parsing above as a simple check we got back good stuff
            res.json(body, response && response.statusCode);
        });
    },
    read: function (req, res) {

        Account.find(req.session.Account.id).success(function (model) {
            _.shout('account', model);
        });

        res.json({
            name: 'Abhishek',
            avatarSrc: '/images/38.png'
        });

    },
    /* @By Alcanzar */

    listMembers: function (req, res) {
        Account.findAll({
            where: ['deleted = 0 AND created_by = ' + req.session.Account.id],
        }).success(function (accounts) {
            res.json(accounts, 200);
        });
    },
    listEnterprisesMembers: function (req, res) {

        Account.findAll({
            where: ['deleted = 0 AND created_by = ' + req.params.id],
        }).success(function (accounts) {
            res.json(accounts, 200);
        });

    },
listUsers: function (req, res) {

        var userId;
        if ((typeof req.param('id') != 'undefined') && (typeof req.param('isAdmin') != 'undefined')) {
            userId = req.param('id');
        } else {
            userId = req.session.Account.id;
        }

        if (req.session.Account.isSuperAdmin === 1) {

            var sql = "SELECT account.*, subscription.features, " +
                    "adminuser.admin_profile_id, adminuser.id as adminuser_id, enterprises.name as enterprise_name, enterprises.id as enterprises_id, dir.size, dir.quota FROM account " +
                    "LEFT JOIN subscription ON account.subscription_id=subscription.id " +
                    "LEFT JOIN adminuser ON account.id=adminuser.user_id " +
                    "LEFT JOIN enterprises ON account.created_by=enterprises.account_id " +
                    "LEFT JOIN directory dir ON dir.OwnerId = account.id " +
                    "WHERE account.is_enterprise=0 and account.deleted != 1";
            sql = Sequelize.Utils.format([sql]);

        } else {

            var sql = "SELECT account.*,subscription.features, adminuser.admin_profile_id, " +
                    "adminuser.id as adminuser_id , enterprises.name as enterprise_name, enterprises.id as enterprises_id, dir.size, dir.quota FROM account " +
                    "LEFT JOIN subscription ON account.subscription_id=subscription.id " +
                    "LEFT JOIN adminuser ON account.id=adminuser.user_id " +
                    "LEFT JOIN enterprises ON account.created_by=enterprises.account_id " +
                    "LEFT JOIN directory dir ON dir.OwnerId = account.id " +
                    "WHERE account.is_enterprise=0 and account.deleted != 1 and account.created_by=?";
            sql = Sequelize.Utils.format([sql, userId]);
        }

        sequelize.query(sql, null, {
            raw: true
        }).success(function (accounts) {
            if (accounts.length) {

                var totalpage = (accounts.length / 50) + 1;
                var Endlogdata = req.param('id') * 50;
                var Startlogdata = Endlogdata - 50;
                var range = Startlogdata + "," + Endlogdata;

                var boostrapPaginator = new pagination.TemplatePaginator({
                    prelink: '/', current: req.param('id'), rowsPerPage: 1,
                    totalResult: accounts.length, slashSeparator: false,
                    template: function (result) {
                        var i, len, prelink;
                        var html = "<div>";
                        if (result.pageCount < 2) {
                            html += "</div>";
                            return html;
                        }
                        prelink = this.preparePreLink(result.prelink);
                        if (result.previous) {
                            html += "<a href='#listusers/" + result.previous + "'>" + this.options.translator("PREVIOUS") + "</a> &nbsp; | &nbsp; ";
                        }
                        if (result.range.length) {
                            for (i = 0, len = result.range.length; i < len; i++) {
                                if (totalpage > result.range[i]) {
                                    if (result.range[i] === result.current) {
                                        html += "<a href='#listusers/" + result.range[i] + "'>" + result.range[i] + "</a> &nbsp; | &nbsp;";
                                    } else {
                                        html += "<a href='#listusers/" + result.range[i] + "'>" + result.range[i] + "</a> &nbsp; | &nbsp;";
                                    }
                                }
                            }
                        }
                        if (result.next) {
                            if (totalpage > result.next) {
                                html += "<a href='#listusers/" + result.next + "' class='paginator-next'>" + this.options.translator("NEXT") + "</a> &nbsp; ";
                            }
                        }
                        html += "</div>";
                        return html;
                    }
                });

                var Paginator = boostrapPaginator.render();


                if (req.session.Account.isSuperAdmin === 1) {

                    var sql = "SELECT account.*, subscription.features, " +
                            "adminuser.admin_profile_id, adminuser.id as adminuser_id, enterprises.name as enterprise_name, dir.size, dir.quota, enterprises.id as enterprises_id, " + '"' + Paginator + '" ' + " as Paginator  FROM account " +
                            "LEFT JOIN subscription ON account.subscription_id=subscription.id " +
                            "LEFT JOIN adminuser ON account.id=adminuser.user_id " +
                            "LEFT JOIN enterprises ON account.created_by=enterprises.account_id " +
                            "LEFT JOIN directory dir ON dir.OwnerId = account.id " +
                            "WHERE account.is_enterprise=0 and account.deleted != 1  LIMIT " + range + " ";
                    
                     console.log(sql);
                     
                    sql = Sequelize.Utils.format([sql]);

                } else {

                    var sql = "SELECT account.*,subscription.features, adminuser.admin_profile_id, " +
                            "adminuser.id as adminuser_id , enterprises.name as enterprise_name, dir.size, dir.quota, enterprises.id as enterprises_id, " + '"' + Paginator + '" ' + " as Paginator  FROM account " +
                            "LEFT JOIN subscription ON account.subscription_id=subscription.id " +
                            "LEFT JOIN adminuser ON account.id=adminuser.user_id " +
                            "LEFT JOIN enterprises ON account.created_by=enterprises.account_id " +
                            "LEFT JOIN directory dir ON dir.OwnerId = account.id " +
                            "WHERE account.is_enterprise=0 and account.deleted != 1 and account.created_by=?  LIMIT " + range + "";
                    
                    console.log(sql);
                    
                    sql = Sequelize.Utils.format([sql, userId]);
                }

                sequelize.query(sql, null, {
                    raw: true
                }).success(function (accounts) {
                    if (accounts.length) {



                        res.json(accounts, 200);
                    } else {
                        res.json({
                            name: 'error_123',
                            avatarSrc: '/images/38.png',
                            notFound: true,
                        });
                    }
                }).error(function (e) {
                    throw new Error(e);
                });

                //res.json(accounts, 200);
            } else {
                res.json({
                    name: 'error_123',
                    avatarSrc: '/images/38.png',
                    notFound: true,
                });
            }
        }).error(function (e) {
            throw new Error(e);
        });
    },
    listWorkgroup: function (req, res) {

        if (req.session.Account.isSuperAdmin) {
            var sql = "SELECT dir.id, dir.name FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId";
            sql = Sequelize.Utils.format([sql]);
        } else {
            var sql = "SELECT dir.id, dir.name FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dp.AccountId =? and dp.type='admin'";
            sql = Sequelize.Utils.format([sql, req.session.Account.id]);
        }

        sequelize.query(sql, null, {
            raw: true
        }).success(function (directory) {
            res.json(directory, 200);
        });

    },

    uploadSSL: function (req, res) {
        if( req.param('formaction') == 'uploadSSL' ){

            console.log(req.param('ssl_gd'));

            if(req.param('uploadfile') && req.param('uploadfile')=='uploadSSLGD')
            {
                var binaryData = req.param('ssl_gd');
                var old_ssl_gd = __dirname + '/../../ssl/gd_bundle.crt';

                var base64Data = binaryData.replace(/^data:application\/(pkix-cert|key);base64,/, "");
                    base64Data = base64Data.replace('+', ' ');
                var binaryData1 = new Buffer(base64Data, 'base64').toString('binary');

                fsx.writeFile(old_ssl_gd, '', 'binary', function (err) {
                    console.log('hello');
                            if (err) return console.log(err);

                           fsx.writeFile(old_ssl_gd, binaryData1, 'binary', function (err) {
                                console.log('hello');
                                        if (err) return console.log(err);

                                        //console.log(response);
                                        // sails.config.datasource.host = req.param('host');
                                        // sails.config.datasource.database = req.param('database');
                                        // sails.config.datasource.username = req.param('user');
                                        // sails.config.datasource.password = req.param('password');
                                        return res.json(200, 200);

                            });


                        });
            }
            else if(req.param('uploadfile') && req.param('uploadfile')=='uploadSSLOLYMPUS')
            {
                var binaryData = req.param('ssl_olympus');
                var old_ssl_gd = __dirname + '/../../ssl/olympus.crt';

                var base64Data = binaryData.replace(/^data:application\/(pkix-cert|key);base64,/, "");
                    base64Data = base64Data.replace('+', ' ');
                var binaryData1 = new Buffer(base64Data, 'base64').toString('binary');

                fsx.writeFile(old_ssl_gd, '', 'binary', function (err) {
                    console.log('hello');
                            if (err) return console.log(err);

                           fsx.writeFile(old_ssl_gd, binaryData1, 'binary', function (err) {
                                console.log('hello');
                                        if (err) return console.log(err);

                                        //console.log(response);
                                        // sails.config.datasource.host = req.param('host');
                                        // sails.config.datasource.database = req.param('database');
                                        // sails.config.datasource.username = req.param('user');
                                        // sails.config.datasource.password = req.param('password');
                                        return res.json(200, 200);

                            });


                        });
            }
            else if(req.param('uploadfile') && req.param('uploadfile')=='uploadSSLKEY')
            {
                var binaryData = req.param('ssl_key');
                var old_ssl_gd = __dirname + '/../../ssl/olympus.key';

                var base64Data = binaryData.replace(/^data:application\/(pkix-cert|pgp-keys);base64,/, "");
                    base64Data = base64Data.replace('+', ' ');
                var binaryData1 = new Buffer(base64Data, 'base64').toString('binary');

                fsx.writeFile(old_ssl_gd, '', 'binary', function (err) {
                    console.log('hello');
                            if (err) return console.log(err);

                           fsx.writeFile(old_ssl_gd, binaryData1, 'binary', function (err) {
                                console.log('hello');
                                        if (err) return console.log(err);

                                        //console.log(response);
                                        // sails.config.datasource.host = req.param('host');
                                        // sails.config.datasource.database = req.param('database');
                                        // sails.config.datasource.username = req.param('user');
                                        // sails.config.datasource.password = req.param('password');
                                        return res.json(200, 200);

                            });


                        });
            }
            else
            {
                return res.json({
                                    error: 'Please select all files.',
                                    type: 'error'
                                }, 400);
            }



        }
        else
        {
            return res.json({
                                    error: 'Some Error',
                                    type: 'error'
                                }, 400);
        }

    },

    checkDatabase: function (req, res) {
        if( req.param('formaction') == 'checkDatabase' ){

            var request = require('request');
            /*Create logging*/
            var opts = {
                uri: 'http://localhost:1337/account/checkDatabase/',
                method: 'POST',
            };

            opts.json = {
                formaction   : req.param('formaction'),
                host     : req.param('host'),
                user     : req.param('user'),
                password : req.param('password'),
                database : req.param('database')
            };

            console.log(opts);

            request(opts, function (err, response, body) {
                //console.log(err);
                //console.log(response);
                if (err){
                    console.log(err);
                    return res.json({error: err.error, type: 'error'}, response && response.statusCode);
                }

                if(response.statusCode == 400)
                {
                    return res.json({
                                    error: response.body.error,
                                    type: 'error'
                                }, 400);
                }

                if(response.statusCode == 200)
                {
                    localconfigjs = __dirname + '/../config/localConfig.js';
                    fsx.readFile(localconfigjs, 'utf8', function (err,data) {
                          if (err){
                            return res.json({
                                    error: err,
                                    type: 'error'
                                }, 400);
                        }
                    });

                    //console.log(sails.config);return res.json(response.statusCode, 200);

                    master_config_localConfig = '\
                        exports.datasource = { \r\n\
                            host: \''+req.param('host')+'\', \r\n\
                            database: \''+req.param('database')+'\', \r\n\
                            username: \''+req.param('user')+'\', \r\n\
                            password: \''+req.param('password')+'\' \r\n\
                        // Choose a SQL dialect, one of sqlite, postgres, or mysql (default mysql) \r\n\
                        // dialect:  \'mysql\', \r\n\
                        // Choose a file storage location (sqlite only) \r\n\
                        //storage:  \':memory:\', \r\n\
                        // mySQL only \r\n\
                        // pool: { maxConnections: 5, maxIdleTime: 30} \r\n\
                        }; \r\n\r\n\
                        // Self-awareness of hostname \r\n\
                        exports.host = \''+sails.config.host+'\';';

                    fsx.writeFile(localconfigjs, master_config_localConfig, 'utf8', function (err) {
                        if (err) return console.log(err);

                        console.log(response.statusCode);
                        sails.config.datasource.host = req.param('host');
                        sails.config.datasource.database = req.param('database');
                        sails.config.datasource.username = req.param('user');
                        sails.config.datasource.password = req.param('password');
                        return res.json(response.statusCode, 200);

                    });



                }
                else
                {
                    console.log(response.statusCode);
                    return res.json(response.statusCode, 200);
                }


            });

        }

    },

    getCurrentDatabase: function (req, res) {

        var opts = {
                host     : sails.config.datasource.host || 'localhost',
                user     : sails.config.datasource.username || 'root',
                password : sails.config.datasource.password,
                database : sails.config.datasource.database || 'olympus'
            };

        return res.json(opts, 200);

    },

    changeDomainname: function (req, res) {

    var domainname;
    var mail_service;
    var mandrill_key;
    var smtp_host;
    var smtp_port;
    var smtp_user;
    var smtp_pass;
    var trash_setting;
    var trash_setting_days;

console.log('777777777777777777777777777777777');
    console.log(req.params);
    console.log(req.param);

if( req.param('formaction') == 'save_domain_info' ){

    domainname         = req.param('newdomain');
    mail_service       = sails.config.mailService;
    mandrill_key       = sails.config.mandrillApiKey;
    smtp_host          = sails.config.smtpDetails.host;
    smtp_port          = sails.config.smtpDetails.port;
    smtp_user          = sails.config.smtpDetails.user;
    smtp_pass          = sails.config.smtpDetails.pass;
    trash_setting      = sails.config.trash_setting;
    trash_setting_days = sails.config.trash_setting_days;

}else if( req.param('formaction') == 'save_email_info' ){

    domainname         = sails.config.host;
    trash_setting      = sails.config.trash_setting;
    trash_setting_days = sails.config.trash_setting_days;

    mail_service = req.param('mail_service');

    if(mail_service == 'internal'){
        mandrill_key = sails.config.mandrillApiKey;
        smtp_host    = req.param('smtp_host');
        smtp_port    = req.param('smtp_port');
        smtp_user    = req.param('smtp_user');
        smtp_pass    = req.param('smtp_pass');
    }else if(mail_service == 'mandrill'){
        mandrill_key = req.param('mandrill_key');
        smtp_host    = sails.config.smtpDetails.host;
        smtp_port    = sails.config.smtpDetails.port;
        smtp_user    = sails.config.smtpDetails.user;
        smtp_pass    = sails.config.smtpDetails.pass;
    }
}else if( req.param('formaction') == 'save_trash_setting' ){
    domainname   = sails.config.host;
    mail_service = sails.config.mailService;
    mandrill_key = sails.config.mandrillApiKey;
    smtp_host    = sails.config.smtpDetails.host;
    smtp_port    = sails.config.smtpDetails.port;
    smtp_user    = sails.config.smtpDetails.user;
    smtp_pass    = sails.config.smtpDetails.pass;

    trash_setting      = req.param('trash_setting');
    trash_setting_days = req.param('trash_setting_days');
}

//START master_config_config content
master_config_config = '\
module.exports = { \r\n\
    specialAdminCode: \''+sails.config.specialAdminCode+'\', \r\n\
    mailService: \''+mail_service+'\', \r\n\
    mandrillApiKey: \''+mandrill_key+'\', \r\n\
    smtpDetails: { \r\n\
            host: \''+smtp_host+'\', \r\n\
            port: \''+smtp_port+'\', \r\n\
            user: \''+smtp_user+'\', \r\n\
            pass: \''+smtp_pass+'\' \r\n\
        }, \r\n\
    bootstrap: function(bootstrap_cb) { \r\n\
        if(bootstrap_cb) bootstrap_cb(); \r\n\
        },';
    /*fileAdapter: {  \r\n\
        // Which adapter to use  \r\n\
        adapter: \''+sails.config.fileAdapter.adapter+'\', \r\n\
        // Amazon S3 API credentials \r\n\
            s3: {  \r\n\
                accessKeyId     : \''+sails.config.fileAdapter.s3.accessKeyId+'\', \r\n\
                secretAccessKey : \''+sails.config.fileAdapter.s3.secretAccessKey+'\', \r\n\
                bucket          : \''+sails.config.fileAdapter.s3.bucket+'\', \r\n\
                region          : \''+sails.config.fileAdapter.s3.region+'\' \r\n\
            }, \r\n\
        // OpenStack Swift API credentials \r\n\
            swift: { \r\n\
                host        : \''+sails.config.fileAdapter.swift.host+'\', \r\n\
                port        : \''+sails.config.fileAdapter.swift.port+'\', \r\n\
                serviceHash : \''+sails.config.fileAdapter.swift.serviceHash+'\', \r\n\
                container   : \''+sails.config.fileAdapter.swift.container+'\', \r\n\
            }, \r\n\
        // Keystone API credentials \r\n\
            keystone: { \r\n\
                host    : \''+sails.config.fileAdapter.keystone.host+'\', \r\n\
                port    : \''+sails.config.fileAdapter.keystone.port+'\', \r\n\
                tenant  : \''+sails.config.fileAdapter.keystone.tenant+'\', // tenant === \'project\' in Horizon dashboard \r\n\
                username: \''+sails.config.fileAdapter.keystone.username+'\', \r\n\
                password: \''+sails.config.fileAdapter.keystone.password+'\' \r\n\
            } \r\n\
        }, \r\n\*/
master_config_config += '// Default title for layout \r\n\
            appName: \''+sails.config.appName+'\', \r\n\
        // App hostname \r\n\
            host: \''+domainname+'\', \r\n\
        // App root path \r\n\
            appPath: __dirname + \'\/..\', \r\n\
        // Port to run the app on \r\n\
            port: \''+sails.config.port+'\', //5008, \r\n\
            express: { \r\n\
                serverOptions: { \r\n\
                    ca: fs.readFileSync(__dirname + \'/../../ssl/gd_bundle.crt\'), \r\n\
                    key: fs.readFileSync(__dirname + \'/../../ssl/olympus.key\'), \r\n\
                    cert: fs.readFileSync(__dirname + \'/../../ssl/olympus.crt\') \r\n\
            } \r\n\
        }, \r\n\
        // Development or production environment \r\n\
            environment: \''+sails.config.environment+'\', \r\n\
        // Path to the static web root for serving images, css, etc. \r\n\
            staticPath: \'./public\', \r\n\
        // Rigging configuration (automatic asset compilation) \r\n\
            rigging: { \r\n\
                outputPath: \''+sails.config.rigging.outputPath+'\', \r\n\
                sequence: '+JSON.stringify(sails.config.rigging.sequence)+' \r\n\
            }, \r\n\
        // Prune the session before returning it to the client over socket.io \r\n\
            sessionPruneFn: function(session) { \r\n\
                var avatar = (session.Account && session.Account.id === 1) ? \'/images/\' + session.Account.id + \'.png\' : \'/images/avatar_anonymous.png\'; \r\n\
                var prunedSession = { \r\n\
                    Account: _.extend(session.Account || {}, { \r\n\
                        avatar: avatar \r\n\
                    }) \r\n\
                }; \r\n\r\n\
                return prunedSession; \r\n\
            }, \r\n\
        // API token \r\n\
            apiToken: \''+sails.config.apiToken+'\', \r\n\
        // Information about your organization \r\n\
            organization: { \r\n\
                name: \''+sails.config.organization.name+'\', \r\n\
                copyright: \''+sails.config.organization.copyright+'\', \r\n\
                squareLogoSrc: \''+sails.config.organization.squareLogoSrc+'\', \r\n\
            // Configurable footer link endpoints \r\n\
                links: { \r\n\
                    termsOfUse: \''+sails.config.organization.links.termsOfUse+'\', \r\n\
                    privacyPolicy: \''+sails.config.organization.links.privacyPolicy+'\', \r\n\
                    help: \''+sails.config.organization.links.help+'\' \r\n\
                } \r\n\
            }, \r\n\
            publicLinksEnabledByDefault: \''+sails.config.publicLinksEnabledByDefault+'\', \r\n\
        // NOTE: This is just to test for privateDevelopment feature. Need to figure out \r\n\
        // what determines this config options and implement that. \r\n\
            privateDeployment: false, \r\n\
            trash_setting: \''+trash_setting+'\', \r\n\
            trash_setting_days: \''+trash_setting_days+'\', \r\n\
};';//END master_config_config

// if( req.param('formaction') == 'save_domain_info' ){

//START master_config_localConfig content
master_config_localConfig = '\
exports.datasource = { \r\n\
    database: \''+sails.config.datasource.database+'\', \r\n\
    username: \''+sails.config.datasource.username+'\', \r\n\
    password: \''+sails.config.datasource.password+'\', \r\n\
    host: \''+sails.config.datasource.host+'\' \r\n\
// Choose a SQL dialect, one of sqlite, postgres, or mysql (default mysql) \r\n\
// dialect:  \'mysql\', \r\n\
// Choose a file storage location (sqlite only) \r\n\
//storage:  \':memory:\', \r\n\
// mySQL only \r\n\
// pool: { maxConnections: 5, maxIdleTime: 30} \r\n\
}; \r\n\r\n\
// Self-awareness of hostname \r\n\
exports.host = \''+domainname+'\';';/* \r\n\
port: \''+sails.config.port+'\', // change to 80 if you\'re not using SSL \r\n\
exports.fileAdapter = { \r\n\
// Choose a file adapter for uploads / downloads \r\n\
    adapter: \''+sails.config.fileAdapter.adapter+'\', \r\n\
    // Amazon s3 credentials \r\n\
    s3: { \r\n\
        accessKeyId     : \''+sails.config.fileAdapter.s3.accessKeyId+'\', \r\n\
        secretAccessKey : \''+sails.config.fileAdapter.s3.secretAccessKey+'\', \r\n\
        bucket          : \''+sails.config.fileAdapter.s3.bucket+'\', \r\n\
        region          : \''+sails.config.fileAdapter.s3.region+'\' \r\n\
    }, \r\n\r\n\
    // OpenStack Swift API credentials \r\n\
    swift: { \r\n\
        host: \''+sails.config.fileAdapter.swift.host+'\', \r\n\
        port: \''+sails.config.fileAdapter.swift.port+'\', \r\n\
        serviceHash: \''+sails.config.fileAdapter.swift.serviceHash+'\', \r\n\
        container: \''+sails.config.fileAdapter.swift.container+'\', \r\n\
    }, \r\n\
}';*/
//END master_config_localConfig content

//START root's index.html content
root_index_html = '\
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> \r\n\
<html xmlns="http://www.w3.org/1999/xhtml"> \r\n\
  <head> \r\n\
    <meta http-equiv="refresh" content="0; URL=\'https://'+domainname+'\'" /> \r\n\
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> \r\n\
    <title>Redirecting to Olympus</title> \r\n\
    <style type="text/css" media="screen"> \r\n\
      * { \r\n\
          margin: 0; \r\n\
          padding: 0; \r\n\
      } \r\n\
      body,html,div.validator{ \r\n\
        height: 100%; \r\n\
      } \r\n\
      div.login-page { \r\n\
          background: #3c4151 none repeat scroll 0 0; \r\n\
          height: 100%; \r\n\
          width: 100%; \r\n\
      } \r\n\
      div.login-container { \r\n\
          margin: 0 auto; \r\n\
          padding-top: 5%; \r\n\
      } \r\n\
      div.login-page img { \r\n\
          margin: 0 auto !important; \r\n\
          padding-top: 7%; \r\n\
          max-width: 100%; \r\n\
      } \r\n\
      img { \r\n\
          display: block; \r\n\
      } \r\n\
      div.login-template { \r\n\
          background: #f0f0f0 none repeat scroll 0 0; \r\n\
          border-radius: 8px; \r\n\
          margin: 0 auto; \r\n\
          width: 450px !important; \r\n\
          max-width: 100% !important; \r\n\
      } \r\n\
      div.login-template div.login-box-head { \r\n\
          color: #636c78; \r\n\
          font-size: 1.25em; \r\n\
          padding: 20px 0; \r\n\
          text-align: center; \r\n\
      } \r\n\
    </style> \r\n\
  </head> \r\n\
  <body> \r\n\
    <div class="validator"> \r\n\
      <div class="login-page portal-only"> \r\n\
      <img src="logo_loginScreen.png"> \r\n\
      <div class="login-outlet login-container"> \r\n\
      <div class="login-template"> \r\n\
      <div class="login-box-head">Please wait while we redirect you to the secure login page...</div> \r\n\
    </div> \r\n\
  </body> \r\n\
</html>';
//END root's index.html content
// }

        var request = require('request');
        /*Create logging*/
        var opts = {
            uri: 'http://localhost:1337/account/changeDomainname/',
            method: 'POST',
        };

        opts.json = {
            newdomainname: domainname,
            formaction   : req.param('formaction'),
            mandrillkey  : mandrill_key,
            mailservice  : mail_service,
            smtphost     : smtp_host,
            smtpport     : smtp_port,
            smtpuser     : smtp_user,
            smtppass     : smtp_pass,
            trash_setting   : trash_setting,
            days            : trash_setting_days
        };

console.log('33333333333333333333333333333333333');
        console.log(opts);

        request(opts, function (err, response, body) {

            if (err){
                console.log(err);
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
            }

            configjs = __dirname + '/../config/config.js';
            fsx.writeFile(configjs, master_config_config, 'utf8', function (err) {
                if (err) return console.log(err);
            });

            if( req.param('formaction') == 'save_domain_info' ){
                localconfigjs = __dirname + '/../config/localConfig.js';
                // fsx.readFile(localconfigjs, 'utf8', function (err,data) {
                //   if (err) {
                //     return console.log(err);
                //   }

                //   // var replaced_host_string = data.replace(/host:,/g, req.param('newdomain'));
                //   var replaced_host_string = data.replace(/(exports.host)(.+?)(?= \;)/, 'exports.host = \'newdomain\'');
                // console.log(replaced_host_string);
                //   fsx.writeFile(localconfigjs, replaced_host_string, 'utf8', function (err) {
                //     if (err) return console.log(err);
                //   });
                // });

                fsx.writeFile(localconfigjs, master_config_localConfig, 'utf8', function (err) {
                    if (err) return console.log(err);
                });

                indexpage = __dirname + '/../../../index.html';
                fsx.writeFile(indexpage, root_index_html, 'utf8', function (err) {
                    if (err) return console.log(err);
                });

                console.log('sails.config.host');
                console.log(sails.config.host);
                sails.config.host = domainname;
                console.log(sails.config.host);
            }else if(req.param('formaction') == 'save_email_info'){
                sails.config.mailService = mail_service;
                sails.config.mandrillApiKey = mandrill_key;
                if(typeof sails.config.smtpDetails != 'undefined'){
                    sails.config.smtpDetails.host = smtp_host;
                    sails.config.smtpDetails.port = smtp_port;
                    sails.config.smtpDetails.user = smtp_user;
                    sails.config.smtpDetails.pass = smtp_pass;
                }else{
                    sails.config.smtpDetails = { 
                        host: smtp_host, 
                        port: smtp_port, 
                        user: smtp_user,
                        pass: smtp_pass
                    };
                }
            }else{
                //save_trash_setting
            }

            res.json(body, response && response.statusCode);
            console.log(response);
        });
    },

    restartServer: function (req, res) {
        console.log('###########################################################');
        console.log('## Olympus restarted by Superadmin');
        console.log('###########################################################');
        var exec                = require('child_process').exec;
        var restartapp          = 'sudo pm2 restart app';
        var restartolympus       = 'sudo pm2 restart olympus';
        // console.log(cdapi);
        exec( restartapp , function(error, stdout, stderr) {
          // command output is in stdout
          console.log(error,'error');
          if(error){
            console.log(stderr);
            return res.json({ status: 'restarterror', 'message': stderr}, 200);
          }
          else{//app restarted, now restart olympus
            exec( restartolympus , function(error, stdout, stderr) {
              console.log(error,'error');
              if(error){
                console.log(stderr);
                return res.json({ status: 'restarterror', 'message': stderr}, 200);
              }
              else{
                console.log('Mounted/Unmounted Successfully.');
                return res.json({ status: 'ok'}, 200);
              }
            });
          }
        });
    },
    changeLdapSetting: function (req, res) {

        var ldap_enabled        = req.param('ldap_enabled');
        var service_type        = req.param('service_type');
        var server_ip           = req.param('server_ip');
        var org_unit            = req.param('org_unit');
        var basedn              = req.param('basedn');
        var ldap_admin          = req.param('ldap_admin');
        var ldap_pass           = req.param('ldap_pass');
        var ldap_create_user    = req.param('ldap_create_user');

        SiteSettings.find({where:{id:1}}).done(function (err, ldapopt) {
            if (err)
                res.json({success: false, error: err});

            if(ldapopt){
                // console.log(adapter);
                console.log('LDAP settings being updated.');
                //Set it as Active
                ldapopt.ldapOn          = ldap_enabled;
                ldapopt.ServiceType     = service_type;
                ldapopt.ldapServerIp    = server_ip;
                ldapopt.ldapOU          = org_unit;
                ldapopt.ldapBaseDN      = basedn;
                ldapopt.ldapAdmin       = ldap_admin;
                ldapopt.ldapPassword    = ldap_pass;
                ldapopt.ldapCreateUser  = ldap_create_user;

                ldapopt.save().done(function(err) {

                    if (err) return res.json({ error: err}, 200);
                    return res.json({ status: 'ok'}, 200);
                });
                        
            }else{
                console.log('LDAP settings being configured for the first time.');

                SiteSettings.create({

                    ldapOn          : ldap_enabled,
                    ServiceType     : service_type,
                    ldapServerIp    : server_ip,
                    ldapOU          : org_unit,
                    ldapBaseDN      : basedn,
                    ldapAdmin       : ldap_admin,
                    ldapPassword    : ldap_pass,
                    ldapCreateUser  : ldap_create_user

                }).done(function addedSettings (err, ldapopt) {

                    if (err) return res.json({ error: err}, 200);
                    return res.json({ status: 'ok'}, 200);
                });
            }
        });
    },

    testLdapSetting: function (req, res) {

        var ldap_enabled        = req.param('ldap_enabled');
        var service_type        = req.param('service_type');
        var server_ip           = req.param('server_ip');
        var org_unit            = req.param('org_unit');
        var basedn              = req.param('basedn');
        var ldap_admin          = req.param('ldap_admin');
        var ldap_pass           = req.param('ldap_pass');
        var ldap_create_user    = req.param('ldap_create_user');

        var d = require('domain').create();
        d.on('error', function(e) {
          err = e;
          console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
          console.log(e.code);
          res.json({success: false, error: {'name': e.code} } );
          // any additional error handling
        });
        d.run(function() { 
            var ldap = require('ldapjs');
            var assert = require('assert');

            var client = ldap.createClient({
              // url: 'ldap://192.207.61.16'
              url: 'ldap://'+server_ip,
              timeout: 4000
            });

            /*client.bind('cn=Manager,dc=server,dc=world', 'openldap', function(err) {
              console.log('--------------BINDING--------------');
              console.log(err);
              assert.ifError(err);
            });*/

            var adminname = ldap_admin;
            if(service_type == '1'){//ldap
                adminname = ldap_admin;
            }else if(service_type == '2'){//AD
                adminname = ldap_admin+'@'+basedn;
            }

            console.log('--------------Connecting LDAP--------------');

            client.bind(adminname, ldap_pass, function(err) {

                console.log('--------------BINDING--------------');

                if(err){ 
                    // console.log(err);
                    res.json({success: false, error: err});
                }else{
                    return res.json({ status: 'ok'}, 200);
                }
            });
        });
            
        /*SiteSettings.find({where:{id:1}}).done(function (err, ldapopt) {
            if (err)
                res.json({success: false, error: err});

            if(ldapopt){
                // console.log(adapter);
                console.log('LDAP settings being updated.');
                //Set it as Active
                ldapopt.ldapOn          = ldap_enabled;
                ldapopt.ServiceType     = service_type;
                ldapopt.ldapServerIp    = server_ip;
                ldapopt.ldapOU          = org_unit;
                ldapopt.ldapBaseDN      = basedn;
                ldapopt.ldapAdmin       = ldap_admin;
                ldapopt.ldapPassword    = ldap_pass;
                ldapopt.ldapCreateUser  = ldap_create_user;

                ldapopt.save().done(function(err) {

                    if (err) return res.json({ error: err}, 200);
                    return res.json({ status: 'ok'}, 200);
                });
                        
            }else{
                console.log('LDAP settings being configured for the first time.');

                SiteSettings.create({

                    ldapOn          : ldap_enabled,
                    ServiceType     : service_type,
                    ldapServerIp    : server_ip,
                    ldapOU          : org_unit,
                    ldapBaseDN      : basedn,
                    ldapAdmin       : ldap_admin,
                    ldapPassword    : ldap_pass,
                    ldapCreateUser  : ldap_create_user

                }).done(function addedSettings (err, ldapopt) {

                    if (err) return res.json({ error: err}, 200);
                    return res.json({ status: 'ok'}, 200);
                });
            }
        });*/
    },

    changeAdapterSetting: function (req, res) {

        var adapter_type = req.param('adapter_type');
        var diskpath = req.param('diskpath');
        var S3access = req.param('S3access');
        var S3secret = req.param('S3secret');
        var S3bucket = req.param('S3bucket');
        var S3region = req.param('S3region');

        var Ormucoaccess = req.param('Ormucoaccess');
        var Ormucosecret = req.param('Ormucosecret');
        var Ormucobucket = req.param('Ormucobucket');

        var MountEnabled            = req.param('mount_enabled');
        var MountPoint              = req.param('mountpoint');
        var MountUsername           = req.param('mount_username');
        var MountPassword           = req.param('mount_password');
        if(adapter_type == 'Disk' || adapter_type == 'S3' || adapter_type == 'Ormuco' ){

            var options;

            //Check existing adapters with same configuration
            if(adapter_type == 'Disk'){//CIFS details
                options = {
                    type: adapter_type,
                    path: diskpath,
                    // Do not check these attributes for existing adapters, only add later if Disk is found
                    // accessKeyId: MountUsername,
                    // secretAccessKey: MountPassword,
                    // bucket: MountPoint,
                    // region: MountEnabled?'on':null
                };
            }
            if(adapter_type == 'S3'){
                options = {
                    type: adapter_type,
                    accessKeyId: S3access,
                    secretAccessKey: S3secret,
                    bucket: S3bucket,
                    region: S3region
                };
            }
            if(adapter_type == 'Ormuco'){
                options = {
                    type: adapter_type,
                    accessKeyId: Ormucoaccess,
                    secretAccessKey: Ormucosecret,
                    bucket: Ormucobucket,
                    // region: ''
                };
            }

            //Find Adapter with same configuration
            UploadPaths.find({where:options}).done(function (err, adapter) {
                if (err)
                    res.json({success: false, error: err});

                if(adapter){
                    console.log('Adapter with same configuration found');
                    if(adapter.isActive){//if Adapter is Already Active
                        if(adapter_type == 'Disk'){//CIFS details
                            adapter.isActive        = true;
                            adapter.accessKeyId     = MountUsername;
                            adapter.secretAccessKey = MountPassword;
                            adapter.bucket          = MountPoint;
                            adapter.region          = MountEnabled?'on':null;
                            adapter.save().done(function(err) {
                                return res.json({ status: 'ok'}, 200);
                            });
                        }else{
                        //Do nothing
                        return res.json({ status: 'ok'}, 200);
                        }
                    }else{
                        //Find the current Active Adapter
                        UploadPaths.find({where:{isActive:1}}).done(function (err, adapterold) {
                            if (err)
                                res.json({success: false, error: err});

                            if(adapterold){
                                adapterold.isActive = false;
                                adapterold.save().done(function(err) {
                                    //Set it as Active
                                    adapter.isActive = true;
                                    if(adapter_type == 'Disk'){//CIFS details
                                        adapter.accessKeyId     = MountUsername;
                                        adapter.secretAccessKey = MountPassword;
                                        adapter.bucket          = MountPoint;
                                        adapter.region          = MountEnabled?'on':null;
                                    }
                                    adapter.save().done(function(err) {
                                        return res.json({ status: 'ok'}, 200);
                                    });
                                });
                            }
                        });
                    }
                }else{
                    console.log('New Adapter Being Added');

                    //Find the current Active Adapter
                    UploadPaths.find({where:{isActive:1}}).done(function (err, adapterold) {
                        if (err)
                            res.json({success: false, error: err});

                        if(adapterold){
                            adapterold.isActive = false;
                            adapterold.save().done(function(err) {
                                UploadPaths.create({

                                    type            : adapter_type,
                                    path            : (adapter_type == 'Disk')?diskpath:null,
                                    accessKeyId     : (adapter_type == 'Disk')?MountUsername:(adapter_type == 'S3')?S3access:((adapter_type == 'Ormuco')?Ormucoaccess:null),
                                    secretAccessKey : (adapter_type == 'Disk')?MountPassword:(adapter_type == 'S3')?S3secret:((adapter_type == 'Ormuco')?Ormucosecret:null),
                                    bucket          : (adapter_type == 'Disk')?MountPoint:(adapter_type == 'S3')?S3bucket:((adapter_type == 'Ormuco')?Ormucobucket:null),
                                    region          : (adapter_type == 'Disk')?(MountEnabled?'on':null):(adapter_type == 'S3')?S3region:null,
                                    isActive        : 1

                                }).done(function foundAdapter (err, uploadpath) {

                                    if (err) return res.json({ error: err}, 200);
                                    // console.log(uploadpath);
                                    return res.json({ status: 'ok'}, 200);
                                });
                        });
                            // res.json({success: true, adapter:adapter});
                        }else{//null
                            console.log('noadapterfoundnoadapterfoundnoadapterfound')
                            return res.json({ error: 'noadapterfound'}, 200);
                        }
                    });
                }
            });
        }
    },
    testCIFSmount: function(req, res) {
        var formaction              = req.param('formaction');
        var MountEnabled            = req.param('mount_enabled');
        var MountPoint              = req.param('mountpoint');
        var MountUsername           = req.param('mount_username');
        var MountPassword           = req.param('mount_password');
        console.log(MountEnabled, MountPoint, MountUsername, MountPassword);
        console.log('MountEnabled, MountPoint, MountUsername, MountPassword');
        // mount -t cifs -o username=Administrator,password="%h=o-3J)iX" //54.158.126.129/pzashare /var/www/html/olympus/api/files
        // load the library
        var exec = require('child_process').exec;
        // var cmd = 'prince -v builds/pdf/book.html -o builds/pdf/book.pdf';
        // var checkmount = 'if grep -qs '/mnt/foo' /proc/mounts; then';
        // var cmdmount = 'mount -t cifs -o username=panzura,password="panzura" //159.203.102.228/ishare /var/www/html/olympus/api/files';
        // var cmdmount = 'sudo mount -t cifs -o username='+MountUsername+',password="'+MountPassword+'" //'+MountPoint+' '+sails.config.appPath + '/../api/files/';
        var cmdmount = 'sudo mount -t cifs -o username='+MountUsername+',password="'+MountPassword+'" //'+MountPoint.replace(/^(\/\/)/,"") + ' ' + ' /var/www/html/olympus/api/files/';
        var cmdunmount = 'sudo umount -a -t cifs -l';
        // console.log('cmdmount: ', cmdmount);
        exec( (formaction == 'mount' ? cmdmount : cmdunmount ), function(error, stdout, stderr) {
          // command output is in stdout
          console.log(error,'error');
          if(error){
            //if(error.code == '32'){
                console.log(stderr);
                return res.json({ status: 'mounterror', 'message': stderr}, 200);
            //}else{
            //    console.log('Did not Mount: ', error);
            //    return res.json({ status: 'nomount'}, 200);
            //}
          }
          else{
            console.log('Mounted/Unmounted Successfully.');
            return res.json({ status: 'ok'}, 200);
          }
        });
    },
    saveTrashSetting: function (req, res) {
console.log('999999999999999999999999999999999999');
    var trash_setting;
    var trash_setting_days;

    console.log(req.params);
    console.log(req.param);

        var request = require('request');
        /*Create logging*/
        var opts = {
            uri: 'http://localhost:1337/account/changeDomainname/',
            method: 'POST',
        };

        opts.json = {
            trash_setting   : req.param('trash_setting'),
            days            : req.param('trash_setting_days')
        };
console.log(opts);
        request(opts, function (err, response, body) {

            if (err){
                console.log(err);
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
            }

            res.json(body, response && response.statusCode);
            // console.log(response);
        });
    },

    changeOtherSettings: function (req, res) {

    // console.log(req.params);
    // console.log(req.param('msignup_setting'));
    var msignup_setting = req.param('msignup_setting');

        SiteOptions.find({where:{id:1}}).done(function (err, otheropt) {
            if (err)
                res.json({success: false, error: err});

            if(otheropt){
                // console.log(adapter);
                console.log('Other settings being updated.');
                //Set it as Active
                otheropt.allowSignupfromMobile          = msignup_setting;

                otheropt.save().done(function(err) {

                    if (err) return res.json({ error: err}, 200);
                    return res.json({ status: 'ok'}, 200);
                });
                        
            }else{
                console.log('Other settings being configured for the first time.');

                SiteOptions.create({

                    allowSignupfromMobile          : msignup_setting

                }).done(function addedSettings (err, otheropt) {

                    if (err) return res.json({ error: err}, 200);
                    return res.json({ status: 'ok'}, 200);
                });
            }
        });
    },

    getNestedWorkgroups: function (req, res) {
        Directory.findAll({
            where: [' deleted != 1 AND DirectoryId = ' + dir.id],
        }).success(function (subdir) {
            console.log(subdir);
            console.log();
        });
    },
    /*
     This function is used get the list of all workgroups of any individual users
     */
    listUserWorkgroup: function (req, res) {
        var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dp.AccountId =?";
        sql = Sequelize.Utils.format([sql, req.param('id')]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (directory) {
            res.json(directory, 200);
        }).error(function (e) {
            throw new Error(e);
        });
    },
    updateUserData: function (req, res) {

        var request = require('request');
        // Look up Account for currently logged-in user
        Account.find(req.param('id')).done(function (err, account) {

            if (err)
                return res.send(err, 500);
            // Save new data in app and session db
            if (req.param('email'))
                account.email = req.param('email');
            if (req.param('name'))
                account.name = req.param('name');
            if (req.param('phone'))
                account.phone = req.param('phone');
            if (req.param('title'))
                account.title = req.param('title');
            if(req.param('subscription_id') && (account.subscription_id == req.param('subscription_id'))) {
                account.subscription_id = req.param('subscription_id');
            }else{
                Subscription.find({
                    where: [' id = ' + req.param('subscription_id')],
                }).success(function (subscription) {
                    // Save to transactionDetails table
                    var tran_options = {
                        uri: 'http://localhost:1337/transactiondetails/register/',
                        method: 'POST',
                    };

                    var created_date = new Date();
                    tran_options.json = {
                        trans_id: (req.session.Account.isSuperAdmin === 1) ? 'superadmin' : 'workgroupadmin',
                        account_id: account.id,
                        created_date: created_date,
                        users_limit: subscription.users_limit,
                        quota: subscription.quota,
                        plan_name: subscription.features,
                        plan_id         : subscription.id,
                        price: subscription.price,
                        duration: subscription.duration,
                        paypal_status: '',
                    };

                    request(tran_options, function (err1, response1, body1) {
                        if (err1)
                              console.log(err1);
                        //    return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);
                        //        Resend using the original response statusCode
                        //        use the json parsing above as a simple check we got back good stuff
                        // res.json(body, response && response.statusCode);

                        return;
                    });
                });
                account.subscription_id = req.param('subscription_id');
            }
            // Save the Account, returning a 200 response
            account.save().done(function (err) {

                if (err)
                    return res.send(err);

                /*Create logging*/
                var options = {
                    uri: 'http://localhost:1337/logging/register/',
                    method: 'POST',
                };

                options.json = {
                    user_id: req.session.Account.id,
                    text_message: 'has updated a user.',
                    activity: 'update',
                    	on_user: req.params.id,
                   // ip: req.session.Account.ip
			ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,

                };

                request(options, function (err, response, body) {
                    if (err)
                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    res.json({msg: 'User information updated successfully.', type: 'success'}, 200);
                });
                /*Create logging*/
            });
        });
    },
    /* @By Alcanzar */

    lockAccount: function (req, res) {

        var request = require('request');
        var options = {
            uri: 'http://localhost:1337/account/lock/',
            method: 'POST',
        };

        options.json = {
            id: req.params.id,
            lock: req.params.lock,
        };

        request(options, function (err, response, body) {
            if (err)
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
            //	Resend using the original response statusCode
            //	Use the json parsing above as a simple check we got back good stuff
            res.json(body, response && response.statusCode);
        });
    },
    delAccount: function (req, res) {

        var request = require('request');
        var options = {
            uri: 'http://localhost:1337/account/del/',
            method: 'POST',
        };

        options.json = {
            id: req.param('id'),
            accId: req.session.Account.id, //for logging
            accName: req.session.Account.name, //for logging
            ipadd: req.param('ipadd'),
//            ip: req.session.Account.ip
		ip: req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,

        };

        request(options, function (err, response, body) {
            if (err)
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
//	Resend using the original response statusCode
//	Use the json parsing above as a simple check we got back good stuff
            res.json(body, response && response.statusCode);
        });

    },
    deletePermission: function (req, res) {

        var request = require('request');

        //console.log(req);

        var sql = "SELECT id, DirectoryId, name FROM directory WHERE DirectoryId =? or id =? UNION ALL SELECT id, DirectoryId, name FROM directory WHERE FIND_IN_SET( DirectoryId, ( SELECT GROUP_CONCAT( id ) FROM directory WHERE DirectoryId =? ) )";
        sql = Sequelize.Utils.format([sql, req.param('workgroup_id'), req.param('workgroup_id'), req.param('workgroup_id')]);

        console.log(sql);

        sequelize.query(sql, null, {
            raw: true
        }).success(function (directorys) {
            if (directorys != null) {
                directorys.forEach(function (diry) {


                    var sql = "SELECT id, DirectoryId, name FROM directory WHERE DirectoryId =? or id =? UNION ALL SELECT id, DirectoryId, name FROM directory WHERE FIND_IN_SET( DirectoryId, ( SELECT GROUP_CONCAT( id ) FROM directory WHERE DirectoryId =? ) )";
                    sql = Sequelize.Utils.format([sql, diry.id, diry.id, diry.id]);

                    console.log(sql);

                    sequelize.query(sql, null, {
                        raw: true
                    }).success(function (directorys) {
                        if (directorys != null) {
                            directorys.forEach(function (diry) {


                                console.log(' DirectoryId : ' + diry.id + ' Account Id ' + req.param('user_id'));

                                var sql = "Delete FROM directorypermission where AccountId =? and DirectoryId = ?";
                                sql = Sequelize.Utils.format([sql, req.param('user_id'), diry.id]);

                                sequelize.query(sql, null, {
                                    raw: true
                                }).success(function (dirs) {

                                    /*Create logging*/
                                    var options = {
                                        uri: 'http://localhost:1337/logging/register/',
                                        method: 'POST',
                                    };

                                    options.json = {
                                        user_id: req.session.Account.id,
                                        text_message: 'has deleted ' + req.param('workgroup_name') + ' from ' + req.param('user_name') + '\'s account.',
                                        activity: 'delete',
                                        on_user: req.param('user_id'),
                                        id: req.session.Account.ip
                                    };

                                    request(options, function (err, response, body) {
                                        if (err)
                                            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                                    });

                                    /*Create logging*/

                                    File.findAll({
                                        where: ['DirectoryId=' + req.param('workgroup_id')],
                                    }).success(function (files) {
                                        if (files != null) {

                                            files.forEach(function (applicant) {

                                                var sql3 = "Delete FROM filepermission where FileId = ? and AccountId =?";
                                                sql3 = Sequelize.Utils.format([sql3, applicant.id, req.param('user_id')]);

                                                sequelize.query(sql3, null, {
                                                    raw: true
                                                }).success(function (dirs) {

                                                    /*Create logging*/
                                                    var options = {
                                                        uri: 'http://localhost:1337/logging/register/',
                                                        method: 'POST',
                                                    };

                                                    options.json = {
                                                        user_id: req.session.Account.id,
                                                        text_message: req.session.Account.name + ' has deleted file' + applicant.name + ' located in ' + req.param('workgroup_name') + ' from ' + req.param('user_name') + '\'s account.',
                                                        activity: 'delete',
                                                        on_user: req.param('user_id'),
                                                       // ip: req.session.Account.ip
							ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,

                                                    };

                                                    request(options, function (err, response, body) {
                                                        if (err)
                                                            return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                                                        res.json(body, response && response.statusCode);
                                                    });
                                                    /*Create logging*/
                                                });
                                            });
                                        }
                                    }).error(function (e) {
                                        throw new Error(e);
                                    });
                                });





                            });
                        }
                        res.json(directorys, 200);
                    }).error(function (e) {
                        throw new Error(e);
                    });



                });
            }
            res.json(directorys, 200);
        }).error(function (e) {
            throw new Error(e);
        });


    },
    /**
     * Change user password
     * @param {} oldPrometheus => old password
     * @param {} prometheus => new password
     */
    changePassword: function (req, res) {

        var request = require('request');

        var newPassword = req.param('prometheus');
        var oldPassword = req.param('oldPrometheus');
        console.log('newPassword / prometheus :: ', newPassword);
        console.log('oldPassword / oldPrometheus :: ', oldPassword);
// Look up Account for currently logged-in user
        Account.find(req.session.Account.id).done(function (err, model) {

            if (err)
                return res.send(err, 500);
            if (!AuthenticationService.checkPassword(oldPassword, model.password))
                return res.send(500);
// Save new password
            model.password = AuthenticationService.hashPassword(newPassword);
            console.log('Saving account :: ', model);

            model.save().done(function (err) {

                if (err)
                    return res.send(err, 500);
                console.log('Saved account :: ', model);

                /*Create logging*/
                var options = {
                    uri: 'http://localhost:1337/logging/register/',
                    method: 'POST',
                };

                options.json = {
                    user_id: req.session.Account.id,
                    text_message: 'has changed own password.',
                    activity: 'change',
                    on_user: req.session.Account.id,
//                    ip: req.session.Account.ip
		ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,

                };

                request(options, function (err, response, body) {
                    if (err)
                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    res.send(200);
                });
                /*End logging*/
            });
        });
    },
    updateUserPassword: function (req, res) {

        var request = require('request');
        var newPassword = req.param('oldPrometheus');
// Look up Account for currently logged-in user
        Account.find(req.param('id')).done(function (err, model) {
            if (err)
                return res.send(err, 500);
            // Save new password
            model.password = AuthenticationService.hashPassword(newPassword);
            model.save().done(function (err) {

                if (err)
                    return res.send(err, 500);
                /*Create logging*/
                var options = {
                    uri: 'http://localhost:1337/logging/register/',
                    method: 'POST',
                };

                options.json = {
                    user_id: req.session.Account.id,
                    text_message: 'has changed ' + model.name + '\'s password.',
                    activity: 'change',
                    on_user: req.param('id'),
                   ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                };

                request(options, function (err, response, body) {
                    if (err)
                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    res.json({msg: 'Password updated succcessfully.', type: 'success'}, 200);
                });
                /*End logging*/

            });
        });
    },
    update: function (req, res) {

        var request = require('request');

// Look up Account for currently logged-in user
        Account.find(req.session.Account.id).done(function (err, model) {
            if (err)
                return res.send(err, 500);
            // Save new data in app and session db
            model.name = req.session.Account.name = (req.param('name') || model.name);
            model.email = req.session.Account.email = (req.param('email') || model.email);
            model.title = req.session.Account.title = (req.param('title') || model.title);
            model.phone = req.session.Account.phone = (req.param('phone') || model.phone);
            req.session.save();

            model.save().done(function (err) {
                if (err)
                    return res.send(err);

                /*Create logging*/
                var options = {
                    uri: 'http://localhost:1337/logging/register/',
                    method: 'POST',
                };

                options.json = {
                    user_id: req.session.Account.id,
                    text_message: 'has updated own account.',
                    activity: 'update',
                    on_user: req.session.Account.id,
//                    ip: req.session.Account.ip
		              ip: typeof req.session.Account.ip === 'undefined' ? req.headers['ip'] : req.session.Account.ip,
                };

                request(options, function (err, response, body) {
                    if (err)
                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                    res.send(200);
                });
                /*End logging*/

            });
        });
    },
    avatar: cacheRoute(60 * 60)(function (req, res) {
        var id = req.param('id') || (req.session.Account && req.session.Account.id);
        // Get the account model
        Account.find(id).success(function (account) {
            // If we found an account with a valid avatar, serve it
            if (account && account.avatar_fname) {
                // Download and serve file
                res.setHeader('Content-Type', account.avatar_mimetype);
                FileAdapter.download({
                    name: account.avatar_fname
                }, function (err, data, contentLength, stream) {
                    if (err)
                        return res.send(err, 500);

                    // No data available
                    if (!data && !stream) {
                        res.send(404);
                    }
                    // Stream file (Swift)
                    else if (!data && !stream) {
                        stream.pipe(res);
                    }
                    // Or dump data (S3)
                    else {
                        res.send(data);
                    }
                });
            }
            // Otherwise serve up the anonymous avatar image
            else {
                res.setHeader('Content-Type', 'image/png');
                fs.readFile(__dirname + '/../../public/images/avatar_anonymous.png', function (err, data) {
                    if (err)
                        return res.send(err, 500);
                    res.send(data);
                });
            }
        });
    }),

    imageUpload: function (req, res) {

 
        binaryData = req.param('binary');
        var filefname = req.param('name');
        var filetype = req.param('type');
        var fsName = UUIDGenerator.v1();
        var picUploadType = req.param('pic_type');

        if(typeof req.session.Account !== 'undefined'){
            Account.find(req.session.Account.id).done(function (err, account) {

                if (err)
                    return res.send(err, 500);
                if (account) {
                    
                    var enterpriseName = fsName + '.png';
                    var base64Data = binaryData.replace(/^data:image\/(png|gif|jpeg);base64,/, "");
                    base64Data += base64Data.replace('+', ' ');
                    binaryData = new Buffer(base64Data, 'base64').toString('binary');

                        async.auto({
                            getAdapter: function(cb) {

                                UploadPaths.find({where:{isActive:1}}).done(cb);
                            },
                            showForm: ['getAdapter', function(cb, up) {
                                // console.log('asyncResultsasyncResultsasyncResultsasyncResultsasyncResults');
                                console.log(up.getAdapter);
                                adapter = up.getAdapter.type;

                                if(adapter == "Disk"){
                                    if (picUploadType === 'enterprise') {

                                        // fsx.writeFile(sails.config.fileAdapter.linuxPath+"master/public/images/enterprises/" + enterpriseName, binaryData, 'binary', function (err) {
                                        // });
                                        fsx.writeFile(sails.config.appPath + "/public/images/enterprises/" + enterpriseName, binaryData, 'binary', function (err) {
                                        });
                                        account.enterprise_fsname = enterpriseName;
                                        account.enterprise_mimetype = filetype;
                                        account.enpUploadPathId = up.getAdapter.id; 

                                    } else if (picUploadType === 'profile') {
                                     
                                        fsx.writeFile(sails.config.appPath + "/public/images/profile/" + enterpriseName, binaryData, 'binary', function (err) {
                                        });

                                        account.avatar_image = enterpriseName;
                                        account.avatarUploadPathId = up.getAdapter.id; 
                                    }

                                    account.save().done(function (err) {

                                        console.log('DiskCallbackDiskCallbackDiskCallbackDiskCallback');
                                        if (err)
                                            return res.end(err);
                                    });
                                }else if(adapter == "S3"){
                                    if (picUploadType === 'enterprise') {

                                        // fsx.writeFile(sails.config.fileAdapter.linuxPath+"master/public/images/enterprises/" + enterpriseName, binaryData, 'binary', function (err) {
                                        // });
                                        fsx.writeFile(sails.config.appPath + "/public/images/enterprises/" + enterpriseName, binaryData, 'binary', function (err) {

                                            console.log('TESTINTESTINTESTINTESTINTESTINTESTIN5555555555');

                                            S3APIService.uploadLogo({
                                                name: enterpriseName,
                                                ContentLength: binaryData.contentLength,
                                                payload: binaryData,
                                                receiverinfo: up.getAdapter
                                            }, function (err, data, contentLength, stream) {

                                                console.log('TESTINTESTINTESTINTESTINTESTINTESTIN777777');
                                                console.log(err);
                                                console.log(data);
                                                console.log(contentLength);
                                                console.log(stream);
                                            });

                                            account.enterprise_fsname = enterpriseName;
                                            account.enterprise_mimetype = filetype;
                                            account.enpUploadPathId = up.getAdapter.id; 

                                            account.save().done(function (err) {

                                                console.log('S3callbackS3callbackS3callbackS3callback');
                                                if (err)
                                                    return res.end(err);
                                            });
                                        });

                                    } else if (picUploadType === 'profile') {
                                     
                                        fsx.writeFile(sails.config.appPath + "/public/images/profile/" + enterpriseName, binaryData, 'binary', function (err) {

                                           console.log('TESTINTESTINTESTINTESTINTESTINTESTIN4444444444');
                                        
                                            S3APIService.uploadProfile({
                                                name: enterpriseName,
                                                ContentLength: binaryData.contentLength,
                                                payload: binaryData,
                                                receiverinfo: up.getAdapter
                                            }, function (err, data, contentLength, stream) {

                                                console.log('TESTINTESTINTESTINTESTINTESTINTESTIN777777');
                                                console.log(err);
                                                console.log(data);
                                                console.log(contentLength);
                                                console.log(stream);
                                            });

                                            account.avatar_image = enterpriseName; 
                                            account.avatarUploadPathId = up.getAdapter.id; 

                                            account.save().done(function (err) {

                                                console.log('S3callbackS3callbackS3callbackS3callback');
                                                if (err)
                                                    return res.end(err);
                                            });

                                        });
                                    }
                                }else if(adapter == "Ormuco"){
                                    if (picUploadType === 'enterprise') {

                                        // fsx.writeFile(sails.config.fileAdapter.linuxPath+"master/public/images/enterprises/" + enterpriseName, binaryData, 'binary', function (err) {
                                        // });
                                        fsx.writeFile(sails.config.appPath + "/public/images/enterprises/" + enterpriseName, binaryData, 'binary', function (err) {

                                            console.log('TESTINTESTINTESTINTESTINTESTINTESTIN5555555555');

                                            OrmucoAPIService.uploadLogo({
                                                name: enterpriseName,
                                                ContentLength: binaryData.contentLength,
                                                payload: binaryData,
                                                receiverinfo: up.getAdapter
                                            }, function (err, data, contentLength, stream) {

                                                console.log('TESTINTESTINTESTINTESTINTESTINTESTIN777777');
                                                console.log(err);
                                                console.log(data);
                                                console.log(contentLength);
                                                console.log(stream);
                                            });

                                            account.enterprise_fsname = enterpriseName;
                                            account.enterprise_mimetype = filetype;
                                            account.enpUploadPathId = up.getAdapter.id; 

                                            account.save().done(function (err) {

                                                console.log('S3callbackS3callbackS3callbackS3callback');
                                                if (err)
                                                    return res.end(err);
                                            });
                                        });

                                    } else if (picUploadType === 'profile') {
                                     
                                        fsx.writeFile(sails.config.appPath + "/public/images/profile/" + enterpriseName, binaryData, 'binary', function (err) {

                                           console.log('TESTINTESTINTESTINTESTINTESTINTESTIN4444444444');
                                        
                                            OrmucoAPIService.uploadProfile({
                                                name: enterpriseName,
                                                ContentLength: binaryData.contentLength,
                                                payload: binaryData,
                                                receiverinfo: up.getAdapter
                                            }, function (err, data, contentLength, stream) {

                                                console.log('TESTINTESTINTESTINTESTINTESTINTESTIN777777');
                                                console.log(err);
                                                console.log(data);
                                                console.log(contentLength);
                                                console.log(stream);
                                            });

                                            account.avatar_image = enterpriseName; 
                                            account.avatarUploadPathId = up.getAdapter.id; 

                                            account.save().done(function (err) {

                                                console.log('S3callbackS3callbackS3callbackS3callback');
                                                if (err)
                                                    return res.end(err);
                                            });

                                        });
                                    }
                                }
                            }]
                        });
                }

            });
        }else{
            return res.send(403);
        }

    },
    /*****************************************************************************************
     Post Registration csv Data
     @Auth : Avneesh
     ********************************************************************************************/

    readCSVFile: function (req, res) {

        var users = req.param('users');
        console.log('usersusersusersusersusersusersusersusersusers');
        console.log(users);
        // var filename = 'testinnnn.csv';
        // var base64Data = binaryData.replace(/^data:image\/(png|gif|jpeg);base64,/, "");
        // base64Data += base64Data.replace('+', ' ');
        // binaryData = new Buffer(base64Data, 'base64').toString('binary');

        // fsx.writeFile(sails.config.appPath + "/public/" + filename, filedata, 'binary', function (err) {
        // });

        var sql = "SELECT subscription_id FROM account WHERE id=?";
        sql = Sequelize.Utils.format([sql, req.session.Account.id]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (account) {


            var sql = "SELECT id FROM directory WHERE OwnerId=?";
            sql = Sequelize.Utils.format([sql, req.session.Account.id]);
            sequelize.query(sql, null, {
                raw: true
            }).success(function (directory) {

                var i = 0;
                var request = require('request');
                console.log(req.params.filepath);

                // var uploadStream = req.file(req.params.filepath);
                // var stream = fsx.createReadStream(sails.config.appPath + '/public/Testdata1.csv');

                // fsx.readFile(req.params.filepath, function (err, stream) {
                    // ...
                    // console.log(stream);
                    // console.log(err);
                    // console.log('data receiveddata receiveddata receiveddata receiveddata received');
                    // var newPath = __dirname + "/uploads/uploadedFileName";
                    // fs.writeFile(newPath, data, function (err) {
                    //   res.redirect("back");
                    // });
                

                    // var stream = fsx.createReadStream(uploadStream);
    		
                    // csv.fromStream(stream).on("data", function (data) {

                        var responseData = new Array();
                        // console.log(data[2]);
                        for (i = 0; i < users.length; i++) {
                            console.log('checking user ' + users[i]);
                            data = users[i];

                                // if (i != 0) {

                                var options = {
                                    uri: 'http://localhost:1337/account/register/',
                                    method: 'POST',
                                };

                                    options.json = {
                                        name: data[0] + ' ' + data[1],
                                        email: data[2],
                                        isVerified: true,
                                        isAdmin: false,
                                        password: data[3],
                                        created_by: req.session.Account.id,
                                        workgroup: req.param('workgroup'),//directory[0]['id'],
                                        title: data[3],
                                        subscription: account[0]['subscription_id'],
                                        //req.param('role')//
                                    };

                                    request(options, function (err, response, body) {
                                        


                                        if(err || body.error){
                                            if (err)
                                                // return res.json({error: err.message, type: 'error'}, response && response.statusCode);
                                                responseData.push({error: err.message, type: 'error'});
                                                if(users.length == responseData.length){
                                                    console.log('ResponseSentResponseSentResponseSentResponseSent');
                                                    return res.json({body: responseData, type: 'success'},200);
                                                }else{
                                                    console.log(responseData.length+' out of '+ users.length +' account done.');
                                                }
                                            if (body.error)
                                                // return res.json({error: body.error, type: 'error'}, response && response.statusCode);
                                                responseData.push({body: body, error: body.error, type: 'error'});
                                                if(users.length == responseData.length){
                                                    console.log('ResponseSentResponseSentResponseSentResponseSent');
                                                    return res.json({body: responseData, type: 'success'},200);
                                                }else{
                                                    console.log(responseData.length+' out of '+ users.length +' account done.');
                                                }
                                        }else{


                                            // req.param('workgroup')
                                            // req.param('role')

                                            // INodeService.addPermission;

                                            var options = {
                                                uri: 'http://localhost:1337/adminuser/register/' ,
                                                method: 'POST',
                                            };

                                            options.json =  {
                                                user_id             : body.account.id,
                                                admin_profile_id    : '2',
                                                email_msg :         (res.email_msg == 'email_exits') ?'email_exits':' ',
                                            };

                                            request(options, function(err, response, body) {
                                                console.log('START adminuser/register');
                                                console.log(body);
                                                if(err) console.log(err.message);
                                                console.log('END adminuser/register');
                                                // if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
                                    //  Resend using the original response statusCode
                                    //  use the json parsing above as a simple check we got back good stuff
                                                // res.json(body, response && response.statusCode);
                                            });



                                    //	      Resend using the original response statusCode
                                    //	      use the json parsing above as a simple check we got back good stuff

                                    Subscription.find({
                                        where: {id: '1'}
                                    }).done(function (err, subscription) {

                                        // Save to transactionDetails table
                                        var tran_options = {
                                            uri: 'http://localhost:1337/transactiondetails/register/',
                                            method: 'POST',
                                        };

                                        var created_date = new Date();
                                        tran_options.json = {
                                            trans_id: (req.session.Account.isSuperAdmin === 1) ? 'superadmin' : 'workgroupadmin',
                                            account_id: body.account.id,
                                            created_date: created_date,
                                            users_limit: subscription.users_limit,
                                            quota: subscription.quota,
                                            plan_name: subscription.features,
                                            plan_id         : subscription.id,
                                            price: subscription.price,
                                            duration: subscription.duration,
                                            paypal_status: '',
                                        };

                                                request(tran_options, function (err1, response1, body1) {
                                                    if(typeof req.params == 'undefined'){
                                                        req.params = new Array();
                                                    }
                                                    if(req.param('workgroup')){//assigns permisssion for workgroup if selected
                                                        req.params.id = req.param('workgroup');
                                                        req.params.owned_by = {id: body.account.id};
                                                        req.params.permission = req.param('role')?req.param('role'):'comment';

                                                        AccountController.assignPermission(req, res, function (err, resp) {
                                                            // res.json(body, response && response.statusCode);
                                                        });
                                                    }
                                                    if (err1){
                                                        // return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);
                                                        responseData.push({error: err1.message, type: 'error'});
                                                        if(users.length == responseData.length){
                                                            console.log('ResponseSentResponseSentResponseSentResponseSent');
                                                            return res.json({body: responseData, type: 'success'},200);
                                                        }else{
                                                            console.log(responseData.length+' out of '+ users.length +' account done.');
                                                        }
                                                    }else{
                                                        // return res.json({body: body.account, type: 'success'}, response1 && response1.statusCode);
                                                        responseData.push({body: body.account, type: 'success'});
                                                        if(users.length == responseData.length){
                                                            console.log('ResponseSentResponseSentResponseSentResponseSent');
                                                            return res.json({body: responseData, type: 'success'},200);
                                                        }else{
                                                            console.log(responseData.length+' out of '+ users.length +' account done.');
                                                        }
                                                    }
                                                });

                                            });
                                        }
                                    });
                                // }
                                // i++;
                        }

                    // })
                    // .on("end", function (count) {
                    //     console.log('Number of lines: ' + count - 1);
                    // })
                    // .on('error', function (error) {
                    //     console.log(error.message);
                    // });
                // });//fsx.readfile end

            });
        });
    },
    assignPermission: INodeService.addPermission,
    /*****************************************************************************************
     Post Registration CSV Data
     @Auth : Avneesh
     ********************************************************************************************/

    getImage: function (req, res) {
        Account.find(req.session.Account.id).done(function (err, account) {
            if (err)
                res.json({success: false, error: err});
            res.json({success: true, avatar: account.avatar_image, enterprise: account.is_enterprise, id:req.session.Account.id});
        });
    },
    delOwnAccount: function (req, res) {

        var request = require('request');
        var sql = "Select id from directory where deleted is null and ownerId = ?";
        sql = Sequelize.Utils.format([sql, req.params.id]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (dirs) {
            console.log(dirs);
        });

        var options = {
            uri: 'http://localhost:1337/account/del/',
            method: 'POST',
        };

        options.json = {
            id: req.params.id,
            accId: req.session.Account.id, //for logging
            accName: req.session.Account.name, //for logging
        };

        request(options, function (err, response, body) {
            if (err)
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
            if (req.session.Account.isAdmin === true) {
                var sql = "UPDATE enterprises SET is_active=0 where account_id = ?";
                sql = Sequelize.Utils.format([sql, req.params.id]);
                sequelize.query(sql, null, {
                    raw: true
                }).success(function (dirs) {
                    res.json(body, response && response.statusCode);
                });
            } else {
                res.json(body, response && response.statusCode);
            }

            // var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dp.AccountId =?";
            // sql = Sequelize.Utils.format([sql, req.param('id')]);
            // sequelize.query(sql, null, {
            //     raw: true
            // }).success(function (directorys) {
            //     if (directorys != null) {
            //         directorys.forEach(function (diry) {
            //             var sql = "Delete FROM directorypermission where DirectoryId = ?";
            //             sql = Sequelize.Utils.format([sql, diry.id]);
            //             sequelize.query(sql, null, {
            //                 raw: true
            //             }).success(function (dirs) {
            //                 console.log("Delete permission of id ------------" + diry.id);


            //                 var sql = "SELECT * FROM file where DirectoryId =?";
            //                 sql = Sequelize.Utils.format([sql, diry.id]);
            //                 sequelize.query(sql, null, {
            //                     raw: true
            //                 }).success(function (files) {
            //                     if (files != null) {
            //                         var dt = new Date();
            //                         var datetime = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

            //                         files.forEach(function (file) {
            //                             var deleted = "Deleted" + file.fsName;
            //                             var sql = "UPDATE file SET deleted='1', deleteDate='" + datetime + "',fsName='" + deleted + "' where id = ?";
            //                             console.log(sql);
            //                             sql = Sequelize.Utils.format([sql, file.id]);
            //                             sequelize.query(sql, null, {
            //                                 raw: true
            //                             }).success(function (fls) {
            //                                 console.log("Delete file of id : " + file.id);
            //                             });
            //                         });
            //                     }
            //                     res.json(directorys, 200);
            //                 }).error(function (e) {
            //                     throw new Error(e);
            //                 });


            //             });
            //         });
            //     }
            //     res.json(directorys, 200);
            // }).error(function (e) {
            //     throw new Error(e);
            // });
        });
    },
    'delete' : INodeService["delete"],
    /*
     This fucntion is called from the #addEnterprise and #reports to check 
     if email exist
     */

    checkEmail: function (req, res) {
        Account.find({
            where: ['deleted != 1 AND email ="' + req.param('email') + '"'],
        }).success(function (account) {
            if (account === null) {
                return res.json({msg: "no_record", type: "success"});
            } else {
                return res.json({msg: "email_exists", type: "success"});
            }
        });
    },
    exportDatabase: function (req, res) {
        console.log('exportingDBexportingDBexportingDBexportingDBexportingDBexportingDB');

        // var mysqlDump = require('mysqldump');
        // res.setHeader('Content-disposition', 'attachment; filename=\"' + 'data.sql' + '\"');
        // res.setHeader('Content-Type', 'application/octet-stream');

        // res.writeHead(200, {'Content-Type': 'application/octet-stream'});

        // res.write('<br/><strong>&nbsp;&nbsp;&nbsp;&nbsp;Hello World!</strong>');
        var proxyReq_temp = fsx.createReadStream( sails.config.appPath  + '/public/images/profile/data.sql' );
        // var proxyReq = proxyReq_temp.pipe(res);
        // res.attachment('data.sql');
        // res.end(proxyReq_temp, 'UTF-8');
        res.sendfile(sails.config.appPath  + '/public/images/profile/data.sql');
        // res.send(proxyReq_temp);

        // var proxyReq_temp = fsx.createReadStream( sails.config.appPath  + '/public/images/profile/data.sql' );
        // var proxyReq = proxyReq_temp.pipe(res);
        // create data.sql file; 
    
        // console.log(sails);
        /*mysqlDump({
            host: sails.config.datasource.host,
            user: sails.config.datasource.username,
            password: sails.config.datasource.password,
            database: sails.config.datasource.database,
            // tables:['players'], // only these tables 
            // where: {'players': 'id < 1000'}, // Only test players with id < 1000 
            // ifNotExist:true,
            dest: sails.config.appPath + '/public/images/profile/data.sql' // destination file
        },function(err){
            console.log('Database Exported ||||||||||||||||||||||||||||||||||||||||||||');

            // res.writeHead(200, {'Content-Type': 'application/octet-stream'});

            // res.write('<br/><strong>&nbsp;&nbsp;&nbsp;&nbsp;Hello World!</strong>');
            var proxyReq_temp = fsx.createReadStream( sails.config.appPath  + '/public/images/profile/data.sql' );
            // var proxyReq = proxyReq_temp.pipe(res);
            // res.attachment('data.sql');
            // res.end(proxyReq_temp, 'UTF-8');
            res.sendFile(sails.config.appPath  + '/public/images/profile/data.sql');
            // res.send(proxyReq_temp);

            // var proxyReq_temp = fsx.createReadStream( sails.config.appPath  + '/public/images/profile/data.sql' );
            // var proxyReq = proxyReq_temp.pipe(res);
            // create data.sql file; 
        });*/
    },
};
_.extend(exports, AccountController);
