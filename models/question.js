var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    common = require('./common'),
    ObjectId = Schema.ObjectId,
    async = require('async'),
    utils = require('../utils');

var Question = module.exports = utils.revertibleModel(new Schema({
    discussion_id:{type:Schema.ObjectId, ref:'Discussion', query:common.FIND_USER_QUERY,index:true, required:true, onDelete:'delete'},
    title: {type: String},
    text:{type:Schema.Types.Html}
}));
