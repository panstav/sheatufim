var mongoose_admin = require('formage-admin'),
    mongoose = require('mongoose'),
    Models = require('../models'),
    async = require('async'),
    SuggestionResource = require('../api/suggestionResource'),
    ActionResource = require('../api/actions/ActionResource'),
    models = require('../models');

var UserForm = require('./user');
var DiscussionForm = require('./discussion');
var SuggestionForm = require('./suggestion');

mongoose_admin.register_models(Models);


module.exports = function (app) {

    var admin = mongoose_admin.createAdmin(app, {root:'admin'});

    mongoose_admin.loadApi(app);

    var _renderUserPanel = admin.renderUserPanel;
    admin.renderUserPanel = function (req, cbk) {
        var self = this;
        _renderUserPanel.call(self, req, function (err, html) {
            if (err) return cbk(err);

            var lastVisit = req.admin_user.fields.lastVisit;
            async.map(['Post', 'Discussion', 'Suggestion'/*, {model:'Cycle', field:'creation_date.date'}, 'Action'*/], function (type, cbk) {
                var modelName = type.model || type;
                var dateField = type.field || 'creation_date';
                var modelSettings = self.models[modelName];
                if (req.admin_user.fields[modelName + '_count']) {
                    return cbk(null, {model:modelName, count:req.admin_user.fields[modelName + '_count'], dateField:dateField});
                }

                var qry = modelSettings.model.count();
                if (lastVisit)
                    qry.where(dateField).gte(lastVisit);
                qry.exec(function (err, count) {
                    if (err) return cbk(err);
                    req.admin_user.fields[modelName + '_count'] = count;
                    cbk(null, {model:modelName, count:count, dateField:dateField});
                });
            }, function (err, counts) {
                if (err) return cbk(err);
                var items = counts.filter(function (c) {
                    return c.count;
                });
                if (items.length) {
                    html = html + '<div class="adminUserUpdates">New items since your last visit: ' + items.map(function (c) {
                        return '<a href="' + self.root + '/model/' + c.model + '?' + c.dateField + '__gte=' + encodeURIComponent(lastVisit) + '">' + c.count + ' ' + c.model + 's</a>';
                    }).join(', ') + '</div>';
                }
                cbk(null, html);
            });
        });
    };

   /* admin.registerSingleRowModel(Models.GamificationTokens, 'GamificationTokens', {
            form:GamificationForm}
    );*/
    admin.registerSingleRowModel( Models.General, "General", {
        list:['title'],
        order_by:['gui_order'],
        sortable:'gui_order',
    });

    admin.registerMongooseModel("Subject", Models.Subject, null, {
        list:['name'],
        order_by:['gui_order'],
        sortable:'gui_order',
        search:['name', 'description', 'text_field_preview']
    });

    admin.registerMongooseModel("User", Models.User, null, {
        form:UserForm,
        list:['first_name', 'last_name','email'],
        //  filters: ['email', 'gender', 'identity_provider'],
        order_by:['-last_visit'],
        search:'__value__.test(this.first_name+ " "+this.last_name)',
        subCollections:[
            {model:'Post', field:'creator_id', label:'Comments'},
            {model:'Suggestion', field:'creator_id', label:'Suggestions'},
            {model:'Discussion', field:'creator_id', label:'Owned discussions'},
            // this line destroies viewing user in the admin
//            {model:'Action', field:'creator_id', label:'Owned actions'}
        ]
    });

    admin.registerMongooseModel("InformationItem", Models.InformationItem, null, {
        list:['title'],
        order_by:['gui_order'],
        sortable:'gui_order',
        // filters: ['created_by', 'status', 'is_hidden', 'is_hot_object'],
        cloneable:true,
        actions:[
            {
                value:'approve',
                label:'Approve',
                func:function (user, ids, callback) {
                    Models.InformationItem.update({_id:{$in:ids}}, {$set:{is_approved:true}}, {multi:true}, callback);
                }
            }
        ],
        search:['title', 'text_field_preview']
    });

    admin.registerMongooseModel("Discussion", Models.Discussion, null, {
        list:['title'],
        cloneable:true,
        form:DiscussionForm,
        order_by:['-creation_date'],
        search:['title', 'text_field_preview'],
        subCollections:[
            {model:'Post', field:'discussion_id', label:'Comments'},
            {model:'Suggestion', field:'discussion_id', label:'Suggestions'},
            {model:'InformationItem', field:'discussions', label:'Information Items'}
        ],
        actions:[
         //   previewAction(Models.Discussion)
        ]
        //filters: ['created_by', 'is_published', 'is_hidden', 'is_hot_object', 'is_cycle.flag']
    });

    admin.registerMongooseModel("Question", Models.Question, null, {
        list:['title', 'text'],
        cloneable:true,
        search:['title', 'text']
    });

    admin.registerMongooseModel('Post', Models.Post, null, {
        list:['text', 'username', 'discussion_id.title'],
        list_populate:['discussion_id'],
        order_by:['-creation_date'],
        // filters: ['discussion_id', 'creator_id'],
        search:['text', 'first_name', 'last_name'],
        label:'Comment',
        hideFromMain:true
    });

    admin.registerMongooseModel('Suggestion', Models.Suggestion, null, {
        list:['parts.0.text', 'discussion_id.title'],
        list_populate:['discussion_id'],
        form:SuggestionForm,
        order_by:['-discussion_id', '-creation_date'],
        actions:[
            {
                value:'approve',
                label:'Approve',
                func:function (user, ids, callback) {
                    async.forEach(ids, function (id, cbk) {
                        SuggestionResource.approveSuggestion(id, cbk);
                    }, callback);
                }
            }
        ],
        search:['explanation', 'first_name', 'last_name'],
        hideFromMain:true,
        subCollections:[
            {model:'PostSuggestion', label:"Comments", field:'suggestion_id'}
        ]
        // filters: ['discussion_id', 'creator_id']
    });

    admin.registerMongooseModel('PostSuggestion', Models.PostSuggestion, null, {
        list:['text', 'discussion_id.title'],
        list_populate:['discussion_id'],
        order_by:['-creation_date'],
        search:['text', 'first_name', 'last_name']
        // filters: ['discussion_id', 'creator_id']
    });

    admin.registerMongooseModel('PostForum', Models.PostForum, null, {
        list:['text', 'subject_id.title'],
        list_populate:['subject_id'],
        order_by:['-creation_date'],
        search:['text', 'first_name', 'last_name']
    });

    admin.registerMongooseModel('PostOnQuestion', Models.PostOnQuestion, null, {
        list:['text'],
        order_by:['-creation_date']
    });

    admin.registerMongooseModel('PostDiscussion', Models.PostDiscussion, null, {
        list:['text', 'discussion_id.title'],
        list_populate:['discussion_id'],
        order_by:['-creation_date'],
        search:['text', 'first_name', 'last_name']
    });

    admin.registerMongooseModel('Notification', Models.Notification, null, {
        list:['text', 'discussion_id.title'],
        list_populate:['discussion_id'],
        order_by:['-creation_date'],
        search:['text', 'first_name', 'last_name']
    });

    admin.registerMongooseModel('Link', Models.Link, null, {
        list:['title'],
        order_by:['gui_order'],
        sortable:'gui_order',
        search:['title', 'link']
        /*hideFromMain:true*/
    });

   /* admin.registerMongooseModel('Category', Models.Category, null, {
        list:['name']
    });
   */
    admin.registerMongooseModel('About', Models.About, null, {
        list:['title'],
        actions:[
        ]
    });
    admin.registerMongooseModel('Contact', Models.Contact, null, {
        list:['title'],
        actions:[
        ]
    });

    /*admin.registerMongooseModel('Team', Models.Team, null, {
        list:['name'],
        cloneable:true,
        actions:[
           // previewAction(Models.Team)
        ]
    });

    admin.registerMongooseModel('Founder', Models.Founder, null, {
        list:['name'],
        cloneable:true,
        actions:[
//            previewAction(Models.Founder)
        ]
    });

    admin.registerMongooseModel('Qa', Models.Qa, null, {
        list:['title'],
        actions:[
            //previewAction(Models.Qa)
        ]
    });

    admin.registerMongooseModel('FooterLink', mongoose.model('FooterLink'), null, {
        list:['tab', 'name'],
        order_by:['gui_order'],
        sortable:'gui_order',
        actions:[
           // previewAction(Models.FooterLink)
        ]
    });

    admin.registerMongooseModel('ImageUpload', Models.ImageUpload, null, {
        list:['image.url']
    });*/

    admin.registerAdminUserModel();
};

var unApproveAction = function (id, callback) {
    models.Action.update({_id:id}, {$set:{is_approved:false}}, function (err, num) {
        if (err)
            console.error(err);
        callback(err, num);
    })
};
