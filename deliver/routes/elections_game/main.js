

var models = require('../../../models')

    ,async = require('async')
    ,notifications = require('../../../api/notifications.js');

module.exports = function(req,res)
{


    models.User.find({$and: [{'quote_game.played':true}, { 'avatar.url': { $exists: true } } ]} )
       // .populate("proxy.user_id"/*,['id','_id','first_name','last_name','avatar','facebook_id','num_of_given_mandates', "followers",'score','num_of_proxies_i_represent']*/)

        .exec(function(err, users){
            var users_count  =   users ? users.length   :0;
            models.QuoteGameHashes.find()
                .exec(function(err, hashes){
                        res.setHeader("Expires", "0");
                        res.render('elections_game.ejs',{
                        users       :   users       ,
                        users_icons_count :   Math.min(14,users_count)  ,
                        hash        :   makeid(10)  ,
                        game_played :   hashes.length ,
                            /*meta: {
                             type: req.app.settings.facebook_app_name + ':discussion',
                             id: discussion.id,
                             image: ((discussion.image_field_preview && discussion.image_field_preview.url) ||
                             (discussion.image_field && discussion.image_field.url)),
                             title: discussion && discussion.title,
                             description: discussion.text_field_preview || discussion.text_field,
                             link: discussion && ('/discussions/' + discussion.id)
                             }*/
                    });
            });
        })

    function makeid(len)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < len; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

};
