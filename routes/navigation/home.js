module.exports = function(req, res){
    var models = require('../../models');

    models.General.findOne({}, function(err, doc){
        res.render('index_new.ejs', {
         welcome_pre_title:doc.welcome_pre_title,
         welcome_title: doc.welcome_title,
         text: doc.text
         });
    })

}