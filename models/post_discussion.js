var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    common = require('./common'),
    ObjectId = Schema.ObjectId,
    async = require('async'),
    utils = require('../utils');

var PostDiscussion = {
    parent_id: {type:Schema.ObjectId, ref:'PostDiscussion', index:true},
    discussion_id: {type:Schema.ObjectId, ref:'Discussion', query:common.FIND_USER_QUERY, index:true, required:true, onDelete:'delete'},
    text:{type:Schema.Types.Html}
};

var extension = utils.extend_model('PostDiscussion', require('./post_or_suggestion').PostOrSuggestion, PostDiscussion, 'posts',function(schema) {
    schema.methods.toString = function(){
        return this.text || '';
    };
});

module.exports = extension.model;