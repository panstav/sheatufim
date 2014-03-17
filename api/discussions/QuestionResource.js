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
                        .sort({creation_date: 1})
                        .populate('creator_id')
                        .exec(function(err, posts){
                            if(!err){
                                var groups = _.unique(_.pluck(posts, 'creator_id'));
                                question.posts = posts;
                                question.user_count = groups.length;
                            }
                            cbk(err);
                        })
                }, function(err){
                    callback(err, results);
                });
            }
        });
    }
});
