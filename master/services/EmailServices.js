viewDir = app.get('views');

exports.sendEmail = function(template, options) {
    var accountName = options.accountName;
    var account = options.account;
    var controller = options.controller;
    var randPassword = options.randPassword;
    var inode = options.inode;
    var host = options.host;
    var port = options.port || app.address().port;
    // Send an email to the user we granted permissions to.  If they're a new
    // user, send them the verification link.  Otherwise, just send them an update.
    var opts = {"type":"messages","call":"send","message":
        {
            "subject": "",
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

    switch(template){
        case 'verify':
            opts.message.subject += "Welcome to Olympus";
            opts.message.html = "Dear "+account.name+",<br/><br/>Welcome to the Olympus file sharing system!  Your account details are: <br/><br/>User: "+account.email+"<br/><br/>To log in to Olympus, <a href='https://"+host+"'>click here.</a><br/><br/>You can also download our app from Google Play Store, to download <a href='https://play.google.com/store/apps/details?id=com.Olympus'>click here.</a> <br/> You can also download our app from Apple App Store, to download <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>click here.</a><br/>Sincerely,<br/>The Olympus Team";
            opts.message.text = "Dear "+account.name+",\n\nWelcome to the Olympus file sharing system!  Your account details are: \n\nUser: "+account.email+"\n\nTo log in to Olympus, go to https://"+host+"\n\nYou can also download our app from Google Play Store, to download <a href='https://play.google.com/store/apps/details?id=com.Olympus'>click here.</a> \n\n You can also download our app from Apple App Store, to download <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>click here.</a>\n\nSincerely,\nThe Olympus Team";
            break;
        case 'support':
            opts.message.subject += "New Registration at Olympus";
            opts.message.html = "Dear,<br/><br/> New Olympus Account Created. Account details are: <br/><br/><b>User</b>: "+account.name+"<br/> <b>Enterprise name: </b>"+account.enterprise_name+" <br/> <b>IP Address:</b> "+ account.ip_address +" <br/><br/> Sincerely,<br/>The Olympus Team";
            opts.message.text = "";
            break;
        case 'forgotpasswordemail'://Working
            opts.message.subject += "Olympus Password Reset";
            opts.message.html = "Dear "+account.name+",<br/><br/><a href=\"https://" + host + "/auth/resetPassword?code=" + account.verificationCode + "\">Click here</a> to reset your password.<br/><br/>Sincerely,<br/>The Olympus Team";
            opts.message.text = "Dear "+account.name+",\n\nYou forgot your password!\n\nSincerely,\nThe Olympus Team";
            break;
        case 'forgotpassword'://Not in use
            opts.message.subject += "Olympus Password Reset";
            opts.message.html = "Dear "+account.name+",<br/><br/> Your Email Id : "+account.email+" <br/> New Password : "+randPassword+" <br/>  <br/>Sincerely,<br/>The Olympus Team";
            opts.message.text = "Dear "+account.name+",\n\nWelcome to the Olympus file sharing system!  Your account details are: \n\nUser: "+account.email+"\n\nTo log in to Olympus, go to https://"+host+"\n\nYou can also download our app from Google Play Store, to download <a href='https://play.google.com/store/apps/details?id=com.Olympus'>click here.</a> \n\n You can also download our app from Apple App Store, to download <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>click here.</a>\n\nSincerely,\nThe Olympus Team";
            break;
        case 'invite':
            opts.message.subject += accountName+" shared a "+controller+" with you on Olympus";
            if (account.verified === true) {
        //        opts.message.html = "Dear "+account.name+",<br/><br/>You were added to the "+controller+" &ldquo;"+inode.name+"&rdquo;.<br/>You can also download our app from Google Play Store, to download <a href='https://play.google.com/store/apps/details?id=com.Olympus'>click here.</a> <br/> You can also download our app from Apple App Store, to download <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>click here.</a>";
                opts.message.html = "Dear "+account.name+",<br/><br/>You were added to the "+controller+" &ldquo;"+inode.name+"&rdquo;.<br/><br/>To access it please log onto https://" + host + " Or you can download the olympus mobile app from: <br/><br/> iOS: <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8</a> <br/> Android: <a href='https://play.google.com/store/apps/details?id=com.Olympus'>https://play.google.com/store/apps/details?id=com.Olympus</a>";
                opts.message.text = "Dear "+account.name+",\n\nYou were added to the "+ controller +" '"+inode.name+"'.\n\n To access it please log onto https://" + host + " Or you can download the olympus mobile app from: \n\n iOS: <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8</a> \n\n Android: <a href='https://play.google.com/store/apps/details?id=com.Olympus'>https://play.google.com/store/apps/details?id=com.Olympus</a>";
            } else {
                if (port && port != '80') {
                    host = host + ":"+port;
                }
                opts.message.html = "Dear "+account.name+",<br/><br/>"+account.name+" has shared a "+controller+" with you in the Olympus file sharing system.  In order to log in to Olympus, please verify your account by <a href='https://"+host+"/auth/verify?code="+account.verificationCode+"'>clicking here</a> <br/><br/>To access it please log onto https://" + host + " Or you can download the olympus mobile app from: <br/><br/> iOS: <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8</a> <br/> Android: <a href='https://play.google.com/store/apps/details?id=com.Olympus'>https://play.google.com/store/apps/details?id=com.Olympus</a>";
                opts.message.text = "Dear "+account.name+",\n\n"+accountName+" has shared a "+controller+" with you in the Olympus file sharing system.  In order to log in to     Olympus, please verify your account by <a href='https://"+host+"/auth/verify?code="+account.verificationCode+"'>clicking here</a> \n\n To access it please log onto https://" + host + " Or you can download the olympus mobile app from: \n\n iOS: <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8</a> \n\n Android: <a href='https://play.google.com/store/apps/details?id=com.Olympus'>https://play.google.com/store/apps/details?id=com.Olympus</a>";
            }
            break;
    }

    var service = sails.config.mailService;//smtp|mandrill

    switch(service){
        case 'mandrill':
            var mandrill = require('mandrill');
            var mandrillKey = sails.config.mandrillApiKey;

            mandrill.call({'key': mandrillKey});
            mandrill.call(opts, function(data){
            });
        break;
        case 'internal':
        case 'smtp'://BOTH smtp and gmail
            var nodemailer = require('nodemailer');
            var smtpTransport = require('nodemailer-smtp-transport');
            //SMTP config
                var transport = nodemailer.createTransport(smtpTransport({
                  host: sails.config.smtpDetails.host,//'smtp.gmail.com',
                  port: sails.config.smtpDetails.port,//465,//465-SSL;587-TLS
                  auth: {
                    user: sails.config.smtpDetails.user,//'test@gmail.com',
                    pass: sails.config.smtpDetails.pass//'alcanzar@2013'
                  },
                  secure: true
                }));

            //GMAIL config
                //NOTE:::
                //::::before changing following gmail credentials please login from a browser
                // with that gmail account and visit following links
                // https://www.google.com/settings/security/lesssecureapps (check turn on)
                // https://accounts.google.com/b/0/DisplayUnlockCaptcha (unlock captcha)
                // ------if still not working try another account in which 2-step verification is off
                // ------also user and server geolocation matters
                // https://support.google.com/mail/answer/14257?rd=1
                /*var transport = nodemailer.createTransport(smtpTransport({
                    service: 'gmail',
                    auth: {
                        user: 'alcanzartesting@gmail.com', // my mail
                        pass: 'alcanzardevsoft@2013'
                    }
                }));*/

                // verify connection configuration
                transport.verify(function(error, success) {
                   if (error) {
                        console.log(error);
                        console.log('smtptransportErrorsmtptransportErrorsmtptransportError');
                   } else {
                        // console.log('Server is ready to take our messages');
                   }
                });

            var email = {
                from: 'info@olympus.io',
                to: account.email,
                subject: opts.message.subject,
                text: opts.message.text,
                html: opts.message.html
            };

            transport.sendMail(email, function(err, responseStatus) {
              if (err) {
                console.log(err);
              } else {
                console.log(responseStatus.message);
              }
            });
        break;
    }
};