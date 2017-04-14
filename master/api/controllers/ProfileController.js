var UUIDGenerator = require('node-uuid');
var cacheRoute = require('booty-cache');

var ProfileController = {
    /*
     This Function is used to create Profiles
     By the user who have a permission of superadmin
     */
    create: function (req, res) {

        var request = require('request');

        Profile.createProfile({
            name: req.params.profile_name,
            user_managment: req.params.user_managment,
            enterprises_management: req.params.enterprises_management,
            subscription: req.params.subscription_managment,
            workgroup_managment_of_users: req.params.workgroup_managment_of_users,
            workgroup_managment_of_enterprises: req.params.workgroup_managment_of_enterprises,
            manage_admins: req.params.manage_admins,
            manage_superadmin: req.params.manage_superadmin,
            manage_admin_user: req.params.manage_admin_user,
            admin_id: req.session.Account.id

        }, function (err, results) {

            if (err)
                return res.send(err);
            /*Create logging*/
            var opts = {
                uri: 'http://localhost:1337/logging/register/',
                method: 'POST',
            };

            opts.json = {
                user_id: req.session.Account.id,
                text_message: 'has created a profile named ' + req.params.profile_name + '.',
                activity: 'created',
                on_user: req.session.Account.id,
                ip: req.session.Account.ip,
                platform: req.headers.user_platform,
            };

            console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& Create user   &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
            console.log(req.headers);
            console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& Create user  &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');


            request(opts, function (err1, response1, body1) {
                if (err)
                    return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);
                res.send(200);
            });
            /*Create logging*/
        });
    },
    deleteProfile: function (req, res) {

        var request = require('request');
        AdminUser.find({
            where: ['admin_profile_id=' + req.params.profile_id],
        }).success(function (adminUser) {
            if (adminUser === null) {
                Profile.find({
                    where: {id: req.params.profile_id}
                }).done(function (err, profile) {
                    var sql = "Delete FROM profile where id = ?";
                    sql = Sequelize.Utils.format([sql, req.params.profile_id]);
                    sequelize.query(sql, null, {
                        raw: true
                    }).success(function (dirs) {
                        /*Create logging*/
                        var opts = {
                            uri: 'http://localhost:1337/logging/register/',
                            method: 'POST',
                        };

                        opts.json = {
                            user_id: req.session.Account.id,
                            text_message: 'has deleted a profile named ' + profile.name + '.',
                            activity: 'deleted',
                            on_user: req.session.Account.id,
                            ip: req.session.Account.ip,
                            platform: req.headers.user_platform,
                        };

                        request(opts, function (err1, response1, body1) {
                            if (err)
                                return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);

                            res.json({'success': '1'});
                        });
                        /*Create logging*/

                    });

                });
            } else {
                res.json({'error_msg': 'Profile can not be deleted !'});
            }
        }).error(function (e) {
            throw new Error(e);
        });
    },
    listProfile: function (req, res) {
        Profile.findAll().success(function (accounts) {
            res.json(accounts, 200);
        });
    },
    updateProfile: function (req, res) {

        var request = require('request');
        var options = {
            uri: 'http://localhost:1337/profile/profileUpdate',
            method: 'POST',
        };

        options.json = {
            name: req.params.profile_name,
            user_managment: req.params.user_managment,
            enterprises_management: req.params.enterprises_management,
            subscription: req.params.subscription_managment,
            workgroup_managment_of_users: req.params.workgroup_managment_of_users,
            workgroup_managment_of_enterprises: req.params.workgroup_managment_of_enterprises,
            manage_admins: req.params.manage_admins,
            manage_superadmin: req.params.manage_superadmin,
            manage_admin_user: req.params.manage_admin_user,
            admin_id: req.session.Account.id,
            id: req.params.id
        };

        request(options, function (err, response, body) {
            if (err)
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
//  Resend using the original response statusCode
//  use the json parsing above as a simple check we got back good stuff

            /*Create logging*/
            var opts = {
                uri: 'http://localhost:1337/logging/register/',
                method: 'POST',
            };

            opts.json = {
                user_id: req.session.Account.id,
                text_message: 'has updated a profile.',
                activity: 'updated',
                on_user: req.session.Account.id,
                ip: req.session.Account.ip,
                platform: req.headers.user_platform,
            };

            request(opts, function (err1, response1, body1) {
                if (err)
                    return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);
                res.json(body, response && response.statusCode);
            });
            /*Create logging*/

        });

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
            quota: req.params.quota,
            created_by_name: req.session.Account.name, //for logging
        };

        request(options, function (err, response, body) {

            if (err)
                return res.json({error: err.message, type: 'error'}, response && response.statusCode);
//        Resend using the original response statusCode
//        use the json parsing above as a simple check we got back good stuff
            //res.json(body, response && response.statusCode);

            //save data to transactiondetails table


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

            opts.json = {
                user_id: req.session.Account.id,
                text_message: 'has created new account.',
                activity: 'newaccount',
                on_user: typeof (body.account) === 'undefined' ? body.id : body.account.id,
                ip: req.session.Account.ip,
                platform: user_platform,
            };

            console.log('################## Old Create User  ###############');
            console.log(user_platform);
            console.log('################### Old Create User ####################');


            request(opts, function (err1, response1, body1) {
                if (err)
                    return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);

                res.json({'success': '1'});
            });
            /*Create logging*/



            Subscription.find({
                where: {id: req.params.subscription}
            }).done(function (err, subscription) {

                // Save to transactionDetails table
                var tran_options = {
                    uri: 'http://localhost:1337/transactiondetails/register/',
                    method: 'POST',
                };

                var created_date = new Date();
                tran_options.json = {
                    trans_id: (req.session.Account.isSuperAdmin === 1) ? 'superadmin' : 'workgroupadmin',
                    account_id: typeof (body.account) === 'undefined' ? body.id : body.account.id,
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
                    //        Resend using the original response statusCode
                    //        use the json parsing above as a simple check we got back good stuff
                    res.json(body, response && response.statusCode);
                });

            });
            // end transaction history

        });
    },
    assignPermission: INodeService.addPermission,
//check for users limit

    checkUsersLimit: function (req, rest) {

        var user_id = (typeof req.session === "undefined") ? req.id : req.session.Account.id;
        var sql = "SELECT users_limit FROM transactiondetails WHERE is_deleted!=1 AND account_id=? ";
        sql = Sequelize.Utils.format([sql, user_id]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (transaction) {
            //Check user has subscribed any plan or not
            if (transaction.length) {

                var sql = "SELECT COUNT(id) AS total FROM account WHERE deleted!=1 and created_by=? ";
                sql = Sequelize.Utils.format([sql, user_id]);
                sequelize.query(sql, null, {
                    raw: true
                }).success(function (acc) {
                    if (acc[0].total >= transaction[0].users_limit) {
                        return rest.json({error: true, msg: 'You have reaced maximum limit of creating users.'});
                    } else {
                        return rest.json({error: false});
                    }
                });

            } else {
                rest.json({not_subscriber: true});
            }
        });
    },
    //End checking

    //check for workgroup limit
    checkWorkgroupLimit: function (req, res) {

        var sql = "SELECT workgroup_limit FROM transactiondetails WHERE is_deleted!=1 AND account_id=? ";
        sql = Sequelize.Utils.format([sql, req.session.Account.id]);
        sequelize.query(sql, null, {
            raw: true
        }).success(function (transaction) {
            if (transaction.length) { // if no data in transactiondetails for login user
                var sql = "SELECT COUNT(id) AS total FROM directory WHERE OwnerId=? ";
                sql = Sequelize.Utils.format([sql, req.session.Account.id]);
                sequelize.query(sql, null, {
                    raw: true
                }).success(function (acc) {
                    if (acc[0].total >= transaction[0].workgroup_limit) {
                        return res.json({error: true});
                    } else {
                        return res.json({error: false});
                    }
                });
            } else {
                return res.json({error: false});
            }

        });
    },
    //End checking

    /*Get all profiles and if not found result as no records found*/
    getAllProfiles: function (req, res) {
        Profile.findAll().success(function (profiles) {
            if (profiles.length) { // check for no records exists
                res.json(profiles, 200);
            } else {
                res.json({
                    name: 'error_123',
                    notFound: true,
                });
            }
        });
    },
    /*API for user registration*/
    apiRegister: function (req, res) {

        var request = require('request');

        var sql11 = "SELECT account_id FROM accountdeveloper WHERE access_token=?";
        sql11 = Sequelize.Utils.format([sql11, req.param('access_token')]);

        sequelize.query(sql11, null, {
            raw: true
        }).success(function (accountDev) {

            if (accountDev.length) {

                Account.find({
                    where: {id: accountDev[0].account_id}
                }).done(function (err, account) {

                    var sql = "SELECT users_limit FROM transactiondetails WHERE is_deleted!=1 AND account_id=? ";
                    sql = Sequelize.Utils.format([sql, accountDev[0].account_id]);
                    sequelize.query(sql, null, {
                        raw: true
                    }).success(function (transaction) {
                        //Check user has subscribed any plan or not
                        if (transaction.length) {

                            var sql = "SELECT COUNT(id) AS total FROM account WHERE deleted != 1 and created_by=? ";
                            sql = Sequelize.Utils.format([sql, accountDev[0].account_id]);

                            sequelize.query(sql, null, {
                                raw: true
                            }).success(function (acc) {

                                if (acc[0].total >= transaction[0].users_limit) {

                                    return res.json({error: true, msg: 'You have reached maximum limit of creating users.'});

                                } else {

                                    Subscription.find({
                                        where: {id: req.param('subscription')}
                                    }).done(function (err, subscription) {

                                        var options = {
                                            uri: 'http://localhost:1337/account/register/',
                                            method: 'POST'
                                        };

                                        options.json = {
                                            name: req.param('name'),
                                            email: req.param('email'),
                                            isVerified: true,
                                            isAdmin: false,
                                            password: req.param('password'),
                                            created_by: account.id,
                                            workgroup: req.param('workgroup'),
                                            title: req.param('title'),
                                            subscription: req.param('subscription'),
                                            created_by_name: account.name,
                                            quota: subscription.quota
                                        };

                                        request(options, function (err, response, body) {

                                            if (err)
                                                return res.json({error: true, msg: err.message}, response && response.statusCode);
                                            if (body.type == 'error') {

                                                return res.json({error: true, msg: body.error});
                                            }


//*****************************************************************************************************************************/

                                            /*Create logging*/
                                            var opts = {
                                                uri: 'http://localhost:1337/logging/register/',
                                                method: 'POST',
                                            };

                                            opts.json = {
                                                user_id: account.id,
                                                text_message: 'has created new account.',
                                                activity: 'newaccount',
                                                on_user: typeof (body.account) === 'undefined' ? body.id : body.account.id,
                                                ip: "",
                                                platform: req.headers.user_platform,
                                            };

                                            request(opts, function (err1, response1, body1) {
//                                                if (err)
//                                                    return res.json({error: err1.message, type: 'error'}, response1 && response1.statusCode);
//                                                res.json({'success': '1'});
                                            });

                                            /*Create logging*/

//*****************************************************************************************************************************/


                                            req.body.id = req.param('workgroup');
                                            req.body.owned_by = body.account.id;
                                            req.body.permission = 'comment';

                                            // Save to transactionDetails table
                                            var tran_options = {
                                                uri: 'http://localhost:1337/transactiondetails/register/',
                                                method: 'POST',
                                            };

                                            var created_date = new Date();

                                            tran_options.json = {
                                                trans_id: (account.isSuperAdmin === 1) ? 'superadmin' : 'workgroupadmin',
                                                account_id: body.account.id,
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
                                                    return res.json({error: true, msg: err1.message}, response1 && response1.statusCode);
                                                    ProfileController.assignPermission(req, res, function (err, resp) {
                                                    res.json(body, response && response.statusCode);
                                                });
                                            });
                                        }); // end transaction history
                                    });
                                }
                            });
                        } else {
                            res.json({error: true, msg: 'not subscribed'});
                        }
                    });
                });
            } else {
                res.json({error: true, msg: 'not autorized'});
            }
        });
    },
};
_.extend(exports, ProfileController);
