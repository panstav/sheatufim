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
});

/**
 *
 * Resource for uploading attachment files to post or discussion
 *
 */
var PostAttachmentResource = module.exports = common.MultipartFormResource.extend({
    init:function () {
        this._super(models.PostForum);
        this.authorization = new Authorization();
    },
    onFile:function(req,object,file,callback){
        req.queueStream = fs.createReadStream(file.path);
        req.headers['x-file-name'] = file.originalFilename;
        req.headers['x-file-type'] = file.headers['content-type'];
        common.uploadHandler(req,function(err,picture){
            if(err) return callback(err);

            object.attachment = object.attachment || {};
            object.attachment.path = picture.path;
            object.attachment.name = file.originalFilename;
            object.attachment.url = picture.url;
            object.save(function(err){
                callback(err,object.attachment);
            });
        });
    }
});
