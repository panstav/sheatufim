
var common = require('./../common')
    models = require('../../models'),
    async = require('async');

var OpinionShaperResource = module.exports = common.BaseModelResource.extend(
    {
        init:function () {
            this._super(models.OpinionShaper);
            this.allowed_methods = ['get'];
            this.fields = common.user_public_fields;
        }
    }
)
