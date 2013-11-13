/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 16/02/12
 * Time: 11:00
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    models = require('../models'),
    common = require('./common');

var SubjectResource = module.exports = common.BaseModelResource.extend({
    init:function(){
        this._super(models.Subject);
        this.allowed_methods = ['get'];
        this.filtering = {tags:null};
        this.authentication = new common.SessionAuthentication(true);
        this.max_limit = 8;
        this.default_query = function(query){
            return query.sort({'is_uru':-1,gui_order:1});
        };
        this.fields = ['name','tooltip','description','text_field_preview','image_field',
            'tags','is_hot_object','is_uru','isAllowed','_id'];
    },
    get_objects:function(req,filters,sorts,limit,offset,callback) {
        this._super(req,filters,sorts,limit,offset,function(err,rsp) {
            if(rsp && rsp.objects){
                var userSubjects = req.user && req.user.subjects ? req.user.subjects.map(function(subject){
                    return subject + '';
                }) : [];
                rsp.objects.forEach(function(subject){
                    subject.isAllowed = userSubjects.indexOf(subject.id) > -1;
                });
            }
            callback(err,rsp);
        });
    }
});