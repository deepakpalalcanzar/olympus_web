var request = require('request');
var ThemeController = {

    updateColor: function (req, res) {

    	var options = {
            uri: 'http://localhost:1337/theme/updateColors' ,
            method: 'POST',
        };

        options.json =  {
            headerColor : "#"+req.param('header'),
            navColor	: "#"+req.param('nav'),
            bodyColor   : "#"+req.param('body'),
            footerColor : "#"+req.param('footer'),
            fontColor	: "#"+req.param('fontColor'),
            fontFamily	: req.param('fontFamily'),
            account_id	: req.session.Account.id,
        };

        request(options, function(err, response, body) {
			if(err) return res.json({ error: err.message, type: 'error' }, response && response.statusCode);        
		});

	}

};
_.extend(exports, ThemeController);