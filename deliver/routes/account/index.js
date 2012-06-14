/**
 * Created by JetBrains WebStorm.
 * User: ishai
 * Date: 2/13/12
 * Time: 12:34 PM
 * To change this template use File | Settings | File Templates.
 */
var sys = require('util')
    ,mongoose = require('mongoose')
    ,common = require('./common')
    ,middlewares = require('./middlewares');

exports.SimpleAuthentication = require('./authentication');
exports.referred_by_middleware = middlewares.referred_by_middleware;
exports.auth_middleware = middlewares.auth_middleware;


exports.routing = function(router)
{
    router.post('/register',require('./register'));

    router.all('/login',require('./login'));

    router.get('/facebooklogin',require('./facebook_login'));

    router.get('/logout', require('./logout'));

};


var https = require("https");


exports.facebookShare = require('./facebook_share');

//
//
//var forms = require('j-forms').forms;
//
//var UserForm = function(request,options)
//{
//    UserForm.super_.call(this,request,options,Models.User);
//};
//
//require('util').inherits(UserForm,forms.MongooseForm);
//
//UserForm.prototype.get_fields = function()
//{
//    UserForm.super_.prototype.get_fields.call(this);
//    this.fields = {
//        'avatar' : this.fields['avatar']
//    };
//};
//
//
//exports.edit_user = function(req,res)
//{
//    var user_id = req.session.user_id;
//    Models.User.findById(user_id,function(err,user)
//    {
//        var form = new UserForm(req,{instance:user});
//        if(req.method == 'GET')
//        {
//            // render page with form
//            //res.render()
//            var input = form.fields.avatar.render_str();
//            res.render('change_avatar.ejs',{input:input,
//                tab:'users'
//            });
//        }
//        else
//        {
//            form.is_valid(function(err,is_valid)
//            {
//                if(is_valid)
//                {
//                    form.save(function(err,result)
//                    {
//                        // saved
//                        res.render();
//                    });
//                }
//            });
//        }
//    });
//};
//
//

