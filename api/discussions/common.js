
var common = require('../common')
    ,models = require('../../models');


/**
 * Discussion related resources authorization:
 *
 * Makes sure user can only show discussion history of discussion is authorized to view
 */
exports.DiscussionAuthorization = common.BaseAuthorization.extend({
        limit_object_list: function(req,query,cbk){

            // get discussion id from query
            var discussion_id = req.query.discussion_id || req.body.discussion_id;
            if(!discussion_id || typeof(discussion_id) != 'string')
                return cbk({code:401,message:'Must provide single discussion id filter'});

            // get discussion object
            models.Discussion.findById(discussion_id).select({subject_id:1}).exec(function(err,discussion){
                if(err) return cbk(err);

                if(!discussion) return cbk({code:404,message:'discussion not found'});

                // check if discussion subject is in user allowed subject ids
                if(!discussion.isUserAllowed(req.user))
                    return cbk({code:401,message:'no permission'});
                query.where('discussion_id',discussion_id);
                return cbk(null,query);
            });
        },
        limit_object:function(req,query,cbk){
            return this.limit_object_list(req,query,cbk);
        }
    });
