var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    common = require('./common'),
    ObjectId = Schema.ObjectId,
    async = require('async'),

    utils = require('../utils');

var PostOnQuestion = {
    question_id: {type:Schema.ObjectId, ref:'Question', index:true},
    text:{type:Schema.Types.Html}
};

var extension = utils.extend_model('PostOnQuestion', require('./post_or_suggestion').PostOrSuggestion, PostOnQuestion, 'PostOnQuestion',function(schema) {
    schema.methods.toString = function(){
        return this.text || '';
    };
});

module.exports = extension.model;