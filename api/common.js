var util = require('util');

var jest = require('jest'),
    models = require('../models'),
    fs = require('fs'),
    path = require('path'),
    async = require('async');
var formage = require('formage-admin').forms;

var knox;
try
{
    knox = require('knox');
}
catch(e)
{
}

var ACTION_PRICE = 2;

var user_public_fields = exports.user_public_fields = {
    id: null,
    first_name: null,
    last_name: null,
    avatar_url: null,
    score: null,
    num_of_given_mandates: null,
    num_of_proxies_i_represent: null,
    has_voted: null,
    no_mail_notifications: null  ,
    identity_provider:null,
    occupation: null
};



var SessionAuthentication = exports.SessionAuthentication = jest.Authentication.extend({
    init:function(allowAnonymous){
        this._super();
        this.allowAnonymous = allowAnonymous;
    },
    is_authenticated : function(req, callback){

        //noinspection JSUnresolvedFunction
        var is_auth = req.isAuthenticated();
        if(is_auth)
        {
            var user_id = req.session.user_id;
            if(!user_id){
                callback({message: "no user id"}, null);
            }else{
                models.User.findById(user_id, function(err,user)
                {
                    if(err)
                        callback(err);
                    else
                    {
                        if(!user) {
                            if(req.method != 'GET')
                                callback(null,false);
                            else
                                callback(null,true);
                            return;
                        }
                        req.user = user;
                        // save user last visit
                        // to avoid many updates to the db, don't save if the difference is less than 2 minutes
                        if( !user.last_visit || (new Date() - user.last_visit  > 1000*60*2))
                            models.User.update({_id:user._id},{$set:{last_visit: new Date()}},function(err) {
                                if(err) {
                                    console.error('failed setting last visit',err);
                                }
                                else
                                    console.log('saved last visit');
                            });
                        var is_activated = user.is_activated;
                        var is_suspended = user.is_suspended;

                        if (req.method == 'GET' || (is_activated && !is_suspended))
                            callback(null, true);
                        else {
                            callback({code:401, message: is_suspended ? 'suspended' : 'not_activated'});
                        }
                    }
                });
            }
        }
        else
        {
            if(this.allowAnonymous && req.method == 'GET')
                callback(null,true);
            else
                callback(null,false);
        }
    }
});

/**
 * Base API Resources for model based resources
 */
exports.BaseModelResource = jest.MongooseResource.extend({
    init:function(model){
        this._super(model);
        this.authentication = new SessionAuthentication();
    }
});

/**
 * Base API Resources for bare resources
 */
exports.BaseResource = jest.Resource.extend({
    init:function(){
        this._super();
        this.authentication = new SessionAuthentication();
    }
});

/**
 * Base class for authorization
 */
exports.BaseAuthorization = jest.Authorization;


var isArgIsInList = exports.isArgIsInList = function(arg_id, collection_list){
    var flag = false;
    for (var i = 0; i < collection_list.length; i++){
        arg_id = arg_id || arg_id.id;
        if (arg_id == collection_list[i].id){
            flag = true;
            break;
        }
    }
    return flag;
};




var threshold_calc_variables = {};
function load_threshold_calc_variables(){
    models.ThresholdCalcVariables.findOne({},function(err,doc)
    {
        if(doc)
            threshold_calc_variables = doc._doc;
        if(err)
            console.error(err);
    });
};

load_threshold_calc_variables();

models.ThresholdCalcVariables.schema.pre('save',function(next)
{
    setTimeout(load_threshold_calc_variables, 1000);
    next();
});

exports.getThresholdCalcVariables = function(type)
{
    return threshold_calc_variables[type] || 0;
};


/**
 * Upload file from http request.
 * Content type is file
 * @param req
 * Http request with content-type as file, body is the file stream
 * @param callback
 * function(err, {url:'uploaded file url',path:'uploaded file path on server'})
 */
var uploadHandler = exports.uploadHandler = function(req,callback) {
	var sanitize_filename = function(filename, is_dev) {
			// This regex matches any character that's not alphanumeric, '_', '-' or '.', thus sanitizing the filename.
			// Hebrew characters are not allowed because they would wreak havoc with the url in any case.
			var regex = /[^-\w_\.]/g;
			return decodeURIComponent(filename).replace(regex, '-');
		},
		filename_to_path = function (filename, is_dev) {
            if(is_dev)
			    return path.join(__dirname,'..','public','cdn', filename);
            else
                return path.join(__dirname,'..', '..','public','cdn', filename);

        },
		create_file = function (filename, is_dev, callback) {

			// This function attempts to create 0_filename, 1_filename, etc., until it finds a file that doesn't exist.
			// Then it creates that and returns by calling callback(null, name, path, stream);
			var attempt = function (index) {
				var name = index + '_' + filename;
				var path = filename_to_path(name, is_dev);
				fs.exists(path, function (exists) {
					if (exists) {
						attempt(index + 1);
					} else {
						// File doesn't exist. We can create it
						callback(null, name, path, fs.createWriteStream(path));
					}
				});
			};
			attempt(0);
		},
		writeToFile = function (is_dev, fName, stream, callback){

			create_file(sanitize_filename(fName), is_dev, function (err, filename, fullPath, os) {
				if (err) return callback(err);

                // listen to stream data events
				stream.on('data',function(data) {
					os.write(data);
				});

				stream.on('end',function() {
                    // when stream ended, close the file
					os.on('close', function () {
                        // when file is successuly closed
						callback(null,{
							url: '/cdn/' + filename,
							path: fullPath
						});
					});

					os.end();
				});

                // start receiving the stream
				stream.resume();
			});
		};

    var fName = req.header('x-file-name');
    var fType = req.header('x-file-type');

    if(!fName && !fType)
        return callback({code:404,message:'bad file upload'});

    var stream = req.queueStream || req;
    var is_dev = req.app.get('is_developement');

    writeToFile(is_dev, fName, stream,callback);
};



/**
 * Ensure cdn folder exists, all file uploads will go to this folder
 */
if(!fs.existsSync(path.join(__dirname,'..','public','cdn'))){
    console.log('create folder ' + path.join(__dirname,'..','public','cdn'));
    fs.mkdirSync(path.join(__dirname,'..','public','cdn'));
}
