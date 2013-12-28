var models = require('../../models'),
    InformationItemResource = require('../../api/InformationItemResource.js'),
    PressItemResource = require('../../api/PressItemResource.js');

module.exports = function(req,res) {
    var subject_id = req.params[0];
    var information_item_resource = new InformationItemResource();
    var links_resource = new PressItemResource();

    async.parallel([
        function(cbk) {
            models.Subject.findById(subject_id).exec(function(err, result){
                cbk(err, result);
            });
        },

        function(cbk){
            information_item_resource.get_objects(req, {subjects: subject_id}, {creation_date: -1}, 3, 0, function(err, information_items){
                console.log(information_items);
                cbk(err, information_items);
            });
        },
        function(cbk){
            links_resource.get_objects(req, {subjects: subject_id}, {creation_date: -1}, 6, 0, function(err, link_items){
                console.log(link_items);
                cbk(err, link_items);
            });
        }
    ], function(err, results){
        var subject = results[0],
            information_items = results[1].objects,
            links = results[2].objects;
        if(err)
            res.render('500.ejs',{error:err});
        else {
            if(!subject)
                res.redirect('/');
            else
                res.render('subject_new.ejs', {
                    subject: subject,
                    logged: req.isAuthenticated(),
                    user: req.user,
                    avatar:req.session.avatar_url,
                    user_logged: req.isAuthenticated(),
                    url:req.url,
                    information_items: information_items || [],
                    links: links || []
                });
        }
    });
};
