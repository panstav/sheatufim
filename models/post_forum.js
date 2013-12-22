var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    common = require('./common'),
    ObjectId = Schema.ObjectId,
    async = require('async'),

    utils = require('../utils');

var PostForum = {
    parent_id: {type:Schema.ObjectId, ref:'PostForum', index:true},
    subject_id: {type:Schema.ObjectId, ref:'Subject', query:common.FIND_USER_QUERY, index:true, required:true, onDelete:'delete'},
    text:{type:Schema.Types.Html}
};

var extension = utils.extend_model('PostForum', require('./post_or_suggestion').PostOrSuggestion, PostForum, 'posts',function(schema) {
    schema.methods.toString = function(){
        return this.text || '';
    };
});

module.exports = extension.model;