var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,utils = require('../utils')
    ,_ = require('underscore');

var General = module.exports = utils.revertibleModel(new Schema({
    welcome_pre_title:{type:String, required:true},
    welcome_title:{type:String, required:true},
    text: {type:String, required:true},
    gui_order:{type:Number,'default':Number.MAX_VALUE,editable:false},

}));

var link = {};

General.statics.load = function(callback) {
    this.findOne({}).exec(function(err,docs) {
        if(docs)
            link = docs;
        if(callback)
            callback(err);
    });
};

General.statics.getGeneral = function() {
    return link;
};

General.pre('save',function(next) {
    link = this;
    /*mongoose.model('General').load();*/
    next();
});
