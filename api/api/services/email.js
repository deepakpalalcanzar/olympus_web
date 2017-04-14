// TODO: make this an adapter
var mandrill = require('node-mandrill')(require('../../config/application').mandrill.token);


exports.sendWelcomeEmail = function (options, cb) {

  var account = options.account;

  // Send an email to the user we just verified, giving them their username / password
  var host = sails.config.hostName;
  var protocol = sails.config.protocol || 'http://';

if(sails.config.mailService == 'mandrill'){
  mandrill('/messages/send', {
    message: {
      "subject": "Welcome to Olympus",
      "from_email": "info@olympus.co",
      "from_name": "Olympus",
      "to": [{
        "email": account.email,
        "name": account.name
      }],
      "track_opens": true,
      "track_clicks": true,
      "auto_text": true,
      "url_strip_qs": true,
      "tags": ["test", "example", "sample"],
      "google_analytics_domains": ["werxltd.com"],
      "html": "Dear " + account.name + ",<br/><br/>Welcome to the Olympus file sharing system!  Your account details are: <br/><br/>User Name: " + account.email + "<br/>Password : " + options.password + "<br/><br/>To log in to Olympus, <a href='" + protocol + host + "'>click here.</a><br/><br/>To access it please log onto " + protocol + host + " Or you can download the olympus mobile app from: <br/><br/> iOS: <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8</a> <br/> Android: <a href='https://play.google.com/store/apps/details?id=com.Olympus'>https://play.google.com/store/apps/details?id=com.Olympus</a><br/><br/>Sincerely,<br/>The Olympus Team",
      "text": "Dear " + account.name + ",\n\nWelcome to the Olympus file sharing system!  Your account details are: \n\nUser Name: " + account.email + "\nPassword : " + options.password + "\n\nTo log in to Olympus, go to " + protocol + host + "\n\nTo access it please log onto " + protocol + host + " Or you can download the olympus mobile app from: \n\n iOS: <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8</a> \n Android: <a href='https://play.google.com/store/apps/details?id=com.Olympus'>https://play.google.com/store/apps/details?id=com.Olympus</a>\n\nSincerely,\nThe Olympus Team"
    }
  }, cb);
}else{//internal

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
                subject: "Welcome to Olympus",
                text: "Dear " + account.name + ",\n\nWelcome to the Olympus file sharing system!  Your account details are: \n\nUser Name: " + account.email + "\nPassword : " + options.password + "\n\nTo log in to Olympus, go to " + protocol + host + "\n\nTo access it please log onto " + protocol + host + " Or you can download the olympus mobile app from: \n\n iOS: <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8</a> \n Android: <a href='https://play.google.com/store/apps/details?id=com.Olympus'>https://play.google.com/store/apps/details?id=com.Olympus</a>\n\nSincerely,\nThe Olympus Team",
                html: "Dear " + account.name + ",<br/><br/>Welcome to the Olympus file sharing system!  Your account details are: <br/><br/>User Name: " + account.email + "<br/>Password : " + options.password + "<br/><br/>To log in to Olympus, <a href='" + protocol + host + "'>click here.</a><br/><br/>To access it please log onto " + protocol + host + " Or you can download the olympus mobile app from: <br/><br/> iOS: <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8</a> <br/> Android: <a href='https://play.google.com/store/apps/details?id=com.Olympus'>https://play.google.com/store/apps/details?id=com.Olympus</a><br/><br/>Sincerely,<br/>The Olympus Team"
            };

            transport.sendMail(email, function(err, responseStatus) {
              if (err) {
                console.log(err);
              } else {
                console.log(responseStatus.message);
              }
              cb();
            });
}

};

exports.sendVerifyEmail = function (options, cb) {

  var account = options.account;

  // Send an email to the user we just verified, giving them their username / password
  var host = sails.config.hostName;
  var protocol = sails.config.protocol || 'http://';

if(sails.config.mailService == 'mandrill'){
  mandrill('/messages/send', {
    message: {
      "subject": "Welcome to Olympus",
      "from_email": "info@balderdash.co",
      "from_name": "Olympus",
      "to": [{
        "email": account.email,
        "name": account.name
      }],
      "track_opens": true,
      "track_clicks": true,
      "auto_text": true,
      "url_strip_qs": true,
      "tags": ["test", "example", "sample"],
      "google_analytics_domains": ["werxltd.com"],
      "html": "Dear " + account.name + ",<br/><br/>Welcome to the Olympus file sharing system!  In order to log in to Olympus, please verify your account by <a href='" + protocol + host + "/auth/verify?code=" + account.verificationCode + "'>clicking here</a>",
      "text": "Dear " + account.name + ",\n\nWelcome to the Olympus file sharing system!  In order to log in to Olympus, please verify your account by <a href='" + protocol + host + "/auth/verify?code=" + account.verificationCode + "'>clicking here</a>"
    }
  }, cb);
}else{//internal

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
                  from: 'info@balderdash.co',
                  to: account.email,
                  subject: "Welcome to Olympus",
                  text: "Dear " + account.name + ",\n\nWelcome to the Olympus file sharing system!  In order to log in to Olympus, please verify your account by <a href='" + protocol + host + "/auth/verify?code=" + account.verificationCode + "'>clicking here</a>",
                  html: "Dear " + account.name + ",<br/><br/>Welcome to the Olympus file sharing system!  In order to log in to Olympus, please verify your account by <a href='" + protocol + host + "/auth/verify?code=" + account.verificationCode + "'>clicking here</a>"
              };

              transport.sendMail(email, function(err, responseStatus) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(responseStatus);
                }
                cb();
              });
  }
};

exports.sendInviteEmail = function (options, cb) {

  // accountName is the name of the account that is inviting
  var accountName = options.accountName;

  // the target account model
  var account = options.account;

  // the file/folder model
  var inode = options.inode;

  // 'file'/'folder'
  var nodeType = options.nodeType;
  var host = sails.config.hostName;
  var protocol = sails.config.protocol || 'http://';

  // Send an email to the user we granted permissions to.  If they're a new
  // user, send them the verification link.  Otherwise, just send them an update.
  var opts = {
    "message": {
      "subject": accountName + " shared a " + nodeType + " with  you on Olympus",
      "from_email": "info@olympus.io",
      "from_name": "Olympus",
      "to": [{
        "email": account.email,
        "name": account.name
      }],
      "track_opens": true,
      "track_clicks": true,
      "auto_text": true,
      "url_strip_qs": true,
      "tags": ["test", "example", "sample"],
      "google_analytics_domains": ["werxltd.com"]
    }
  };
  if (account.verified === true) {
    opts.message.html = "Dear " + account.name + ",<br/><br/>You were added to the " + nodeType + " &ldquo;" + inode.name + "&rdquo;.<br/>You can also download our app from Google Play Store, to download <a href='https://play.google.com/store/apps/details?id=com.Olympus'>click here.</a> <br/> You can also download our app from Apple App Store, to download <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>click here.</a>";
    opts.message.text = "Dear " + account.name + ",\n\nYou were added to the " + nodeType + " '" + inode.name + "'.\n\n You can also download our app from Google Play Store, to download <a href='https://play.google.com/store/apps/details?id=com.Olympus'>click here.</a> \n\n You can also download our app from Apple App Store, to download <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>click here.</a>";
  } else {

    opts.message.html = "Dear " + account.name + ",<br/><br/>" + accountName + "    has shared a " + nodeType + " with you in the Olympus file sharing system.  In order to log in to Olympus, please verify your account by <a href='" + protocol + host + "/auth/verify?code=" + account.verificationCode + "'>clicking here</a> <br/>You can also download our app from Google Play Store, to download <a href='https://play.google.com/store/apps/details?id=com.Olympus'>click here.</a> <br/> You can also download our app from Apple App Store, to download <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>click here.</a>";
    opts.message.text = "Dear " + account.name + ",\n\n" + accountName + " has      shared a " + nodeType + " with you in the Olympus file sharing system.  In order to log in to     Olympus, please verify your account by <a href='" + protocol + host + "/auth/verify?code=" + account.verificationCode + "'>clicking here</a> \n\n You can also download our app from Google Play Store, to download <a href='https://play.google.com/store/apps/details?id=com.Olympus'>click here.</a> <br/> You can also download our app from Apple App Store, to download <a href='https://itunes.apple.com/us/app/olympus.io/id778404078?mt=8'>click here.</a>";
  }
if(sails.config.mailService == 'mandrill'){
  mandrill('/messages/send', opts, cb);
}else{//internal

            var nodemailer = require('nodemailer');
            var smtpTransport = require('nodemailer-smtp-transport');
            //SMTP config
                var transport = nodemailer.createTransport(smtpTransport({
                  host: sails.config.smtpDetails.host,//'smtp.gmail.com',
                  port: sails.config.smtpDetails.port,//465,//465-SSL;587-TLS
                  auth: {
                    user: sails.config.smtpDetails.user,//'alcanzartesting@gmail.com',
                    pass: sails.config.smtpDetails.pass//'alcanzardevsoft@2013'
                  },
                  secure: true
                }));

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
              cb();
            });
}
};
