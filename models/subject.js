var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async');

var Subject  = module.exports = new Schema({
    name:{type:String,required:true},
    tooltip:String,
    description: {type:Schema.Types.Html},
    text_field_preview:{type:Schema.Types.Text},
    image_field: {type: Schema.Types.File, required: true},
    cover_image_field:Schema.Types.File,
    timeline_url: String,
    tags:[String],
    gui_order: {type:Number,'default':9999999, editable:false},
    is_hot_object: {type:Boolean,'default':false},
    is_uru:{type:Boolean,'default':false},
    hidden_subject: {type:Boolean,'default':false}

}, {strict: true});

Subject.methods.toString = function(){
    return this.name;
};

/**
 *  check if discussion subject is in user allowed subject ids
 * @param user
 * @returns {boolean}
 * Is allowed
 */
Subject.methods.isUserAllowed = function(user){
    if(!user || !user.subjects)
        return false;
    var subjectIds = user.subjects.map(function(subject) { return subject + '';});
    var subjectId = this._id + '';
    return subjectIds.indexOf(subjectId) != -1;
}
