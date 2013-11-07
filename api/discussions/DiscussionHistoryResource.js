
var common = require('../common'),
    discussionCommon = require('./common'),
    models = require('../../models'),
    async = require('async'),
    jest = require('jest');


var DiscussionHistoryResource = module.exports =  common.BaseModelResource.extend({
    init:function () {
        this._super(models.DiscussionHistory);
        this.allowed_methods = ['get'];
        this.filtering = {discussion_id: null};
        this.authorization = new discussionCommon.DiscussionAuthorization();
        this.default_query = function (query) {
            return query.where.sort({date: 'descending'});
        };
        this.fields = {
            discussion_id: null,
            date: null,
            text_field: null,
            grade: null
        }
    }

})
