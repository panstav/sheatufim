var config = {};

config.upload_dir = require('path').join(__dirname,'..','public','cdn');

config.sendgrid_user = 'app2952775@heroku.com';
config.sendgrid_key = 'a0oui08x';
config.systemEmail = 'maagal@sheatufim.org.il';
config.systemEmailName = 'SHEATUFIM';

config.DB_URL = process.env['MONGOLAB_URI'] || 'mongodb://localhost/idemos';
config.ROOT_PATH = process.env.ROOT_PATH || 'http://dev.empeeric.com';

// facebook app params
config.fb_auth_params = {
    appId : process.env['FACEBOOK_APPID'] || '',
    appSecret: process.env['FACEBOOK_SECRET'] || '',
    appName: process.env['FACEBOOK_APPNAME'] || '',
    callback: config.ROOT_PATH + '/account/facebooklogin',
    scope: 'email,publish_actions',
    failedUri: '/noauth'
};

config.fb_general_params = {
    fb_title: '',
    fb_description:  'אתר "מעגלי השיח" מבית שיתופים נועד לתמוך בתהליכי שיח רבי משתתפים באמצעות סביבה אינטרנטית נגישה, המותאמת לכל תהליך ופתוחה למשתמשים מורשים בלבד.',
    fb_image: ''
};
config.hosts = [
    'www.sheatufim-roundtable.org.il',
    'www.sheatufim-roundtable.org.il:8080',
    'localhost:8080',
    'dev.empeeric.com'
];

/**
 * Static fils configuration
 */
config.headConfigs = {
    css_includes:{
        type:'css',
        name:'includes',
        src:[
            '/css/reset.css',
            '/css/style.css',
            '/css/feedback.css',
            '/css/colorbox.css',
            '/css/loginpop.css',
            '/css/myuruproxy.css',
            '/css/jquery.tooltip.css',
            '/css/select2.css'
        ]
    },
    js_includes:{
        type:'js',
        name:'includes',
        src:[

            '/js/jquerypp/jquery-1.10.2.js',
            '/js/jquerypp/jquery-ui-1.9.1.custom.min.js',
            '/js/lib/dust-full-0.3.0.js',
           // '/js/InfoBox.js',
            '/js/lib/fileuploader.js',
            '/js/upload.js',
            '/js/imgscale.jquery.min.js',
            '/js/jquerypp/jqtouch.min.js',
            '/js/jquerypp/jquery-fieldselection.js',
            '/js/jquerypp/jquery.autoellipsis-1.0.8.min.js',
            '/js/jquerypp/jquery.colorbox-min.js',
            '/js/jquerypp/jquery.cycle.all.js',
            '/js/jquerypp/jquery.easing.1.3.js',
            '/js/jquerypp/jquery.placeholder.min.js',
            '/js/jquerypp/jquery.tools.min.js',
            '/js/jquerypp/jquery.tooltip.min.js',
            '/js/jquerypp/jquery.compare.js',
            '/js/jquerypp/jquery.range.js',
            '/js/jquerypp/jquery.selection.js',
            '/js/jquerypp/jquery.truncate.js',

            '/js/jquery.cookie.js',
            '/js/lib/date.format.js',
            '/js/select2.js',


            /*'/plugins/ckeditor/ckeditor.js',
             '/plugins/ckeditor/adapters/jquery.js',*/

            '/js/common.js',
            '/js/compiled_templates.js',
            '/js/db.js',
            '/js/fb.js',
            '/js/lib/search.js',
            '/js/timeline-min.js',
            '/js/storyjs-embed.js',
            '/js/tokensbar_model.js',
            '/js/listCommon.js',
            '/js/popupProvider.js',
            '/js/proxy_common.js',
            '/js/lib/maps.js',

            '/js/jquerypp/jquery.movingboxes.js',
            '/js/jquerypp/jquery.dotdotdot-1.5.6-packed.js',
            '/js/timeline.js',
            '/js/countdown.js',
            '/js/custom/script.js',
            '/js/custom/links_and_info_items.js',
            '/js/lib/bootstrap.js',
            '/js/accessibility.js'

            /*'/js/jquerypp/jquery.dotdotdot-1.5.6-packed.js'*/
        ]
    }
};

module.exports = config;
