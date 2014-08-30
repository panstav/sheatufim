
module.exports = function(req,res) {
    res.render('terms_of_use.ejs',{
        layout: false,
        url: req.url,
        user_logged: req.isAuthenticated(),
        user: req.session.user,
        avatar_url: req.session.avatar_url,
        government_terms: req.query.government
    });
};
