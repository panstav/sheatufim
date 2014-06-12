
var resources = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore'),
    notifications = require('../notifications.js');

var Authorization = common.BaseAuthorization.extend({
    /**
     * limits discussion query to published discussions that have a subjectId that the user is allowed to view
     */
    limit_object_list: function (req, query, callback) {
        var subjectIds = req.user.subjects ? req.user.subjects.map(function(subject) { return subject + '';}) : [];
        query.where('subject_id').in(subjectIds);
        callback(null, query);
    },
    limit_object:function (req, query, callback) {
        return this.limit_object_list(req, query, callback);
    }
});

var PostForumResource = module.exports = common.BaseModelResource.extend({
    init:function () {
        this._super(models.PostForum);
        this.allowed_methods = ['get', 'post', 'delete'];
        this.filtering = {subject_id: null, parent_id: null};
        this.authorization = new Authorization();
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
            subject_id:null,
            is_my_comment: null,
            parent_id: null,
            user_occupation: null,
            responses: null,
            post_groups: null,
            count: null,
            page_posts: null,
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

    get_objects:function (req, filters, sorts, limit, offset, callback) {
        var self = this;
        this._super(req, filters, sorts, 0, 0, function (err, results) {
            var new_posts = [];

            //set avatar and user info for each posts
            _.each(results.objects, function(post){
                var new_post = post.toObject();
                new_post.avatar = post.creator_id.avatar_url();
                new_post.username = post.creator_id.toString();
                new_post.creator_id = post.creator_id.id;
                new_post.user_occupation = post.creator_id.occupation;

                //set is_my_comment flag
                new_post.is_my_comment = req.user && (req.user.id + "" === (post.creator_id && post.creator_id + ""));
                new_posts.push(new_post);
            });

            async.forEach(new_posts, function(post, cbk){
                post.like_users = "";
                post.likes = 0;
                post.user_liked = false;
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
                //the posts with no parents are main posts
                var main_posts = _.filter(new_posts, function(post){
                    return !post.parent_id;
                });

                //group sub_posts by their parents
                var post_groups = _.groupBy(new_posts, function(post){
                    return post.parent_id;
                });


                //paginate
                var page_posts = main_posts;
                if(offset)
                    page_posts = _.rest(page_posts, offset);
                if(limit)
                    page_posts = _.first(page_posts,limit);



                var result = {
                    post_groups: post_groups,
                    count: main_posts.length,
                    page_posts: page_posts
                };

                callback(err, result);
            });

        });
    },

    create_obj: function(req, fields, callback) {
        var self = this,
            base = this._super,
            user = req.session.user,
            user_id = req.session.user._id;

        fields.creator_id = req.session.user.id;

        async.waterfall([
            function(cbk) {
                base.call(self, req, fields, function(err, post){
                    post.user = req.user;
                    post.creator_id = req.user;
                    post.like_users = "";
                    post.likes = 0;
                    cbk(err, post);
                });
            },
            function(post, cbk){
                var subject_id = post.subject_id;
                models
                    .User
                    .find()
                    .where('subjects', subject_id)
                    .exec(function(err, users){
                        cbk(err, post, users);
                    });
            },
            function(post, users, cbk){
                models
                    .Subject
                    .findById(post.subject_id, function(err, subject){
                        cbk(err, post, users, subject);
                    });
            },
            function(post, users, subject, cbk){
                //find parent post user if exists
                if(post.parent_id) {
                    models
                        .PostForum
                        .findById(post.parent_id)
                        .exec(function(err, parent_post){
                            cbk(err, post, users, subject, parent_post);
                        });
                } else {
                    cbk(null, post, users, subject, null);
                }

            }
        ], function(err, post, users, subject, parent_post){
            if(err){}
            var post = post,
                subject_id = subject._id.toString(),
                subject_name = subject.name,
                users = users,
                parent_post = parent_post;

            async.parallel([
                function(clbk){
                    if(users) {
                        //send notification to all user that are part of the subject
                        async.each(users, function(user, c){
                            if(user._id.toString() == user_id.toString()){
                                c(null, 0);
                            } else {
                                notifications.create_user_notification("comment_on_subject_you_are_part_of", post._id, user._id.toString(), user_id.toString(), subject_id, '/discussions/subject/' + subject_id + '/forum', function(err, results){
                                    c(err, results);
                                });
                            }
                        }, function(err, results){
                            clbk(err);
                        });
                    } else {
                        clbk(null);
                    }
                },
                function(clbk){
                    if (parent_post && parent_post.creator_id.toString() != user_id.toString()) {
                        //send notification to the parent post user if it exists
                        notifications.create_user_notification("comment_on_your_forum_post", post._id.toString(), parent_post.creator_id.toString(), user_id.toString(), subject_id.toString(), '/discussions/subject/' + subject_id + '/forum', function(err, results){
                            clbk(err, post);
                        });
                    } else {
                        clbk(null, post);
                    }
                }
            ], function(err, results){
                var post_to_send = results[1];
                post_to_send.avatar = req.user.avatar_url();
                post_to_send.user = req.user;
                callback(err, post_to_send);
            });
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
