module.exports = function(req, res){
    var models = require('../../models');
    var doc = models.General.getGeneral();
    var host = req.get('host');
    var config = require('../../config.js');
    var _ = require('underscore');

    if(!_.find(config.hosts, function(hst){return hst == host; })){
        console.log('hosting_subject');
        models.Subject.findOne().where('host_details.host_address', 'http://' + req.get('host')).exec(function(err, subject){
            if(err || !subject) throw new Error('Subject with this host was not found');
            res.redirect('discussions/subject/' + subject._id);
        });
    } else {
        console.log('index_new');
        res.render('index_new.ejs', {
            welcome_pre_title:doc.welcome_pre_title || "ברוכים הבאים",
            welcome_title: doc.welcome_title || "למעגלי השיח",
            text: doc.text || "נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. אודיפו בלאסטיק מונופץ קליר, בנפת נפקט למסון וענוף להאמית קרהשק סכעיט דז מא, מנכם למטכין נשואי מנורך גולר מונפרר סוברט לורם שבצק יהול."
        });
    }
};