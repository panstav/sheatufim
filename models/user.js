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
            get_alert: {type: Boolean, 'default': true},
            time_of_alert: {type:String, "enum":['now', 'today', 'this_week'], 'default': 'now'},
            get_alert_of_comments: {type: Boolean, 'default': true},
            get_alert_of_suggestions: {type: Boolean, 'default': true},
            get_alert_of_approved_suggestions: {type: Boolean, 'default': true}
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
        get_uru_updates: {type: Boolean, 'default': true},
        get_weekly_mails: {type: Boolean, 'default': true},

        // by default no subject is selected
        new_discussion: [ new Schema(
           {
               subject_id: {type: ObjectId, ref: 'Subject'},
               get_alert: {type: Boolean}
           }
        )],

        //general discussions
        get_alert_of_comments_for_all_discussions: {type: Boolean, 'default': true},
        get_alert_of_suggestions_for_all_discussions: {type: Boolean, 'default': true},
        get_alert_of_approved_suggestions_for_all_discussions: {type: Boolean, 'default': true}
    }
}, {strict:false});

User.methods.toString = function()
{
    return this.first_name + ' ' + this.last_name;
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

            if(is_new || !self.is_activated){
                // if the user is new, need to send activation mail

                require('../routes/account/activation').sendActivationMail(self, redirect_to/*firstSubjectUrl*/, 'inviteNewUserToSubject',{subjects:subjects},function(err){
                    if(err)
                        console.error('Error sending mail to user ' + self,err);
                });
            }
            else {
                // if the user exists, send only activation mail
                async.waterfall([
                    function(cbk){
                        require('../lib/templates').renderTemplate('inviteUserToSubject',{user:self, next:firstSubjectUrl,subjects:subjects},cbk);
                    },
                    function(string,cbk) {
                        require('../lib/mail').sendMailFromTemplate(self.email, string , cbk);
                    }
                ],function(err){
                    if(err)
                        console.error('Error sending mail to user ' + self,err);
                });
            }
        });
});