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
            ip: req.session.Account.ip,
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

        if (req.session.Account.isSuperAdmin === 1) {

            if (req.params.from_page == '#enterprises') {
                Account.findAll({
                    where: ['deleted = 0 AND is_enterprise=1 AND (email LIKE ? OR name LIKE ?)', "%" + req.params.term + "%", "%" + req.params.term + "%"],
                    limit: 20
                }).success(function (accounts) {
                    res.json(accounts);
                });
            } else if (req.params.from_page == '#listusers') {
                Account.findAll({
                    where: ['deleted = 0 AND is_enterprise=0 AND (email LIKE ? OR name LIKE ?)', "%" + req.params.term + "%", "%" + req.params.term + "%"],
                    limit: 20
                }).success(function (accounts) {
                    res.json(accounts);
                });
            }

        } else {

            if (req.params.from_page == '#enterprises') {
                Account.findAll({
                    where: ['deleted = 0 AND is_enterprise=1 AND (email LIKE ? OR name LIKE ?) AND created_by = ? ', "%" + req.params.term + "%", "%" + req.params.term + "%", req.session.Account.id],
                    limit: 20
                }).success(function (accounts) {
                    res.json(accounts);
                });
            } else if (req.params.from_page == '#listusers') {
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
                    ip: req.session.Account.ip
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
            ip: req.session.Account.ip
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
                                                        ip: req.session.Account.ip
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
                    ip: req.session.Account.ip
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
                    ip: req.session.Account.ip
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
                    ip: req.session.Account.ip
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

        Account.find(req.session.Account.id).done(function (err, account) {

            if (err)
                return res.send(err, 500);
            if (account) {

                var enterpriseName = fsName + '.png';

                var base64Data = binaryData.replace(/^data:image\/(png|gif|jpeg);base64,/, "");
                base64Data += base64Data.replace('+', ' ');
                binaryData = new Buffer(base64Data, 'base64').toString('binary');

                if (picUploadType === 'enterprise') {

                    fsx.writeFile("/var/www/html/olympus/master/public/images/enterprises/" + enterpriseName, binaryData, 'binary', function (err) {
                    });
                    account.enterprise_fsname = enterpriseName;
                    account.enterprise_mimetype = filetype;

                } else if (picUploadType === 'profile') {

                    fsx.writeFile("/var/www/html/olympus/master/public/images/profile/" + enterpriseName, binaryData, 'binary', function (err) {
                    });

                    account.avatar_image = enterpriseName;
                }

                account.save().done(function (err) {
                    if (err)
                        return res.end(err);
                });
            }

        });

    },
   /*****************************************************************************************
     Post Registration csv Data
     @Auth : Avneesh
     ********************************************************************************************/

    readCSVFile: function (req, res) {

        /*Define dependencies.*/

        var request = require('request');

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
                //console.log(req.params.filepath);
                var stream = fsx.createReadStream('/var/www/html/olympus/master/public/Teatdata1.csv');
                csv
                        .fromStream(stream)
                        .on("data", function (data) {
                            if (i != 0) {
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
                                    workgroup: directory[0]['id'],
                                    title: data[3],
                                    subscription: account[0]['subscription_id'],
                                };
                                request(options, function (err, response, body) {
                                    // console.log(options);
                                    if (err)
                                        return res.json({error: err.message, type: 'error'}, response && response.statusCode);
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
                                            account_id: '1',
                                            created_date: created_date,
                                            users_limit: subscription.users_limit,
                                            quota: subscription.quota,
                                            plan_name: subscription.features,
                                            price: subscription.price,
                                            duration: subscription.duration,
                                            paypal_status: '',
                                        };

                                        request(tran_options, function (err1, response1, body1) {
                                            if (err1)
                                                return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);
                                     
                                        });
                                    });
                                    res.json(body, response && response.statusCode);
                                });
                            }
                            i++;
                        })
                        .on("end", function (count) {
                            console.log('Number of lines: ' + count - 1);
                        })
                        .on('error', function (error) {
                            console.log(error.message);
                        });
            });
        });
    },
    /*****************************************************************************************
     Post Registration CSV Data
     @Auth : Avneesh
     ********************************************************************************************/


    getImage: function (req, res) {
        Account.find(req.session.Account.id).done(function (err, account) {
            if (err)
                res.json({success: false, error: err});
            res.json({success: true, avatar: account.avatar_image, enterprise: account.is_enterprise});
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

            var sql = "SELECT dir.*, dp.type FROM directory dir JOIN directorypermission dp ON dir.id = dp.DirectoryId  where dp.AccountId =?";
            sql = Sequelize.Utils.format([sql, req.param('id')]);
            sequelize.query(sql, null, {
                raw: true
            }).success(function (directorys) {
                if (directorys != null) {
                    directorys.forEach(function (diry) {
                        var sql = "Delete FROM directorypermission where DirectoryId = ?";
                        sql = Sequelize.Utils.format([sql, diry.id]);
                        sequelize.query(sql, null, {
                            raw: true
                        }).success(function (dirs) {
                            console.log("Delete permission of id ------------" + diry.id);


                            var sql = "SELECT * FROM file where DirectoryId =?";
                            sql = Sequelize.Utils.format([sql, diry.id]);
                            sequelize.query(sql, null, {
                                raw: true
                            }).success(function (files) {
                                if (files != null) {
                                    var dt = new Date();
                                    var datetime = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

                                    files.forEach(function (file) {
                                        var deleted = "Deleted" + file.fsName;
                                        var sql = "UPDATE file SET deleted='1', deleteDate='" + datetime + "',fsName='" + deleted + "' where id = ?";
                                        console.log(sql);
                                        sql = Sequelize.Utils.format([sql, file.id]);
                                        sequelize.query(sql, null, {
                                            raw: true
                                        }).success(function (fls) {
                                            console.log("Delete file of id : " + file.id);
                                        });
                                    });
                                }
                                res.json(directorys, 200);
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
    },
    'delete' : INodeService["delete"],
            /*
             This fucntion is called from the #addEnterprise and #reports to check 
             if email exist
             */

            checkEmail: function (req, res) {
                Account.find({
                    where: ['email ="' + req.param('email') + '"'],
                }).success(function (account) {
                    if (account === null) {
                        return res.json({msg: "no_record", type: "success"});
                    } else {
                        return res.json({msg: "email_exists", type: "success"});
                    }
                });
            },
};
_.extend(exports, AccountController);
