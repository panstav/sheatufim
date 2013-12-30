module.exports = function(req, res){
    var models = require('../../models');
    var doc = models.General.getGeneral();

    res.render('index_new.ejs', {
         welcome_pre_title:doc.welcome_pre_title || "ברוכים הבאים",
         welcome_title: doc.welcome_title || "לזירות השיח",
         text: doc.text || "נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. אודיפו בלאסטיק מונופץ קליר, בנפת נפקט למסון וענוף להאמית קרהשק סכעיט דז מא, מנכם למטכין נשואי מנורך גולר מונפרר סוברט לורם שבצק יהול."
     });
}