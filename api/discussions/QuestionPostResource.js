var resources = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore'),
    notifications = require('../notifications.js');

var QuestionPostResource = module.exports = common.BaseModelResource.extend({
    init:function () {
        this._super(models.PostOnQuestion);
        this.allowed_methods = ['get', 'post'];
        this.filtering = {question_id: null};
        this.authorization = new common.BaseAuthorization();
        this.default_query = function (query) {
            return query.sort({creation_date:'descending'});
        };
        this.fields = {
            creator_id : null,
            user: null,
            username: null,
            avatar: null,
            text:null,
            creation_date: null,
            _id:null,
            question_id:null,
            is_my_comment: null,
            user_occupation: null,
            count: null,
            attachment:null,
            like_users: null,
            likes: null,
            user_liked: null
        };
        this.default_limit = 50;
    },

    run_query: function(req,query,callback)
    {
        this._super(req,query,callback);
    },

    get_objects:function (req, filters, sorts, limit, offset, callback) {
        var self = this;
        self._super(req, filters, sorts, 0, 0, function (err, results) {
            if(!err) {
                async.forEach(results.objects, function(post, cbk){
                    post.like_users = "";
                    post.likes = 0;
                    post.user_liked = false;

                    //set is_my_comment flag
                    post.is_my_comment = req.user && (req.user.id + "" === (post.creator_id && post.creator_id + ""));

                    //get likes
                    models.LikePost.find().where('post_id', post._id).populate('user_id').exec(function(err, likes){
                        if(err) cbk(err);
                        else {
                            _.forEach(likes, function(like){
                                post.like_users += like.user_id.first_name + ' ' + like.user_id.last_name + ' ';
                                post.likes += 1;
                                if(like.user_id._id.toString() == req.user._id.toString()){
                                    post.user_liked = true;
                                }
                            });
                            cbk(null);
                        }
                    });
                }, function(err){
                    callback(err, results);
                });
            } else {
                callback(err);
            }
        });
    },

    create_obj: function(req, fields, callback) {
        var self = this;
        self._super(req, fields, function(err, post){
            post.creator_id = req.user;
            post.like_users = "";
            post.likes = 0;
            post.user_liked = false;
            async.waterfall([
                function(cbk) {
                    models.Question.findById(post.question_id, function(err, question){
                        cbk(err, question);
                    });
                },
                function(question, cbk) {
                    models.User.find()
                        .where('subjects', question.subject_id)
                        .exec(function(err, users){
                            var user_id = post.creator_id;
                            async.each(users, function(user, c){
                                if(user._id.toString() == user_id.toString()){
                                    c(null);
                                } else {
                                    notifications.create_user_notification("comment_on_question_in_subject_you_are_part_of", post._id, user._id.toString(), post.creator_id.toString(), question._id, '/discussions/subject/' + question.subject_id, function(err){
                                        c(err);
                                    });
                                }
                            }, function(err){
                                cbk(err, post);
                            });
                        });
                }
            ], function(err, post){
                callback(err, post);
            });
        });
    }
});
