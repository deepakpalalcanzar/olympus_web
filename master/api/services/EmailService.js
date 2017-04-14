var mandrill = require('mandrill');
var mandrillKey = sails.config.mandrillApiKey;

viewDir = app.get('views');

exports.sendVerifyEmail = function(options) {
    var host = options.host;
    var account = options.account;
	// Send an email to the user we just verified, giving them their username / password
    var port = app.address().port;

    var opts = {"type":"messages","call":"send","message":
        {
            "subject": "Welcome to Olympus",
            "from_email": "info@olympus.io",
            "from_name": "Olympus",
            "to":[
                {"email": account.email, "name": account.name}
            ],
            "headers":{"...": "..."},
            "track_opens":true,
            "track_clicks":true,
            "auto_text":true,
            "url_strip_qs":true,
            "tags":["test","example","sample"],
            "google_analytics_domains":["werxltd.com"],
            "google_analytics_campaign":["..."],
            "metadata":["..."],
            "html": "Dear "+account.name+",<br/><br/>Welcome to the Olympus file sharing system!  Your account details are: <br/><br/>User: "+account.email+"<br/><br/>To log in to Olympus, <a href='https://"+host+"'>click here.</a><br/><br/>Sincerely,<br/>The Olympus Team",
            "text": "Dear "+account.name+",\n\nWelcome to the Olympus file sharing system!  Your account details are: \n\nUser: "+account.email+"\n\nTo log in to Olympus, go to https://"+host+"\n\nSincerely,\nThe Olympus Team"
        }
    };
    mandrill.call({'key': mandrillKey});
    mandrill.call(opts, function(data){
    });
};



exports.sendSupportMail = function(options) {

    console.log("options in send support mail options in send support mail");
    console.log(options);

    var account = options.account;
    // Send an email to the user we just verified, giving them their username / password
    var port    = app.address().port;

    var opts = {
                    "type":"messages",
                    "call":"send",
                    "message" : {
                        "subject"   : "New Registration at Olympus",
                        "from_email": "info@olympus.io",
                        "from_name" : "Olympus",
                        "to":[
                            {"email": " support@olympus.io", "name": "Olympus Support"}
                        ],
                        "headers":{"...": "..."},
                        "track_opens":true,
                        "track_clicks":true,
                        "auto_text":true,
                        "url_strip_qs":true,
                        "tags":["test","example","sample"],
                        "google_analytics_domains":["werxltd.com"],
                        "google_analytics_campaign":["..."],
                        "metadata":["..."],
                        "html": "Dear,<br/><br/> New Olympus Account Created. Account details are: <br/><br/><b>User</b>: "+account.name+"<br/> <b>Enterprise name: </b>"+account.enterprise_name+" <br/> <b>IP Address:</b> "+ account.ip_address +" <br/><br/> Sincerely,<br/>The Olympus Team",
        }
    };
        mandrill.call({'key': mandrillKey});
        mandrill.call(opts, function(data){
    });

};

exports.sendForgotPasswordEmail = function(options) {
    var host = options.host;
    var account = options.account;
	// Send an email to the user we just verified, giving them their username / password

    var opts = {"type":"messages","call":"send","message":
        {
            "subject": "Olympus Password Reset",
            "from_email": "info@olympus.io",
            "from_name": "Olympus",
            "to":[
                {"email": account.email, "name": account.name}
            ],
            "headers":{"...": "..."},
            "track_opens":true,
            "track_clicks":true,
            "auto_text":true,
            "url_strip_qs":true,
            "tags":["test","example","sample"],
            "google_analytics_domains":["werxltd.com"],
            "google_analytics_campaign":["..."],
            "metadata":["..."],
            "html": "Dear "+account.name+",<br/><br/><a href=\"https://" + host + "/auth/resetPassword?code=" + account.verificationCode + "\">Click here</a> to reset your password.<br/><br/>Sincerely,<br/>The Olympus Team",
            "text": "Dear "+account.name+",\n\nYou forgot your password!\n\nSincerely,\nThe Olympus Team"
        }
    };
    mandrill.call({'key': mandrillKey});
    mandrill.call(opts, function(data){
    });
};

exports.sendInviteEmail = function(options) {
    var accountName = options.accountName;
    var account = options.account;
    var controller = options.controller;
    var inode = options.inode;
    var host = options.host;
    var port = options.port;
    // Send an email to the user we granted permissions to.  If they're a new
    // user, send them the verification link.  Otherwise, just send them an update.
    var opts = {"type":"messages","call":"send","message":
        {
            "subject": accountName+" shared a "+controller+" with  you on Olympus",
            "from_email": "info@olympus.io",
            "from_name": "Olympus",
            "to":[
                {"email": account.email, "name": account.name}
            ],
            "headers":{"...": "..."},
            "track_opens":true,
            "track_clicks":true,
            "auto_text":true,
            "url_strip_qs":true,
            "tags":["test","example","sample"],
            "google_analytics_domains":["werxltd.com"],
            "google_analytics_campaign":["..."],
            "metadata":["..."]
        }
    };
    if (account.verified === true) {
        opts.message.html = "Dear "+account.name+",<br/><br/>You were added to the "+controller+" &ldquo;"+inode.name+"&rdquo;.";
        opts.message.text = "Dear "+account.name+",\n\nYou were added to the "+ controller +" '"+inode.name+"'.";
    } else {

        if (port && port != '80') {
            host = host + ":"+port;
        }
        opts.message.html = "Dear "+account.name+",<br/><br/>"+account.name+"    has shared a "+controller+" with you in the Olympus file sharing system.  In order to log in to Olympus, please verify your account by <a href='https://"+host+"/auth/verify?code="+account.verificationCode+"'>clicking here</a>";
        opts.message.text = "Dear "+account.name+",\n\n"+accountName+" has      shared a "+controller+" with you in the Olympus file sharing system.  In order to log in to     Olympus, please verify your account by <a href='https://"+host+"/auth/verify?code="+account.verificationCode+"'>clicking here</a>";
    }
    mandrill.call({'key': mandrillKey});
    mandrill.call(opts, function(data){
        // no callback;
    });
};
