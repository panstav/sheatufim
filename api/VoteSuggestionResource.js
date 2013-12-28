var resources = require('jest'),
    models = require('../models'),
    common = require('./common.js'),
    async = require('async'),
    _ = require('underscore');


var VoteSuggestoinResource =  module.exports = common.BaseModelResource.extend({
    init:function () {
        this._super(models.VoteSuggestion);
        this.allowed_methods = ['post'];
        this.fields = {
            votes_against:null,
            voter_balance:null,
            suggestion_id: null,
        };
        this.update_fieilds = {
            suggestion_id: null,
            balance: null,
        }
    },

    //returns suggestion_
    create_obj: function(req,fields,callback)
    {
        var user = req.user;

        var suggestion_id = fields.suggestion_id;
        var self = this;
        var agrees;
        var not_agrees;

        fields.user_id = user.id;


        async.waterfall([

            function(cbk){
                models.VoteSuggestion.findOne({suggestion_id: suggestion_id, user_id: user.id}, function(err, vote_obj){
                    cbk(err, vote_obj);
                })
            },


            function(vote, cbk){
                // if no vote create new one
                // if exist insert the new vote
                if (!vote){
                    self._super(req,fields,cbk);
                }else {
                    vote.balance = fields.balance;

                    vote.save(function(err, saved_vote){
                        cbk(saved_vote);
                    })
                }
            },

            function(vote, cbk){
                models.VoteSuggestion.find({suggestion_id: suggestion_id}, function(err, votes){
                    cbk(err, votes);
                })
            },

            function(votes, cbk){
                agrees = _.countBy(votes, function(vote) { vote.balance == 1 });
                not_agrees = _.countBy(votes, function(vote) { vote.balance == -1 });

                models.Suggestion.update({suggestion_id: suggestion_id}, {$set: {agrees: agrees, not_agrees: not_agrees}},function(err, suggestion){
                    cbk(err);
                })
            }
        ], function(err){

            callback(err, {
                    agrees:agrees,
                    not_agrees:not_agrees,
                }
            )
    })


        models.VoteSuggestion.findOne({user_id: user.id, suggestion_id: suggestion_id}, function (err, vote_object) {
            if (err) return
                callback(err, null);
        });
    }
});


function calculate_popularity(pos, n){

//    var confidence = 1.96;
    if (n == 0)
        return 0;


    //var norm = new jstat.NormalDistribution(0,1) // normal distribution
    var z = 1.96;//norm.getQuantile(1-(1-confidence)/2);
//    var z = Statistics2.pnormaldist(1-(1-confidence)/2);
    var phat = 1.0*pos/n;
    return (phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n)
}
