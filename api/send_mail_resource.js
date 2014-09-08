var jest = require('jest')
    ,common = require('./common')
    ,models = require('../models')
    ,og_action = require('../og/og').doAction
    ,_ = require('underscore')
    ,config = require('../config.js')
    ,async = require('async')
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
        var host = req.get('host');
        async.waterfall([
            function(callback){
                if(!_.find(config.hosts, function(hst){return hst == host; })){
                    models.Subject.findOne().where('host_details.host_address', 'http://' + host).exec(function(err, subject){
                        if(err || !subject) throw new Error('Subject with this host was not found');
                        callback(null, subject.host_details.title);
                    });
                } else {
                    callback(null, null);
                }
            }
        ], function (err, result) {
            var user = req.user;
            var from = result[0] ? result : config.systemEmail;
                from += " <" + req.body.mail_config.email + ">";
            var to = req.body.mail_config.to || 'maagal@sheatufim.org.il';
            var subject = req.body.mail_config.subject || 'NO MORE MAILS FOR ' + user.email;
            var explanation = req.body.mail_config.explanation;
//        var explanation = (req.body.mail_config.explanation ?  req.body.mail_config.explanation + " " + user.email : 'The reason is:' + '<br>' + req.body.mail_config.body);
            mail.sendMail(to, explanation, subject, from, function(err){
                callback(err);
            });
        });

    }
});

