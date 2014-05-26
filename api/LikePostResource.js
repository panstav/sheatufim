var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    _ = require('underscore'),
    common = require('./common.js');
//  jstat = require('./jstat');

var LikePostResource = module.exports = common.BaseModelResource.extend({
    init:function () {
        this._super(models.LikePost);
        this.allowed_methods = ['get', 'post'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {post_id:null};
        this.fields = {
            user_id:null,
            post_id:null
        };
    },

    //returns post_
    create_obj: function(req,fields,callback){
        var self = this;
        var post_id = req.body.post_id;
        var user_id = req.user._id;

        models.LikePost.findOne()
            .where('user_id', user_id)
            .where('post_id', post_id)
            .exec(function(err, like){
                if(err) callback(err, null);
                if(like) {
                    var like = like;
                    models.LikePost.remove({_id: like._id}, function(err){
                        console.log('unliked');
                        callback(err, like);
                    });
                } else {
                    var like_obj = new self.model({
                        user_id: user_id,
                        post_id: post_id
                    });
                    like_obj.save(function(err, like_obj){
                        console.log('liked');
                        callback(err, like_obj);
                    });
                }
            });
    }
});
