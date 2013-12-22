
var resources = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore');

var PostForumResource = module.exports = common.BaseModelResource.extend({
    init:function () {

        this._super(models.PostForum);
        this.allowed_methods = ['get', 'post', 'delete'];
        this.filtering = {subject_id: null};
        this.default_query = function (query) {
            return query.sort({creation_date:'ascending'});
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
            responses: null
        };
        this.default_limit = 50;
    },

    run_query: function(req,query,callback)
    {
        query.populate('creator_id');
        query.populate('subject_id');
        this._super(req,query,callback);
    },

    get_objects: function (req, limit, offset, callback) {
        // get user's avatar for each post
        //models.PostForum.find().where('parent_id', null).exec(function(err, results))
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
