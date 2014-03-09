var jest = require('jest'),
    models = require('../models'),
    common = require('./common'),
    _ = require('underscore');

var UserMailNotificationConfig = module.exports = jest.MongooseResource.extend({
    init: function () {
        this._super(models.User, null);
        this.fields = _.extend({
            mail_notification_configuration: null,
            discussions: null
        }, common.user_public_fields);
        //this.update_fields = {discussions:null, mail_notification_configuration:null};
        this.allowed_methods = ['get', 'put'];
    },

    update_obj: function (req, object, callback) {
        var mail_settings = req.body;

        models.User.findById(object.id, function (err, user) {
            for(var key in mail_settings.mail_notification_configuration){
                user.mail_notification_configuration[key] = (mail_settings.mail_notification_configuration[key] == 'true');
            }
            user.save(function(err, usr){
                callback(err, usr);
            });
        });
    }
});