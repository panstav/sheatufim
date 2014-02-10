var models = require('../../models');
var async = require('async');

module.exports = function (req, res) {
    res.render('my_account.ejs', {
        layout: false,
        title: "פרופיל שלי",
        logged: req.isAuthenticated(),
        user: req.user,                 // logged user
        url: req.url,
        avatar:req.session.avatar_url
    });
};
