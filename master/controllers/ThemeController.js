var request = require('request');
var ThemeController = {

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

    getCurrentTheme: function (req, res) {//Used in web only(Appearence Setting)
        Theme.find({where: {account_id: req.session.Account.id}}).done(function (err, theme) {
            if (err)
                res.json({success: false, error: err});

            if(theme){
                res.json({success: true, theme:{
                        header      : (theme.header_background).replace(/^#*/g, "#"),//remove one or more # from start and end
                        body        : (theme.body_background).replace(/^#*/g, "#"),
                        footer      : (theme.footer_background).replace(/^#*/g, "#"),
                        navcolor    : (theme.navigation_color).replace(/^#*/g, "#"),
                        font_color  : (theme.font_color).replace(/^#*/g, "#"),
                        font_family : (theme.font_family)
                    }
                });
            }else{//null
                res.json({success: false, error: 'nothemefound'});
            }
        });
    },

    getThemeConfiguration: function (req, res) {

        var sql = "SELECT account_id FROM accountdeveloper WHERE access_token=?";
        sql = Sequelize.Utils.format([sql, req.params.id]);

	// console.log("Printing Query Printing Query Printing Query Printing Query");
	// console.log(req);
	console.log("Printing Query Printing Query Printing Query Printing Query");
	console.log(sql);

        sequelize.query(sql, null, {
            raw: true
        }).success(function (accountDev) {

            if (accountDev.length) {
                var options = {
                    uri     : 'http://localhost:1337/theme/getThemeConfiguration',
                    method  : 'POST',
                    timeout : 40000
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
    }

};
_.extend(exports, ThemeController);
