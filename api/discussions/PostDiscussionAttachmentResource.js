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

/**
 *
 * Resource for uploading attachment files to post or discussion
 *
 */
var PostDiscussionAttachmentResource = module.exports = common.BaseModelResource.extend({
    init:function () {

        this._super(models.PostDiscussion);
        this.authorization = new discussionCommon.DiscussionAuthorization();
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
