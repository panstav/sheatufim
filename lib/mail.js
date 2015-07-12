

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

    var mail_pass = process.env['SMTP-PASSWORD'] || '';
    console.log(mail_pass);
    smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Msiljet",
        host:'in-v3.mailjet.com',
        auth: {
           // user:config.SMTPUsername,
           // pass:config.SMTPPassword
            /*user: "app22288575@heroku.com",
            pass: "8hzb8as6"*/
            user: "1ee0d830159fafb52746b375e1403294",
            pass: mail_pass
        }
    });

};

var sendMail = exports.sendMail = function(to, body, subject, expFrom, callback) {
    console.log('subject',subject);
    if(typeof expFrom === "function" && typeof callback !== 'function') {
        callback = expFrom;
        expFrom = null;
    }
    if(!smtpTransport) {
        console.log('email not sent because it\'s off in app.js. to turn mails on set app.set("send_mails",true); ');
        return callback();
    }

    console.log('sending to ' + to + ' ' + subject);
    // setup e-mail data with unicode symbols

    var mailOptions = {
        from: expFrom ? expFrom : fromName + " <" + from + ">", // sender address
//        from: from,
        to: to, // list of receivers
        subject: subject, // Subject line
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

var sendMailFromTemplate = exports.sendMailFromTemplate = function(to, string, email_details,callback) {
    if(typeof email_details === "function" && typeof callback !== 'function') {
        callback = email_details;
        email_details = null;
    }
    var parts = string.split('<!--body -->');
    var subject = email_details && email_details.title ? 'עדכון ממעגל שיח - מסמך יסוד לחברה האזרחית' : 'עדכון מאתר מעגלי השיח של שיתופים';

    var body = parts[1] || parts[0];
    var email = email_details && email_details.title ? email_details.title + " <" + email_details.email + ">" : null;
    sendMail(to,body,subject, email, callback);
};

function test(){
    exports.load();
    sendMail('ishai@bablic.com','Test','Testy',function(err){
        console.error(err);
    });
}


if(process.argv[1] == __filename)
    test();