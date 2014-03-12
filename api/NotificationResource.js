var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    sugar = require('sugar'),
    _  = require('underscore');

var NotificationCategoryResource = module.exports = resources.MongooseResource.extend(
    {
        init:function () {
            this._super(models.Notification);
            this.allowed_methods = ['get'];
            this.authentication = new common.SessionAuthentication();
            this.update_fields = {name:null};
            this.default_query = function (query) {
                return query.sort({'update_date': 'descending'});
            };
            this.filtering = {visited: null};
            this.fields = {
                _id:null,
                user_id:null,
                notificators:{
                    sub_entity_id: null,
                    notificator_id: null,
                    ballance: null,
                    votes_for: null,
                    votes_against: null,
                    first_name:null,
                    last_name:null,
                    avatar_url:null
                },
                entity_id: null,
                name: null,
                update_date:null,
                visited: null,

                pic:null,
                //text only
                part_one: null,
                //text with link
                part_two: null,
                link_two:null,
                //text only
                part_three: null,
                //text with link
                part_four: null,
                link_four: null,
                //text only
                part_five: null,
                //post text
                text: null,

                link_to_first_comment_user_didnt_see: null,
                discussion_link: null,

                //extra text is the text displayed before the button
                extra_text: null,
                main_link: null,

                //for user part
                user_link: null,
                user: null,

                //for "join" button
                is_going: null,
                check_going: null,

                //for the share part
                img_src: null,
                title: null,
                text_preview: null,

                //for mail_settings part
                mail_settings_link: null

            }
        },

        get_objects:function (req, filters, sorts, limit, offset, callback) {
            var user_id = req.query.user_id;
            if (!user_id && req.user)
                user_id = req.user.id;

            if (user_id)
                filters['user_id'] = user_id;
            if(req.query.filters == 'visited'){
                filters.visited = 'false';
            }

            this._super(req, filters, sorts, limit, offset, function (err, results) {

                if(err)
                    callback(err);
                else
                    populateNotifications(results, user_id, function(err, results){
                        callback(err, results);
                    });
            });
        }
    });


var iterator = function (users_hash, discussions_hash, posts_hash, info_items_hash, subjects_hash, user_id) {
    return function (notification, itr_cbk) {
        {
            var user_obj = notification.notificators.length ?
                users_hash[notification.notificators[0].notificator_id] : null;
            var discussion = discussions_hash[notification.entity_id + ''] || discussions_hash[notification.notificators[0].sub_entity_id + ''];
            var info_item = info_items_hash[notification.entity_id + ''] || info_items_hash[notification.notificators[0].sub_entity_id + ''];
            var post = posts_hash[notification.entity_id + ''] || posts_hash[notification.notificators[0].sub_entity_id + ''];
            var post_id = post ? post._id : "";
            var subject = subjects_hash[notification.entity_id + ''] || subjects_hash[notification.notificators[0].sub_entity_id + ''];

            switch (notification.type) {
                case "approved_info_item_i_created":
                    notification.part_one = "פריט מידע שיצרת התקבל למערכת: ";
                    if(info_item){
                        notification.main_link = "/information_items/" + info_item._id;
                        notification.pic = info_item.image_field_preview || info_item.image_field;
                        notification.part_two = info_item.title;
                        notification.link_two = "/information_items/" + info_item._id;
                    }
                    itr_cbk();
                    break;

                case "change_suggestion_on_discussion_you_are_part_of":
                    var num_of_comments = notification.notificators.length;
                    if(discussion){
                        notification.main_link = notification.url + '#' + post._id.toString();
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id + "";
                    }
                    if (num_of_comments > 1) {
                        notification.part_one = "נוספו " + num_of_comments + " הצעות לשינוי למסמך ";
                    } else {
                        notification.part_one = "נוספה הצעה חדשה לשינוי למסמך ";
                    }
                    itr_cbk();
                    break;

                case "comment_on_discussion_you_created" :
                    var num_of_comments = notification.notificators.length;
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + "#post" + post_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id + "";

                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = discussion.text_field_preview;
                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                    }

                    if (num_of_comments > 1) {
                        notification.user = num_of_comments + " " + "אנשים";
                        notification.part_one = " הגיבו על דיון שיצרת - ";
                        itr_cbk(null, 1);
                    } else {
                        if(user_obj){
                            notification.user = user_obj.first_name + " " + user_obj.last_name;
                            notification.user_link = "/myuru/" + user_obj._id + "";
                            notification.pic = user_obj.avatar_url();
                        }
                        notification.part_one = " הגיב על דיון שיצרת - ";
                        itr_cbk();
                    }
                    break;

                case "change_suggestion_on_discussion_you_created":
                    var num_of_comments = notification.notificators.length;
                    if(discussion){
                        notification.main_link = notification.url;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id + "";

//                        notification.img_src = notification.pic;
//                        notification.title = discussion.title;
//                        notification.text_preview = notification.text_field_preview;
//                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                    }
                    if (num_of_comments > 1) {
                        notification.user =  "נוספו " + num_of_comments;
                        notification.part_one = " הצעות חדשות לשינוי למסמך ";
                    } else {
                        notification.part_one = "נוספה הצעה חדשה לשינוי למסמך ";
                    }
                    itr_cbk();
                    break;

                case "approved_change_suggestion_you_created":
                    notification.part_one = "התקבלה הצעה לשינוי שהעלת בדיון - ";
                    if(discussion){
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;
                        notification.main_link = "/discussions/" + discussion._id + '#post_' + post_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;

                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = discussion.text_field_preview;

                        /*//SAAR: is this still used?
                        notification.old_text= discussion.vision_text_history == undefined?'': discussion.vision_text_history[discussion.vision_text_history.length - 1];
                        notification.new_text= discussion.text_field;*/

                        notification.old_text = discussion.replaced_text_history == undefined?'': discussion.replaced_text_history[discussion.replaced_text_history.length - 1].old_text;
                        notification.new_text = discussion.replaced_text_history == undefined?'': discussion.replaced_text_history[discussion.replaced_text_history.length - 1].new_text;
                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                    }
                    itr_cbk();
                    break;

                case "approved_change_suggestion_on_discussion_you_are_part_of":

                    notification.main_link = notification.url;
                    notification.part_one = "התקבלה הצעה לשינוי למסמך ";
                    if(discussion){
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;
                    }
                    notification.part_three = " והטקסט בו עודכן";
                    itr_cbk();
                    break;

                case "new_discussion":
                    if(discussion){
                        notification.part_one = discussion.subject_name;
                        notification.main_link = "/discussions/" + discussion._id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;

                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = discussion.text_field_preview;
                    }
                    if(user_obj){
                        notification.user = user_obj.first_name + " " + user_obj.last_name;
                    }
                    itr_cbk();
                    break;

                case "comment_on_subject_you_are_part_of":
                    var num_of_joined = notification.notificators.length;
                    if(num_of_joined > 1){
                        notification.part_one = "נוספו "
                            + num_of_joined +  " הודעות חדשות לפורום של "
                    } else {
                        if(user_obj){
                            notification.part_one = user_obj.first_name + ' ' + user_obj.last_name + ' ' +   "פרסם/ה הודעה חדשה בפורום של ";
                            notification.user = user_obj.first_name + ' ' + user_obj.last_name;
                        }
                    }

                    if(subject){
                        notification.link_two = "/discussions/subject/" + subject._id;
                        notification.part_two = subject.name;
                    }
                    notification.main_link = notification.url;
                    notification.extra_text = post.toObject().text;
                    itr_cbk();
                    break;

                case "comment_on_discussion_you_are_part_of":
                    var num_of_joined = notification.notificators.length;
                    if(num_of_joined > 1){
                        notification.part_one = "נוספו "
                            + num_of_joined +  " הודעות חדשות למסמך "
                    } else {
                        if(user_obj){
                            notification.part_one = "הודעה חדשה בעמוד המסמך ";
                        }
                    }

                    if(discussion){
                        notification.link_two = "/discussions/" + discussion._id + '#' + post._id;
                        notification.part_two = discussion.title;
                    }
                    notification.main_link = notification.url;
                    itr_cbk();
                    break;

                case "comment_on_your_post":
                    var num_of_joined = notification.notificators.length;
                    if(num_of_joined > 1){
                        notification.part_one = "נוספו " + 
                            num_of_joined +
                            " תגובות חדשות על הודעה שכתבת בפורום מעגל השיח "
                    } else {
                        if(user_obj){
                            notification.part_one = " הגיב/ה להודעה שכתבת בפורום מעגל השיח ";
                            notification.user = user_obj.first_name + " " + user_obj.last_name;
                        }
                    }

                    notification.main_link = notification.url;
                    itr_cbk();
                    break;

                case "comment_on_your_forum_post":
                    var num_of_joined = notification.notificators.length;
                    if(num_of_joined > 1){
                        notification.part_one = "נוספו " +
                            num_of_joined +
                            " תגובות חדשות להודעה שהעלית בפורום של "
                    } else {
                        if(user_obj){
                            notification.user = user_obj.first_name + " " + user_obj.last_name;
                            notification.part_one = " פרסם/ה תגובה חדשה להודעה שלך בפורום של ";
                        }
                    }
                    if(subject){
                        notification.link_two = "/discussions/subject/" + subject._id;
                        notification.part_two = subject.name;
                    }
                    notification.main_link = notification.url;
                    notification.extra_text = post.toObject().text;
                    itr_cbk();
                    break;

                case "comment_on_your_discussion_post":
                    var num_of_joined = notification.notificators.length;
                    if(num_of_joined > 1){
                        notification.part_one = "נוספו " +
                            num_of_joined +
                            " תגובות חדשות להודעה שלך בעמוד המסמך "
                    } else {
                        if(user_obj){
                            notification.part_one = "תגובה חדשה להודעה שלך בעמוד המסמך ";
                        }
                    }
                    if(discussion){
                        notification.link_two = "/discussions/" + discussion._id + '#' + post._id;
                        notification.part_two = discussion.title;
                    }
                    notification.main_link = notification.url;
                    itr_cbk();
                    break;
                case "comment_on_change_suggestion_i_created":
                    var num_of_joined = notification.notificators.length;
                    if(num_of_joined > 1){
                        notification.part_one = "נוספו "
                            + num_of_joined +  " תגובות חדשות להצעה לשינוי שהעלית למסמך "
                    } else {
                        if(user_obj){
                            notification.part_one = "נוספה תגובה חדשה להצעה לשינוי שהעלית למסמך ";
                        }
                    }

                    if(discussion){
                        notification.link_two = "/discussions/" + discussion._id;
                        notification.part_two = discussion.title;
                    }
                    notification.main_link = notification.url + '#' + post._id;
                    itr_cbk();
                    break;
                case "new_information_item_on_subject_you_are_part_of":

                    notification.part_one = "פריט מידע חדש נוסף למעגל השיח ";
                    if(subject){
                        notification.link_two = "/discussions/subject/" + subject._id;
                        notification.part_two = subject.name;
                    }
                    notification.part_three = ' : "' + info_item.title + '"';
                    notification.main_link = notification.url;
                    itr_cbk();
                    break;
                case "new_discussion_in_subject_you_are_part_of":
                    if(subject){
                        notification.part_one = "מסמך חדש נפתח לעריכה במעגל השיח ";
                        notification.part_two = subject.name;
                        notification.link_two = "/discussions/subject/" + subject._id;
                    }
                    if(user_obj){
                        notification.extra_text = "המסמך הועלה על ידי " + user_obj.first_name + " " + user_obj.last_name;
                    }
                    if(discussion) {
                        notification.text = "המסמך פתוח לעריכה למשך: " + calc_time_until(discussion.deadline);
                        notification.part_three = ": ";
                        notification.part_four = '"' + discussion.title + '"';
                        notification.link_four = notification.url;
                    }
                    notification.main_link = notification.url;
                    itr_cbk();
                    break;
                default:
                    itr_cbk({message: "there is no such notification type", code: 404});
            }
        }
    };
};

var calc_time_until = function(date_obj){
    var date = Date.create(date_obj),
        days = date.daysFromNow(),
        hours = date.hoursFromNow() - (days * 24),
        minutes = date.minutesFromNow() - (days * 1440) - (hours * 60);

    return days + " ימים, " + hours + " שעות ו-" + minutes + " דקות ";
};

var populateNotifications = module.exports.populateNotifications = function(results, user_id, callback) {
    //formulate notifications
    var notificator_ids = _.chain(results.objects)
        .map(function (notification) {
            return notification.notificators.length ? notification.notificators[0].notificator_id : null;
        })
        .compact()
        .uniq()
        .value();

    var post_or_suggestion_notification_types = [
        "comment_on_change_suggestion_i_created"
    ];

    var post_notification_types = [
        "comment_on_discussion_you_are_part_of",
        "comment_on_discussion_you_created",
        "change_suggestion_on_discussion_you_are_part_of",
        "change_suggestion_on_discussion_you_created",
        "approved_change_suggestion_you_created",
        "approved_change_suggestion_on_discussion_you_are_part_of",
        "comment_on_subject_you_are_part_of",
        "comment_on_your_forum_post",
        "comment_on_your_discussion_post"

    ];

    var discussion_notification_types = [
        "new_discussion_in_subject_you_are_part_of",
        "comment_on_discussion_you_are_part_of",
        "comment_on_discussion_you_created"
    ];

    var discussion_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(discussion_notification_types, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var discussion_notification_types_as_sub_entity = [
        "comment_on_discussion_you_are_part_of",
        "comment_on_discussion_you_created",
        "change_suggestion_on_discussion_you_are_part_of",
        "change_suggestion_on_discussion_you_created",
        "approved_change_suggestion_you_created",
        "approved_change_suggestion_on_discussion_you_are_part_of",
        "comment_on_your_discussion_post",
        "comment_on_change_suggestion_i_created"
    ];

    var discussion_ids_as_sub_entity = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(discussion_notification_types_as_sub_entity, notification.type) > -1
                ? notification.notificators[0].sub_entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    discussion_ids_as_sub_entity = _.chain(discussion_ids_as_sub_entity)
        .compact()
        .uniq()
        .value();

    discussion_ids = _.union(discussion_ids, discussion_ids_as_sub_entity);
    discussion_ids = _.chain(discussion_ids).map(function(id) { return id + ''; })
        .compact()
        .uniq()
        .value();

    var subject_notification_types_as_sub_entity = [
        "comment_on_subject_you_are_part_of",
        "comment_on_your_forum_post",
        "new_information_item_on_subject_you_are_part_of",
        "new_discussion_in_subject_you_are_part_of"
    ];

    var subject_ids_as_sub_entity = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(subject_notification_types_as_sub_entity, notification.type) > -1
                ? notification.notificators[0].sub_entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    subject_ids_as_sub_entity = _.chain(subject_ids_as_sub_entity)
        .compact()
        .uniq()
        .value();

    var post_or_suggestion_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(post_or_suggestion_notification_types, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var post_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(post_notification_types, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    post_ids = _.union(post_ids, post_or_suggestion_ids);

    var info_item_notification_types = [
        "new_information_item_on_subject_you_are_part_of"
//                    "approved_info_item_i_liked"
    ];

    var info_items_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(info_item_notification_types, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    async.parallel([
        function(cbk){
            if(notificator_ids.length)
                models.User.find({}, {
                        'id':1,
                        'first_name':1,
                        'last_name':1,
                        'facebook_id':1,
                        'avatar':1})
                    .where('_id').in(notificator_ids)
                    .exec(function (err, users) {
                        if(!err){
                            var users_hash = {};

                            _.each(users, function (user) {
                                users_hash[user.id] = user;
                            });
                        }
                        cbk(err, users_hash);
                    });
            else
                cbk(null,{});
        },

        function(cbk){
            if(discussion_ids.length)
                models.Discussion.find()
                    .where('_id')
                    .in(discussion_ids)
                    .select({
                    'id':1,
                    'title':1,
                        'image_field_preview':1, 'image_field':1, 'text_field_preview':1,'vision_text_history':1,'text_field':1, 'subject_name':1, 'deadline':1})
                    .exec(function (err, discussions) {

                        var got_ids = _.pluck(discussions,'id');
                        var not_found_ids = _.without(discussion_ids,got_ids);
                        if(not_found_ids.length)
                            console.log(not_found_ids);
                        if(!err){
                            var discussions_hash = {};

                            _.each(discussions, function (discussion) {
                                discussions_hash[discussion.id] = discussion;
                            });
                        }
                        cbk(err, discussions_hash);
                    });
            else
                cbk(null,{});
        },

        function(cbk){
            if(post_ids.length)
                models.PostOrSuggestion.find({},{'id':1, 'text':1})
                    .where('_id').in(post_ids)
                    .exec(function (err, posts_items) {

                        if(!err){
                            var post_items_hash = {};

                            _.each(posts_items, function (post_item) {
                                post_items_hash[post_item.id] = post_item;
                            });
                        }
                        cbk(err, post_items_hash);
                    });
            else
                cbk(null,{});
        },

        function(cbk){
            if(info_items_ids.length)
                models.InformationItem.find({},
                    {'id':1,
                        'image_field_preview':1,
                        'image_field':1,
                        'title':1
                    })
                    .where('_id').in(info_items_ids)
                    .exec(function (err, info_items) {

                        if(!err){
                            var info_items_hash = {};

                            _.each(info_items, function (info_item) {
                                info_items_hash[info_item.id] = info_item;
                            });
                        }
                        cbk(err, info_items_hash);
                    });
            else
                cbk(null,{});
        },
        function(cbk){
            if(subject_ids_as_sub_entity.length){
                models.Subject.find()
                    .where('_id').in(subject_ids_as_sub_entity)
                    .select({'_id': 1, 'name': 1})
                    .exec(function(err, subjects){
                        if(!err){
                            var subjects_hash = {};

                            _.each(subjects, function(subject){
                                subjects_hash[subject._id] = subject;
                            });
                        }
                        cbk(err, subjects_hash);
                    })
            }else
                cbk(null,{});
        }
    ], function(err, args){
        async.forEach(results.objects, iterator(args[0], args[1], args[2], args[3], args[4], user_id), function (err, obj) {
            callback(err, results);
        })
    })
};

function getLatestNotificator(notificators_arr){
   return _.max(notificators_arr, function(noti){ return noti.date; });
}

