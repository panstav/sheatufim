
var resources = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore'),
    notifications = require('../notifications.js');

var PostOnSuggestionResource = module.exports = common.BaseModelResource.extend({
    init:function () {

        this._super(models.PostSuggestion);
        this.allowed_methods = ['get', 'post', 'delete'];
        this.filtering = {suggestion_id: null};
        this.default_query = function (query) {
            return query.sort({creation_date:'ascending'});
        };
        this.fields = {
            creator_id : null,
            username: null,
            avatar: null,
            text:null,
            creation_date: null,
            _id:null,
            discussion_id:null,
            suggestion_id: null,
            is_my_comment: null,
            attachment:null,
            like_users: null,
            likes: null,
            user_liked: null
        };
        this.default_limit = 50;
    },

    run_query: function(req,query,callback)
    {
        query.populate('creator_id');
        this._super(req,query,callback);
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        // get user's avatar for each post
        this._super(req, filters, sorts, limit, offset, function(err, results){
            if(!err) {
                async.forEach(results.objects, function(post, cbk){
                    post.like_users = "";
                    post.likes = 0;
                    post.user_liked = false;
                    post.avatar = post.creator_id.avatar_url();
                    post.username = post.creator_id.toString();
                    post.creator_id = post.creator_id.id;

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

            }
        });
    },

    create_obj: function(req, fields, callback) {
        var self = this;
        var user = req.session.user,
            discussion_id = req.body.discussion_id;

        fields.creator_id = req.session.user.id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;

        async.parallel([
            function(cbk) {
                self._super(req, fields, function(err, post_suggestion){
                    post_suggestion.avatar = req.user.avatar_url();
                    post_suggestion.username = req.user + "";

                    //add user that discussion participant_count to discussion
                    models.Discussion.update({_id: post_suggestion.discussion_id, "users.user_id": {$ne: fields.creator_id}},
                        {$addToSet: {users: {user_id: fields.creator_id, join_date: Date.now(), $set:{last_updated: Date.now()}}}}, function(err){
                            cbk(err, post_suggestion);
                        });
                });
            },
            function(cbk) {
                models.Suggestion.findById(req.body.suggestion_id).exec(function(err, suggestion){
                    if(err) cbk(err);
                    notifications.create_user_notification("comment_on_change_suggestion_i_created", suggestion._id.toString(), suggestion.creator_id.toString(), user._id.toString(), discussion_id.toString(), '/discussions/' + discussion_id, function(err, result){
                        cbk(err, result);
                    });
                });
            }
        ], function(err, results){
            var post_suggestion = results[0];
            callback(err, post_suggestion);
        });

    },

    delete_obj: function(req,object,callback){
        if (object.creator_id && (req.user.id === object.creator_id.id)){
            object.remove(function(err){
                callback(err);
            })
        }else{
            callback({err: 401, message :"user can't delete posts of others"});
        }
    }
});
