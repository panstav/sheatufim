var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,

    common = require('./common'),
    utils = require('./../utils'),
    async = require('async'),
    _ = require('underscore');


var MinLengthValidator = function (min) {
    return [function (value) {
        return value && value.length >= min;
    }, 'Name must contain at least ' + min + ' letters'];
};

var RegexValidator = function (regex) {
    return [function (value) {
        return value && regex.exec(value)
    }, 'Value is not at the correct pattern'];
};

var User = module.exports = new Schema({

    //this is for validation
    is_activated: {type: Boolean, 'default': true},
    has_reset_password: {type: Boolean, 'default': false},
    is_suspended: {type: Boolean, 'default': false},
    identity_provider:{type:String, "enum":['facebook', 'register'], 'default': 'register'},
    facebook_id: {type: String, editable:false},
    access_token: {type: String, editable:false},
    first_name:{type:String, required:true, validate:MinLengthValidator(2)},
    last_name:{type:String, required:false},
    email:{type:String, required:true},//, match:/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/},
    gender:{type:String, "enum":['male', 'female']},
    age:{type:Number, min:0},
    last_visit:{type:Date,'default':Date.now},
    address: String,
    occupation: String,
    biography: String,
    invitation_code: {type: String, editable:false},
    //followers - in the redesign it is the same as discussion.users
    discussions:[
        new Schema({
            discussion_id:{type:ObjectId, ref:'Discussion', limit: 1000},
            join_date: {type:Date, 'default':Date.now},
            time_of_alert: {type:String, "enum":['now', 'today', 'this_week'], 'default': 'now'},
        })
    ],
// List of subject ref ids, that the user is authorized to view
    subjects:[{type:ObjectId, ref:'Subject',query:common.SUBJECT_QUERY,help:'Add subject that this user is authorized to view'}],

    password: {type: String, editable:false},
    validation_code: {type: String, editable:false},

    updates: {type:Schema.Types.Mixed,editable:false},

    avatar : Schema.Types.File,
    sent_mail: {type:Date,editable:false},
    actions_done_by_user:{
        create_object:false,
        post_on_object:false,
        suggestion_on_object:false,
        grade_object:false,
        vote_on_object:false,
        join_to_object:false
    },
    no_mail_notifications: {type : Boolean, "default": true},
    mail_notification_configuration: {

        // general
        get_mails: {type: Boolean, 'default': true},
        get_alert_of_new_discussion_in_subject_you_are_part_of: {type: Boolean, 'default': true},
        get_alert_of_new_information_item_on_subject_you_are_part_of: {type: Boolean, 'default': false},
        get_alert_of_new_question_in_subject_you_are_part_of: {type: Boolean, 'default': true},
        get_alert_of_comment_on_question_in_subject_you_are_part_of: {type: Boolean, 'default': false},


        //general forum
        get_alert_of_comment_on_subject_you_are_part_of: {type: Boolean, 'default': false},
        get_alert_of_comment_on_your_forum_post: {type: Boolean, 'default': false},

        //general discussions
        get_alert_of_comment_on_discussion_you_are_part_of: {type: Boolean, 'default': false},
        get_alert_of_comment_on_your_discussion_post: {type: Boolean, 'default': false},
        get_alert_of_change_suggestion_on_discussion_you_are_part_of: {type: Boolean, 'default': false},
        get_alert_of_comment_on_change_suggestion_i_created: {type: Boolean, 'default': false},
        get_alert_of_approved_change_suggestion_on_discussion_you_are_part_of: {type: Boolean, 'default': false}

    }
}, {strict:false});

User.methods.toString = function()
{
    var parts = [];
    if(this.first_name)
        parts.push(this.first_name);
    if(this.last_name)
        parts.push(this.last_name);
    return parts.join(' ');
};

User.methods.avatar_url = function()
{
    if(this.avatar && this.avatar.url)
        return this.avatar.url;
    else
        return this.facebook_id ? 'http://graph.facebook.com/' + this.facebook_id + '/picture/?type=large' : "/images/default_user_img.gif";
};



/**
 * Post-init hook - save a copy of subject list
 */
User.post('init',function(){
    this._lastSubjects = (this.subjects || []).map(function(subject) { return subject + ''; });
});

/**
 * Pre-save hook - check is subject list was changed.
 * If so, collect new subjects and notify user
 */
User.pre('save',function(next){

    var is_new = this.isNew;
    if(!this._lastSubjects && !is_new)
        return next();

    // get new subjects ids
    var newSubjectList = (this.subjects || []).map(function(subject) { return subject + '';});
    var newSubjects = _.difference(newSubjectList,this._lastSubjects || []);
    delete this._lastSubjects;
    // continue
    next();
    if(!newSubjects.length && !is_new)
        return;


    var self = this;
    // get subject objects
    mongoose.model('Subject').find()
        .where('_id').in(newSubjects)
        .exec(function(err,subjects){
            if(err) return console.error('Error getting subjects from DB with ids ' + newSubjects,err);

            if(!subjects.length) return;

            var firstSubjectUrl = '/discussions/subject/' + subjects[0].id;
            var redirect_to = require('../routes/account/common').DEFAULT_LOGIN_REDIRECT;
            var host_title = "שיתופים",
                root_path = "http://www.sheatufim-roundtable.org.il/",
                email_details = {
                    is_sheatufim_flag: true
                };

            if(subjects[0].is_no_sheatufim){
                host_title = subjects[0].host_details.title;
                root_path = subjects[0].host_details.host_address + '/';
                email_details = {
                    email: subjects[0].host_details.email,
                    title: subjects[0].host_details.title,
                    is_sheatufim_flag: false
                };
            }

            if(is_new || !self.has_reset_password || !self.is_activated){
                // if the user is new, need to send activation mail

                require('../routes/account/activation').sendActivationMail(self, redirect_to/*firstSubjectUrl*/, 'inviteNewUserToSubject',{subjects:subjects, host_title: host_title, root_path: root_path}, email_details,function(err){
                    if(err)
                        console.error('Error sending mail to user ' + self,err);
                });
            }
            else {
                // if the user exists, send only activation mail
                async.waterfall([
                    function(cbk){
                        require('../lib/templates').renderTemplate('inviteUserToSubject',{user:self, next:firstSubjectUrl,subjects:subjects, host_title: host_title, root_path: root_path},cbk);
                    },
                    function(string,cbk) {
                        require('../lib/mail').sendMailFromTemplate(self.email, string ,email_details, cbk);
                    }
                ],function(err){
                    if(err)
                        console.error('Error sending mail to user ' + self,err);
                });
            }
        });
});