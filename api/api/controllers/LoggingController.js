/*---------------------
 :: Logging
 -> controller
 ---------------------*/

var destroy = require('../services/lib/account/destroy'),
        crypto = require('crypto'),
        emailService = require('../services/email');
var myip = require('myip');

var LoggingController = {
    register: function (req, res) {

        var newoption = {
            user_id: req.body.user_id,
            text_message: req.body.text_message,
            activity: req.body.activity,
            on_user: req.body.on_user,
            ip: req.body.ip,
            platform: req.body.platform,            

        };
                        console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& check data &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
                        console.log(newoption);
                        console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&& check data &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
                        
                        
        Logging.createLog(newoption, function (err, logging) {
            if (err)
                return res.json({error: 'Error creating logging', type: 'error'});
            return  res.json({
                logging: {
                    id: logging.id,
                }
            });
        });
    },
};

module.exports = LoggingController;
