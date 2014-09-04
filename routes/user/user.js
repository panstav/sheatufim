var models = require('../../models');
var async = require('async');

module.exports = function (req, res) {
    var is_no_sheatufim = false;
    var host = req.get('host');
    if(host != 'www.sheatufim-roundtable.org.il' && host != 'www.sheatufim-roundtable.org.il:8080' && host != 'localhost:8080'){
        is_no_sheatufim = true;
    }
    res.render('my_account.ejs', {
        layout: false,
        title: "פרופיל שלי",
        logged: req.isAuthenticated(),
        user: req.user,                 // logged user
        url: req.url,
        avatar:req.session.avatar_url,
        is_no_sheatufim: is_no_sheatufim
    });
};
