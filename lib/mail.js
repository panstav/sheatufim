

//var SendGrid = require('sendgrid').SendGrid
//    ,Email = require('sendgrid').Email;

var nodemailer = require('nodemailer')
    ,config = require('../config');

var from, fromName, smtpTransport;

exports.load = function(app)
{
    from = config.systemEmail;
    fromName = config.systemEmailName;
    // create reusable transport method (opens pool of SMTP connections)
    smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Gmail",
       // host:'smtpin.livedns.co.il',
        auth: {
            user:config.SMTPUsername,
            pass:config.SMTPPassword
            //user: "saarsta@gmail.com",
            //pass: "S2T>Ba9Y"
        }
    });

};







var sendMail = exports.sendMail = function(to,body,subject,callback) {


    if(!smtpTransport) {
        console.log('email not sent because it\'s off in app.js. to turn mails on set app.set("send_mails",true); ');
        return callback();
    }

    console.log('sending to ' + to + ' ' + subject);

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: fromName + " <" + from + ">", // sender address
        to: to, // list of receivers
        subject:subject, // Subject line
        html: body // html body
    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.error('mail was not sent',error);
            callback(response);
        }
        else{
            console.log('mail was sent');
            callback(null,response);
        }
    });

};

var sendMailFromTemplate = exports.sendMailFromTemplate = function(to,string,callback) {
    var parts = string.split('<!--body -->');
    var subject = parts[0] || 'מייל מערכת עורו';
    var body = parts[1] || parts[0];
    sendMail(to,body,subject,callback);
};