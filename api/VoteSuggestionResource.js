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
            agrees:null,
            not_agrees:null,
            suggestion_id: null,
            balance: null
        };
        this.update_fieilds = {
            suggestion_id: null,
            balance: null
        }
    },

    //returns suggestion_
    create_obj: function(req,fields,callback)
    {

        var self = this;
        var base = self._super;

        var user = req.user;
        var suggestion_id = fields.suggestion_id;
        var discussion_id = fields.discussion_id;

        var vote_counts;
        var _vote;

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
                    base.call(self, req, fields, cbk);
                }else {
                    vote.balance = fields.balance;

                    vote.save(function(err, saved_vote){
                        cbk(err, saved_vote);
                    })
                }
            },

            function(vote, cbk){
                _vote = vote;
                models.VoteSuggestion.find({suggestion_id: suggestion_id}, function(err, votes){
                    cbk(err, votes);
                })
            },

            function(votes, cbk){
                vote_counts = _.countBy(votes, function(vote) { return vote.balance == 1 ? 'agrees' : 'not_agrees' });
                if(!vote_counts.agrees) vote_counts.agrees = 0;
                if(!vote_counts.not_agrees) vote_counts.not_agrees = 0;

                models.Suggestion.update({_id: suggestion_id}, {$set: {agrees: vote_counts.agrees, not_agrees: vote_counts.not_agrees}},function(err, suggestion){
                    cbk(err);
                })
            },

            function(cbk){
                //add user that discussion participant count to discussion
                models.Discussion.update({_id: discussion_id, "users.user_id": {$ne: fields.user_id}},
                    {$addToSet: {users: {user_id: fields.user_id, join_date: Date.now(), $set:{last_updated: Date.now()}}}}, cbk);
            }
        ], function(err){

            callback(err, {
                    agrees: vote_counts.agrees,
                    not_agrees:vote_counts.not_agrees,
                    suggestion_id: suggestion_id,
                    balance: _vote.balance
                }
            )
        });

       /* models.VoteSuggestion.findOne({user_id: user.id, suggestion_id: suggestion_id}, function (err, vote_object) {
            if (err) return
                callback(err, null);
        });
        */
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
