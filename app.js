'use strict';

console.log(process.env);

require('./lib/memory');

var express = require('express');
var util = require('util');
var utils = require('./utils');
var mongoose = require('mongoose');
var async = require('async');
var domain = require('domain');
var auth = require("connect-auth");
var formage_admin = require('formage-admin');
var config = require('./config');
formage_admin.forms.loadTypes(mongoose);



var app = module.exports = express();
app.set('show_only_published', process.env.SHOW_ONLY_PUBLISHED == '1');
utils.setShowOnlyPublished(app.settings.show_only_published);

console.log('Show only published',app.get('show_only_published'));

var logout_handler = require("connect-auth/lib/events").redirectOnLogout("/");
var account = require('./routes/account');
var fb_bot_middleware = require('./routes/fb_bot/middleware');

// ########### Static parameters ###########
var IS_ADMIN = false;

var IS_PROCESS_CRON = (process.argv[2] === 'cron');
var IS_PROCESS_WEB = !IS_PROCESS_CRON;

var auth_middleware = auth({
    strategies: [
        account.SimpleAuthentication(),
        account.FbServerAuthentication(),
        auth.Facebook(config.fb_auth_params)
    ],
    trace: true,
    logoutHandler: logout_handler
});
// ########### Static parameters ###########


// Run some compilations
// Run some compilations
require('./tools/compile_dust_templates');



// ######### connect to DB #########
if (!mongoose.connection.host) {
    mongoose.connect(config.DB_URL, {safe: true}, function (db) { console.log("connected to db %s:%s/%s", mongoose.connection.host, mongoose.connection.port, mongoose.connection.name); });
    mongoose.connection.on('error', function (err) { console.error('db connection error: ', err); });
    mongoose.connection.on('disconnected', function (err) {
        console.error('DB disconnected', err);
        setTimeout(function () {mongoose.connect(config.DB_URL, function (err) { if (err) console.error(err); });}, 200);
    });
}
// ######### end connect to DB #########



// ######### settings #########

app.settings['x-powered-by'] = 'Empeeric';
app.set('views', __dirname + '/views');
app.set('public_folder', __dirname + '/public');
app.set('port', process.env.PORT || 80);
app.set('facebook_app_id', config.fb_auth_params.appId);
app.set('facebook_secret', config.fb_auth_params.appSecret);
app.set('facebook_app_name', config.fb_auth_params.appName);

// TODO delete?
app.set('facebook_pages_admin_user', "uri@uru.org.il");
app.set('facebook_pages_admin_pass', "uruuruuru");
//

app.set('sendgrid_user', process.env.SENDGRID_USER || config.sendgrid_user);
app.set('sendgrid_key',process.env.SENDGRID_KEY || config.sendgrid_key);
app.set('root_path', config.ROOT_PATH);

// TODO delete?
app.set('url2png_api_key', process.env.url2png_api_key || 'P503113E58ED4A');
app.set('url2png_api_secret', process.env.url2png_api_key || 'SF1BFA95A57BE4');
//

app.set('is_developement', app.settings.env == 'development');

app.set('send_mails', true);
app.set('view engine', 'jade');
app.set('view options', { layout: false });
formage_admin.forms.setAmazonCredentials(config.s3_creds);
if(app.settings.env == 'staging' || app.settings.env == 'production'){
    formage_admin.forms.setUploadDirectory(config.upload_dir);
}

var models = require('./models');
models.setDefaultPublish(app.settings.show_only_published);
// ######### settings #########


// ######### error handling #########

// ######### general middleware #########
app.use(function(req,res,next){ 
    if(req.header('content-type') && req.header('content-type').indexOf('multipart') > -1){
		console.log('Pausing req stream');
		req.pause();
	}
	next();
});
app.use(express.compress());
app.use(express.static(app.get('public_folder')));
app.use(express.static(require('path').join(__dirname,'..','public')));
formage_admin.serve_static(app, express);
app.use(express.errorHandler());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({secret: 'Rafdo5L2iyhcsGoEcaBd', cookie: { path: '/', httpOnly: false/*, maxAge: 60 * 24 * 60 * 60 * 1000*/}}));
// ######### general middleware #########

// ########### Add request memory logger after 'static' folders ###########
express.logger.token('mem', function () { var p = process, r_mem = (p.memoryUsage().rss / 1048576).toFixed(0); if (r_mem > 400) p.nextTick(p.exit); return util.format('%dMb', r_mem); });
express.logger.format('default2', ':mem :response-time :res[content-length] :status ":method :url HTTP/:http-version" :res[body]');
app.use(express.logger('default2'));
// ########### setup memory logging ###########

// ######### specific middleware #########
app.use(fb_bot_middleware);
app.use(account.referred_by_middleware);
app.use(auth_middleware);
app.use(account.auth_middleware);
app.use(account.populate_user);
// ######### specific middleware #########

// ######### locals #########
app.use(function (req, res, next) {
    if(req.query.overrideMethod)
        req.method = req.query.overrideMethod;
    //noinspection JSUnresolvedVariable
    res.handle500 = function(err){
        console.error(err);
        res.render('500.ejs', {error: err});
    };

    res.locals({
        tag_name: req.query.tag_name,
        logged: req.isAuthenticated && req.isAuthenticated(),
        user_logged: req.isAuthenticated && req.isAuthenticated(),
        user: req.user,
        avatar: (req.session && req.session.avatar_url) || "/images/default_user_img.gif",
        url: req.url,
        meta: {},
        is_dev: app.settings.env == 'development' || app.settings.env == 'staging'
    });
    next();
});

app.locals({
    footer_links: function (place) {
        var links = mongoose.model('FooterLink').getFooterLinks();
        var non_cms_pages = {'about': 1, 'team': 1, 'founders': 1, 'qa': 1};
        var ret = links.filter(function (item) {return item[place];}).map(function (menu) {
            var page_prefix = menu.tab in non_cms_pages ? '/' : '/page/';
            var link = menu.link ? menu.link : (page_prefix + menu.tab);
            return {link: link, name: menu.name};
        });
        return ret;
    },
    general_stuff: function(){
        var general_shit = mongoose.model('General').getGeneral();
        return general_shit.text;
    },
    cleanHtml: function (html) { return (html || '').replace(/<[^>]*?>/g, '').replace(/\[[^\]]*?]/g, '');},
    fb_description: config.fb_general_params.fb_description,
    fb_title: config.fb_general_params.fb_title,
    fb_image: config.fb_general_params.fb_image,
    get: function (attr) {
        return app.get(attr);
    }
});

app.locals({
    writeHead: function(name) {
        var isDev = true/*app.settings.env == 'development' || app.settings.env == 'staging'*/;
        function headFromSrc(src, type) {
            switch (type) {
                case 'js':
                    return '<script src="' + src + '" type="text/javascript"></script>';
                case 'css':
                    return '<link href="' + src + '" rel="stylesheet" type="text/css"/>';
                default:
                    throw new Error('unknown type ' + type);
            }
        }
        var conf = config.headConfigs[name];
        var type = conf.type;
        if (isDev)
            return _.map(conf.src,
                function (src) {
                    return headFromSrc(src, type);
                }).join('\n');
        else {
            var final = conf.final || ( conf.min === false || type == 'css' ? '/dist/' + type + '/' + conf.name + '.' + type : '/dist/' + type + '/' + conf.name + '.min.' + type);
            return headFromSrc(final, type);
        }
    }
});
// ######### locals #########

// ######### environment specific settings #########

app.configure('development', function(){
    app.set('send_mails', true);
    IS_ADMIN = true;
    //app.set('listenHttps',true);
});

app.configure('staging',function(){
    IS_ADMIN = true;
    // ######### error handling #########
    app.set('listenHttps',false);
    
    process.on('uncaughtException', function(err) {
        console.error('*************************  unhandled exception !!!!! ********************************');
        console.error(err);
        console.error(err.stack);
    });

});

app.configure('production',function(){
    app.use(function (req, res, next) {
        if(req.headers['host'] == 'sheatufim-roundtable.org.il')
            return res.redirect('http://www.sheatufim-roundtable.org.il' + req.url);
        next();
    });
    app.set('listenHttps',true);
    // ######### error handling #########
    process.on('uncaughtException', function(err) {
        console.error('*************************  unhandled exception !!!!! ********************************');
        console.error(err);
        console.error(err.stack);
    });

});

if (IS_ADMIN) {
    require('./admin')(app);
}

if (IS_PROCESS_WEB) {
    require('./api')(app);
    require('./og/config').load(app);
    require('./lib/templates').load(app);
    require('./routes')(app);
    require('./api/common');
}

if (app.get('send_mails')) {
    require('./lib/mail').load(app);
}

if (IS_PROCESS_CRON) {
    var cron = require('./cron');
    cron.run(app);
}
// ######### environment specific settings #########

// run web init
if (IS_PROCESS_WEB) {
    async.waterfall([
        function (cbk) {
            mongoose.model('FooterLink').load(cbk);
        },

        function (cbk) {
            mongoose.model('General').load(cbk);
        }
    ], function (err, general) {
//        app.set('general', general);

        // Redirect http to https
        var server;

        if(app.get('listenHttps')){
            // create HTTPS server, listen on 443
            var fs = require('fs');
            var privateKey = fs.readFileSync(__dirname + '/cert/key.pem').toString();
            var certificate = fs.readFileSync(__dirname + '/cert/cert.cer').toString();
            server = require('https').createServer({key: privateKey, cert: certificate},app).listen(443);

            // create HTTP server that redirects to HTTPS
            require('http').createServer(function(req,res){
                var domain = req.headers['host'].toLowerCase();
                if(domain == 'sheatufim-roundtable.org.il'){
                    res.writeHead(301, {
                        'Location': 'https://sheatufim-roundtable.org.il' + req.url
                    });
                    return res.end();
                }
                app(req,res);
            }).listen(app.get('port'));
        }
        else {
            console.log('listening on port ',app.get('port'));
            server = app.listen(app.get('port'), function (err) {
                if (err) {
                    console.error(err.stack || err);
                    process.exit(1);
                }
                console.log("Express server listening on port %d in %s mode", (server.address() || {}).port, app.get('env'));
            });
        }
        server.on('error', function (err) {
            console.error('********* Server Is NOT Working !!!! ***************\n %s', err);
        });
    });
}



// Redirect http to https
// require('http').createServer(function(req,res){
//    var url = req.url;
//    res.redirect('https://' + req.headers['host'] + req.url);
//}).listen(app.get('port'));
