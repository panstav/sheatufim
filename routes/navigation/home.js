module.exports = function(req, res){
    var models = require('../../models');
    var doc = models.General.getGeneral();
    var host = req.get('host');

    if(host != 'www.sheatufim-roundtable.org.il' && host != 'www.sheatufim-roundtable.org.il:8080' && host != 'localhost:8080'){
       console.log("req.get('host')", req.get('host'));
        models.Subject.findOne().where('host', 'http://' + req.get('host')).exec(function(err, discussion){
            if(err || !discussion) return err;

            res.redirect(host + 'discussions/subject/' + discussion._id);
        });
    } else {
        res.render('index_new.ejs', {
            welcome_pre_title:doc.welcome_pre_title || "ברוכים הבאים",
            welcome_title: doc.welcome_title || "למעגלי השיח",
            text: doc.text || "נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. אודיפו בלאסטיק מונופץ קליר, בנפת נפקט למסון וענוף להאמית קרהשק סכעיט דז מא, מנכם למטכין נשואי מנורך גולר מונפרר סוברט לורם שבצק יהול."
        });
    }
};