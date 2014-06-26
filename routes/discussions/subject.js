var models = require('../../models'),
    SubjectResource = require('../../api/SubjectResource.js'),
    notifications = require('../../api/notifications.js');


module.exports = function(req,res) {
    var subject_id = req.params[0];
    var subject_resource = new SubjectResource();
    var user = req.user;

    subject_resource.get_object(req, subject_id, function(err, result){
        if(err) {
            res.render('500.ejs',{error:err});
        } else {
            res.render('subject_new.ejs', {
                subject: result,
                logged: req.isAuthenticated(),
                user: user && {_id: user._id, first_name: user.first_name, last_name: user.last_name, occupation: user.occupation},
                avatar: req.session.avatar_url,
                user_logged: req.isAuthenticated(),
                url: req.url
            });
            if (user)
                var path = req.path.indexOf('#') == -1 ? req.path : req.path.substr(0, req.path.indexOf('#'));
            notifications.updateVisited(user, req.path);
        }

    });
};
//    async.parallel([
//        function(cbk) {
//
//        },
//
//        function(cbk){
//            information_item_resource.get_objects(req, {subjects: subject_id}, {creation_date: -1}, 3, 0, function(err, information_items){
//                console.log(information_items);
//                cbk(err, information_items);
//            });
//        },
//        function(cbk){
//            links_resource.get_objects(req, {subjects: subject_id}, {creation_date: -1}, 6, 0, function(err, link_items){
//                console.log(link_items);
//                cbk(err, link_items);
//            });
//        }
//    ], function(err, results){
//        var subject = results[0],
//            information_items = results[1].objects,
//            links = results[2].objects;
//        if(err)
//            res.render('500.ejs',{error:err});
//        else {
//            if(!subject)
//                res.redirect('/');
//            else
//                res.render('subject_new.ejs', {
//                    subject: subject,
//                    logged: req.isAuthenticated(),
//                    user: req.user,
//                    avatar:req.session.avatar_url,
//                    user_logged: req.isAuthenticated(),
//                    url:req.url,
//                    information_items: information_items || [],
//                    links: links || []
//                });
//        }
//    });

