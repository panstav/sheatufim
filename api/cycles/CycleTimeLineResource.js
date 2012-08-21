

var jest = require('jest')
    ,models = require('../../models')
    ,common = require('../common')
    ,async = require('async')
    ,_ = require('underscore');

var CycleTimelineResource = module.exports = jest.Resource.extend({
    init:function(){
        this._super();
        this.allowed_methods = {
            get: {
                list:null
            }
        };
        this.authentication = new common.SessionAuthentication();
        this.filtering = {};
        this.sorting = {};
    },


    get_objects:function(req,filters,sorts,limit,offset,callback)
    {
        var arr = [];
        var cycle_id = req.query.cycle_id;
        async.parallel([
            function(cbk){
                    models.Cycle.findById(cycle_id, function(err, cycle){
                    if(!err){
                        var objs = [];
                        if(cycle){
                            _.each(cycle.admin_updates, function(admin_update){
                                if(admin_update){
                                    var obj = {
                                        type: "admin_update",
                                        text: admin_update.info,
                                        date: admin_update.date
                                    }
                                    objs.push(obj);
                                }

                            })

                            if(cycle.due_date){
                                var obj = {
                                    type: "due_date",
                                    date: cycle.due_date
                                }
                                objs.push(obj);
                            }

                            var obj = {
                                type: "cycle_creation",
                                date: cycle.creation_date
                            }

                            objs.push(obj);

                            var discussion = _.find(cycle.discussions, function(discussion){ return discussion.is_main == true});

                            models.Discussion.findById(discussion.discussion)
                                .select({'_id': 1, 'title': 1, 'text_field_preivew': 1, 'image_field_preview': 1, 'creation_date': 1})
                                .exec(function(err, discussion_obj){
                                if(!err && discussion_obj){
                                    discussion_obj = JSON.parse(JSON.stringify(discussion_obj));
                                    discussion_obj.type = "discussion";
                                    discussion_obj.date = discussion_obj.creation_date;
                                    objs.push(discussion_obj);
                                }

                                cbk(err, objs);
                            });
                        }
                    }else
                        cbk(err, objs);
                });
            },

            function(cbk){
                models.Update.find({cycle_id: cycle_id}, function(err, updates){
                    if(!err){
                        _.each(updates, function(update){
                            update.type = "cycle_update";
                            update.date = update.creation_date;
                        })
                    }

                    cbk(err, updates);
                });
            },

            function(cbk){
                models.Action.find({cycle_id: cycle_id, is_approved: true})
                    .select({'_id': 1, 'title': 1, 'text_field_preivew': 1, 'image_field_preview': 1, 'execution_date': 1})
                    .exec(function(err, actions){
                    if(!err){
                        actions = JSON.parse(JSON.stringify(actions));
                        _.each(actions, function(action){
                            action.type = "action";
                            action.date = action.execution_date;
                        })
                    }

                    cbk(err, actions);
                });
            }

        ], function(err, args){

            arr = _.union.apply(_,args);
            callback(null,{meta:{total_count: arr.length}, objects: arr});
        });
    }
});