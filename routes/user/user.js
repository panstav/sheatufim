var models = require('../../models');
var async = require('async');
var config = require('../../config.js');
var _ = require('underscore');

module.exports = function (req, res) {
    var host = req.get('host');
    var data = {
        layout: false,
        title: "פרופיל שלי",
        logged: req.isAuthenticated(),
        user: req.user,                 // logged user
        url: req.url,
        avatar:req.session.avatar_url,
        is_no_sheatufim : false,
        subject : {}
    };

    if(!_.find(config.hosts, function(hst){return hst == host; })){
        data.is_no_sheatufim = true;
        models.Subject.findOne().where('host_details.host_address', 'http://' + host).exec(function(err, subject){
            if(err || !subject) throw new Error('Subject with this host was not found');
            data.subject = subject;
            res.render('my_account.ejs', data);
        });
    } else {
        res.render('my_account.ejs', data);
    }
};
