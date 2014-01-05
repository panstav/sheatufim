/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:03
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    models = require('../../models'),
    common = require('../common.js'),
    discussionCommon = require('./common'),
    async = require('async'),
    fs = require('fs'),
    _ = require('underscore'),
    multiparty = require('multiparty');

var Authorization = common.BaseAuthorization.extend({
    limit_object_list: function(req,query,cbk){

        query.where('creator_id',req.user.id);
        cbk(null,query);
    },
    limit_object:function(req,query,cbk){
        return this.limit_object_list(req,query,cbk);
    }
})

/**
 *
 * Resource for uploading attachment files to post or discussion
 *
 */
var PostAttachmentResource = module.exports = common.BaseModelResource.extend({
    init:function () {

        this._super(models.PostForum);
        this.allowed_methods = ['put'];
        this.authorization = new Authorization();

        this.fields = {
            url:null,
            name:null
        };

        this.update_fields = {};
    },

    update_obj: function(req, object, callback){
        var form = new multiparty.Form({})
            , data = {}
            , files = {}
            , done;

        form.on('file', function(name, val){
            console.log(val);

            var file = val;
            req.queueStream = fs.createReadStream(file.path);
            req.headers['x-file-name'] = val.originalFilename;
            req.headers['x-file-type'] = val.headers['content-type'];
            common.uploadHandler(req,function(err,file){
                if(err) return callback(err);

                object.attachment = object.attachment || {};
                object.attachment.path = file.path;
                object.attachment.name = val.originalFilename;
                object.attachment.url = file.url;
                object.save(function(err){
                    callback(err,object.attachment);
                });
            });

        });

        form.on('error', function(err){
            callback(err);
        });

        form.on('close', function(){
        });

        form.parse(req);
    }

});
