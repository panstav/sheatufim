/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/05/12
 * Time: 13:19
 * To change this template use File | Settings | File Templates.
 */
var SEND_MAIL_NOTIFICATION = true;

var models = require('../models'),
    async = require('async'),
    notificationResource = require('./NotificationResource'),
    templates = require('../lib/templates'),
    mail = require('../lib/mail'),
    config = require('../config'),
    _ = require('underscore');


exports.create_user_notification = create_user_notification = function (notification_type, entity_id, user_id, notificatior_id, sub_entity, url, no_mail, callback) {

    if(typeof no_mail === 'function' && typeof callback !== 'function'){
        callback = no_mail;
        no_mail = null;
    }

    var single_notification_arr = [
        "new_discussion",
        "approved_change_suggestion_you_created",
        "approved_change_suggestion_on_discussion_you_are_part_of",
        "new_information_item_on_subject_you_are_part_of",
        "new_discussion_in_subject_you_are_part_of",
        "new_question_in_subject_you_are_part_of"
    ];

    var multi_notification_arr = [
        'comment_on_discussion_you_are_part_of',
        "comment_on_discussion_you_created",
        "comment_on_subject_you_are_part_of",
        "comment_on_your_forum_post",
        "comment_on_your_discussion_post",
        "comment_on_change_suggestion_i_created",
        "change_suggestion_on_discussion_you_created",
        "change_suggestion_on_discussion_you_are_part_of",
        "comment_on_question_in_subject_you_are_part_of"
    ];

    if (notificatior_id && _.indexOf(single_notification_arr, notification_type) == -1) {

        async.waterfall([
            //find existing notification
            function (cbk) {
                notification_type = notification_type + "";
                if (_.contains(multi_notification_arr, notification_type) && sub_entity) {
                    models.Notification.findOne({type:notification_type, 'notificators.sub_entity_id':sub_entity, user_id:user_id, visited: false}, function (err, obj) {
                        cbk(err, obj);
                    });
                }
                else if (entity_id)
                    models.Notification.findOne({type:notification_type, entity_id:entity_id, user_id:user_id}, function (err, obj) {
                        cbk(err, obj);
                    });
                else
                    models.Notification.findOne({type:notification_type, user_id:user_id}, function (err, obj) {
                        cbk(err, obj);
                    });
            },
            function(noti, cbk){
                //check if mail needs to be sent
                if(noti){
                    if(noti.visited)
                        cbk(null, noti, true);
                    else
                        cbk(null, noti, false);
                } else {
                    cbk(null, noti, true);
                }
            },
            function (noti, send_mail, cbk) {
                if (noti) {
                    noti.seen = false;
                    noti.visited = false;
                    noti.update_date = Date.now();

                    var new_notificator = {
                            notificator_id:notificatior_id,
                            sub_entity_id:sub_entity
                        },
                        notificator_exists = _.any(noti.notificators, function (notificator) {
                            return notificator.notificator_id + "" == notificatior_id + ""
                        });

                    if(notificator_exists) {
                        if(_.contains(multi_notification_arr, notification_type)) {
                            noti.notificators.push(new_notificator);
                        }
                    } else {
                        noti.notificators.push(new_notificator);
                    }

                    noti.save(function(err, obj){
                        if(!err && send_mail) {
                            sendNotificationToUser(obj);
                        }
                        cbk(err, obj);
                    });

                } else {
                    create_new_notification(notification_type, entity_id, user_id, notificatior_id, sub_entity, url, !send_mail, function (err, obj) {
                        cbk(err, obj);
                    });
                }
            }
        ],
        function (err, obj) {
            callback(err, obj);
        });
    } else {
        create_new_notification(notification_type, entity_id, user_id, notificatior_id, sub_entity, url, no_mail,function (err, obj) {
            callback(err, obj);
        });
    }
};

var create_new_notification = function (notification_type, entity_id, user_id, notificatior_id, sub_entity_id, url, no_mail, callback) {

    if(typeof no_mail === 'function' && typeof callback !== 'function'){
        callback = no_mail;
        no_mail = null;
    }

    var notification = new models.Notification();
    var notificator = {
        notificator_id:notificatior_id ? notificatior_id : null,
        sub_entity_id:sub_entity_id
    };

    notification.user_id = user_id;
    notification.notificators = notificator;
    notification.type = notification_type;
    notification.entity_id = entity_id;
    notification.url = url;
    notification.seen = false;
    notification.update_date = new Date();
    notification.visited = false;

    notification.save(function (err, obj) {
        if (err)
            console.error(err);
        callback(null, obj || notification);
        if (!err && obj && !no_mail)
            sendNotificationToUser(obj);
    });
};

/***
 * Send notification to user through mail or other external API
 * Checks if user should receive notification according to settings
 * @param notification
 * Notification object
 * @param last_update_date
 * notification last update date, or null if the notification is new
 * @param callback
 * function(err)
 */
var sendNotificationToUser = function (notification) {
    /**
     * Waterfall:
     * 1) Get user email
     * 2) Check user mail configuration
     * 3) create text message
     * 4) send message
     */

    var email;
    var  uru_group = [
        'saarsta@gmail.com',
        'themarianne@gmail.com',
        'maria@empeeric.com',
        'aharon.porath@gmail.com',
        'aharon@uru.org.il',
        'miriyaacobi@gmail.com',
        'miri@sheatufim.org.il',
        'ziv@sheatufim.co.il',
        'zivm21@gmail.com',
        'ziv@sheatufim.org.il'
    ];

    if (SEND_MAIL_NOTIFICATION)
        async.waterfall([
            // 1) Get user email
            function (cbk) {
                models.User.findById(notification.user_id, cbk);
            },

            // 2) Check user mail configuration
            function(user, cbk){
                if(user && user.mail_notification_configuration['get_alert_of_' + notification.type] && user.mail_notification_configuration.get_mails){
                    cbk(null, user);
                } else {
                    console.log('User should not receive mail because of his mail configuration');
                    cbk('break');
                }
            },

            // 3.1) create text message
            function(user, cbk){
                // notification populate references by notification type
                email = user.email;
                if (!_.find(uru_group, function(_mail){return _mail == email})){
                    console.error('not in uru group');
                    return cbk('not in uru group')
                }
                notificationResource.populateNotifications({objects:[notification]}, user.id, function(err, result){
                    cbk(err, result);
                });
            },

            // 3.2) create text message
            function (results, cbk) {
                var notification = results.objects[0];

                notification.entity_name = notification.name || '';
                notification.description_of_notificators = notification.description_of_notificators || '';
                notification.message_of_notificators = notification.message_of_notificators || '';
                templates.renderTemplate('notifications/' + notification.type, notification, function(err, result){
                    cbk(err, result);
                });
            },
            // 4) send message
            function (message, cbk) {
                mail.sendMailFromTemplate(email, message, cbk);
            }
        ],
            // Final
            function (err) {
                if (err) {
                    if (err != 'break') {
                        /*console.error('failed sending notification to user');
                        console.error(err);
                        console.trace();*/
                    }
                }
                else {
                    console.log('email ' + notification.type + ' sent to ' + email);
                    notification.visited = false;
                    notification.mail_was_sent = true;

                    notification.save(function (err) {
                        if (err) {
                            console.error('saving notification flag failed');
                        }
                    });
                }
            });
};

exports.update_user_notification = function (notification_type, obj_id, user, callback) {


};

exports.updateVisited = function (user, url) {
    models.Notification.update({user_id:user._id, url:url}, {$set:{visited:true}}, {multi:true}, function (err, count) {
        if (err) {
            console.error('failed setting notification visited to true', err);
        }
    })
};

function updateNotificationToSendMail(noti){
    models.Notification.update({_id: noti._id}, {$set: {mail_was_sent: false}}, function(err, num){
        if(err){
            console.error("could not set notification mail_was_sent flag to false");
            console.error(err);
        }
    })
}

models.InformationItem.onPreSave(function(next){
    var self = this;

    if(self.isNew) {
        async.each(self.subjects, function(subject_id, callback){
            models.User.find().where('subjects', subject_id).exec(function(err, users){
                if(err) next();
                async.each(users, function(user, cbk){
                    create_user_notification("new_information_item_on_subject_you_are_part_of", self._id, user._id, user._id, subject_id, "/discussions/subject/" + subject_id, function (err, results) {
                        cbk(err, results);
                    });
                }, function(err){
                    callback(err);
                });
            });
        } ,function(err){
            next();
        });
    } else {
        next();
    }
});

models.Discussion.onPreSave(function(next){
    var self = this;

    if(self.isNew) {
        models.User.find().where('subjects', self.subject_id).exec(function(err, users){
            if(err) next();
            async.each(users, function(user, cbk){
                create_user_notification("new_discussion_in_subject_you_are_part_of", self._id, user._id, self.creator_id, self.subject_id, "/discussions/" + self._id.toString(), function (err, results) {
                    cbk(err, results);
                });
            }, function(err){
                next();
            });
        });
    } else {
        next();
    }
});

models.Question.onPreSave(function(next){
    var self = this;

    if(self.isNew) {
        models.User.find().where('subjects', self.subject_id).exec(function(err, users){
            if(err) next();
            async.each(users, function(user, cbk){
                create_user_notification("new_question_in_subject_you_are_part_of", self._id, user._id, user._id, self.subject_id, "/discussions/subject/" + self.subject_id, function (err, results) {
                    cbk(err, results);
                });
            }, function(err){
                next();
            });
        });
    } else {
        next();
    }
});

//approved_info_item_i_created
if (/notifications\.js/.test(process.argv[1])) {
    var app = require('../app');

    console.log('testing');
    //function(notification_type, entity_id, user_id, notificatior_id, sub_entity_id, callback){
    //4f90064e360b9b01000000ac --info item
    //4fcdf7180a381201000005b3 --disc

    //a_dicussion_created_with_info_item_that_you_created
    //  sub //4fce400ccdd0570100000216

    //501fcef1e6ae520017000662 --הצעה לשינוי שהתקבלה
    setTimeout(function () {
        create_new_notification('comment_on_discussion_you_created',
            '4fcdf7180a381201000005b3', '4ff1b29aabf64e440f00013a', '4f45145968766b0100000002', '501fcef1e6ae520017000662', function (err) {
                console.log(err);
            });

    }, 1000);
}