var request = require('request');
var UploadPathsController = {

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

    getCurrentAdapter: function (req, res) {//Used in web only(Appearence Setting)
        UploadPaths.find({where:{isActive:1}}).done(function (err, adapter) {
            if (err)
                res.json({success: false, error: err});

            if(adapter){
                res.json({success: true, adapter:adapter});
            }else{//null
                res.json({success: false, error: 'noadapterfound'});
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
    }

};
_.extend(exports, UploadPathsController);
