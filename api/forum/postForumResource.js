
var resources = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore');

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
            page_posts: null
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
    },

    create_obj: function(req, fields, callback) {
        var self = this;
        var user = req.session.user;

        fields.creator_id = req.session.user.id;

        self._super(req, fields, function(err, post){
            post.avatar = req.user.avatar_url();
            post.user = req.user;
            callback(err, post);
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
