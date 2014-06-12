var resources = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore'),
    notifications = require('../notifications.js');

var QuestionResource = module.exports = common.BaseModelResource.extend({
    init:function () {
        this._super(models.Question);
        this.allowed_methods = ['get'];
        this.filtering = {subject_id: null};
        this.authorization = new common.BaseAuthorization();
        this.default_query = function (query) {
            return query.sort({creation_date:'descending'});
        };
        this.fields = {
            _id : null,
            subject_id : null,
            title: null,
            text: null,
            creation_date: null,
            deadline:null,
            posts: null,
            user_count: null
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
            if(results && results.objects.length > 0) {
                async.each(results.objects, function(question, cbk){
                    models.PostOnQuestion
                        .find()
                        .where('question_id', question._id)
                        .sort({creation_date: -1})
                        .populate('creator_id')
                        .exec(function(err, posts){
                            if(!err){
                                var groups = _.unique(_.pluck(posts, 'creator_id'));

                                question.posts = JSON.parse(JSON.stringify(posts));
                                question.user_count = groups.length;
                                async.forEach(question.posts, function(post, cb){
                                    post.like_users = "";
                                    post.likes = 0;
                                    post.user_liked = false;

                                    //set is_my_comment flag
                                    post.is_my_comment = req.user && (req.user.id + "" === (post.creator_id && post.creator_id + ""));

                                    //get likes
                                    models.LikePost.find().where('post_id', post._id).populate('user_id').exec(function(err, likes){
                                        if(err) cb(err);
                                        else {
                                            _.forEach(likes, function(like){
                                                post.like_users += like.user_id.first_name + ' ' + like.user_id.last_name + ' ';
                                                post.likes += 1;
                                                if(like.user_id._id.toString() == req.user._id.toString()){
                                                    post.user_liked = true;
                                                }
                                            });
                                            cb(null);
                                        }
                                    });
                                }, function(err){
                                    cbk(err, results);
                                });
                            } else {
                                cbk(err);
                            }
                        })
                }, function(err){
                    callback(err, results);
                });
            }
        });
    }
});
