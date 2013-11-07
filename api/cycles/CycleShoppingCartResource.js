
var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('../common.js');


var Authorization = resources.Authorization.extend({
    limit_object_list:function (req, query, callback) {
        var id = req.query.cycle_id;
        query.where('cycles', id);
        callback(null, query);
    }
});

var CycleShoppingCartResource = module.exports = common.BaseModelResource.extend({

    init:function () {
        this._super(models.InformationItem);
        this.allowed_methods = ['get'];
        this.authorization = new Authorization();
        this.default_query = function(query)
        {
            return query.where('status', 'approved').sort({"creation_date.date":'descending'});
        };
    },

    get_objects:function(req,filters,sorts,limit,offset,callback){
        this._super(req,filters,sorts,limit,offset,function(err, results){
            callback(err, results);
        })
    }
});