var request = require('request');
var SiteSettingsController = {

    updateColor: function (req, res) {

        var options = {
            uri: 'http://localhost:1337/theme/updateColors' ,
            method: 'POST',
        };

        options.json =  {
            headerColor : "#"+req.param('header'),
            navColor    : "#"+req.param('nav'),
            bodyColor   : "#"+req.param('body'),
            footerColor : "#"+req.param('footer'),
            fontColor   : "#"+req.param('fontColor'),
            fontFamily  : req.param('fontFamily'),
            account_id  : req.session.Account.id,
        };

        request(options, function(err, response, body) {
        	if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);
        	res.json({ error: false, type: 'success' });
    	});

    },

    getLdapSettings: function (req, res) {//Used in web only(Appearence Setting)
        SiteSettings.find({where:{id:1}}).done(function (err, ldapopt) {
            if (err)
                res.json({success: false, error: err});

            if(ldapopt){
                res.json({success: true, ldapopt:ldapopt});
            }else{//null
                res.json({success: false, error: 'nosettingsfound'});
            }
        });
    },

    getThemeConfiguration: function (req, res) {

        var sql = "SELECT account_id FROM accountdeveloper WHERE access_token=?";
        sql = Sequelize.Utils.format([sql, req.params.id]);

	console.log("Printing Query Printing Query Printing Query Printing Query");
	console.log(req);
	console.log("Printing Query Printing Query Printing Query Printing Query");
	console.log(sql);

        sequelize.query(sql, null, {
            raw: true
        }).success(function (accountDev) {

            if (accountDev.length) {
                var options = {
                    uri     : 'http://localhost:1337/theme/getThemeConfiguration',
                    method  : 'POST'
                };

                options.json = {
                    account_id: accountDev[0]['account_id']
                };

                request(options, function (err, response, body) {
            		if (err) return res.json(err);
		        res.json(body);
                });

            } else {
                res.json({notAuth: 'not autorized'});
            }
        });
    },

    getSiteOptions: function (req, res) {//Used in web only(Appearence Setting)
        SiteOptions.find({where:{id:1}}).done(function (err, otheropt) {
            if (err)
                res.json({success: false, error: err});

            if(otheropt){
                res.json({
                    success                 : true,
                    allowSignupfromMobile   : otheropt.allowSignupfromMobile?true:false,
                    exportDbActive          : otheropt.exportDbActive?true:false,
                    exportDbHost            : otheropt.exportDbHost,
                    exportDbUser            : otheropt.exportDbUser,
                    exportDbPass            : otheropt.exportDbPass,
                    exportDbPath            : otheropt.exportDbPath,
                    exportDbPort            : otheropt.exportDbPort,
                    backupInterval          : otheropt.backupInterval,
                    gdriveSync              : otheropt.gdriveSync,
                    gdriveClientId          : otheropt.gdriveClientId,
                    gdriveClientSecret      : otheropt.gdriveClientId,
                    gdriveRedirectUri       : otheropt.gdriveRedirectUri,
                    dropboxSync             : otheropt.dropboxSync,
                    dropboxClientId         : otheropt.dropboxClientId,
                    dropboxClientSecret     : otheropt.dropboxClientSecret,
                    boxSync                 : otheropt.boxSync,
                    boxClientId             : otheropt.boxClientId,
                    boxClientSecret         : otheropt.boxClientSecret,
                });
            }else{//null
                // res.json({success: false, error: 'nosettingsfound'});

                //Consider it enabled by default
                res.json({success: true, allowSignupfromMobile:true});
            }
        });
    },

};
_.extend(exports, SiteSettingsController);
