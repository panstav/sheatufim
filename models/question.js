var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    common = require('./common'),
    ObjectId = Schema.ObjectId,
    async = require('async'),
    formage = require('formage-admin').forms,
    utils = require('../utils');

var Question = module.exports = new Schema({
    subject_id:{type:Schema.ObjectId, ref:'Subject', query:common.FIND_USER_QUERY,index:true, required:true, onDelete:'delete'},
    title: {type: String},
    text:{type:Schema.Types.Html},
    creation_date:{type:Date, 'default':Date.now},
    deadline:{type:Date,widget:formage.widgets.DateTimeWidget}
});

Question.statics.onPreSave = function(func){
    Question.pre('save',func);
};