var jest = require('jest')
    ,common = require('./common')
    ,models = require('../models')
    ,og_action = require('../og/og').doAction
    ,_ = require('underscore')
    ,mail = require('../lib/mail');



var SendMailResource = module.exports = jest.Resource.extend({
    init:function() {
        this._super();
        this.allowed_methods = ['post'];
        this.authentication = new common.SessionAuthentication();
        this.fields = {};
        this.update_fields = {
            body : null
        };
    },

    create_obj: function(req,fields,callback) {
        var user = req.user;
        var from = req.body.mail_config.email;
        var to = req.body.mail_config.to || 'maagal@sheatufim.org.il';
        var subject = req.body.mail_config.subject || 'NO MORE MAILS FOR ' + user.email;
        var explanation = req.body.mail_config.explanation;
//        var explanation = (req.body.mail_config.explanation ?  req.body.mail_config.explanation + " " + user.email : 'The reason is:' + '<br>' + req.body.mail_config.body);
        mail.sendMail(to, explanation, subject, from, function(err){
            callback(err);
        });
    }
});

