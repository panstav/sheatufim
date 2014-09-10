var models = require('../../models');
var config = require('../../config.js');
var _ = require('underscore');

module.exports = function(req,res) {
    var host = req.get('host');
    var data = {
        layout: false,
        url: req.url,
        user_logged: req.isAuthenticated(),
        user: req.session.user,
        avatar_url: req.session.avatar_url,
        is_no_sheatufim : false,
        subject : {}
    };
    if(!_.find(config.hosts, function(hst){return hst == host; })){
        data.is_no_sheatufim = true;
        models.Subject.findOne().where('host_details.host_address', 'http://' + host).exec(function(err, subject){
            if(err || !subject) throw new Error('Subject with this host was not found');
            data.subject = subject;
            res.render('contact.ejs', data);
        });
    } else {
        res.render('contact.ejs', data);
    }
};