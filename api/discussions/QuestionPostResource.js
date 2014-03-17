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
            attachment:null
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
            callback(err, results);
        });
    },

    create_obj: function(req, fields, callback) {
        var self = this;
        self._super(req, fields, function(err, post){
            post.creator_id = req.user;
            callback(err, post);
        });
    }
});
