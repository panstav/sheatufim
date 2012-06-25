
dust.filters['time'] = function(a){
    console.log(a);
    var date = $.datepicker.formatDate('dd.mm.yy', new Date(Date.parse(a)));
    var hours = (new Date(Date.parse(a))).getHours();
    var minutes = (new Date(Date.parse(a))).getMinutes();
    if(minutes < 10)
        minutes = "0" + minutes;
    var time = hours + ":" + minutes;

    return date + " " + time;
};

dust.filters['round'] = function(num){
    return Math.round(num);
};

dust.filters['date'] = function(a){
    return $.datepicker.formatDate('dd.mm.yy', new Date(Date.parse(a)));
};

dust.filters['length'] = function(arr) {
    return arr.length;
};

dust.filters['grade'] = function(grade) {
    return Math.round(grade * 100)/100;
};
var tags_replace = {
    'b' : 'b',
    'i' : 'i',
    'u' : 'u',
    's': 's'
};

dust.filters['tags'] = function(text) {
    $.each(tags_replace,function(key,value) {
        text = text.replace(RegExp('\\[' + key + '\\]','g'),'<' + value + '>').replace(RegExp('\\[\\/' + key +  '\\]','g'),'</' + value + '>')
    });
    text = text.replace(/\[list\]/g,'<ul><li>').replace(/\[\/list\]/g,'</li></ul>');
    text = text.replace(/\[\*\]/g,'</li><li>').replace(/<ul><li>(.|\n)*?<\/li>/g,'<ul>');
    text = text.replace(/\[url(?:=([^\]]*))\]((?:.|\n)*)?\[\/url\]/,'<a href="$1" target="_blank">$2</a>')
    text = text.replace(/\[url\]((?:.|\n)*)?\[\/url\]/,'<a href="$1" target="_blank">$1</a>')

    return text;
};

dust.filters['post'] = function(text) {
    text = dust.filters['tags'](text);



    text = text.replace(/\[quote="([^"]*)"\s*\]\n?((?:.|\n)*)?\n?\[\/quote\]\n?/g,
        '<div class="post_quote"><a class="ref_link" href="javascript:void(0);">' +
            ' $1 כתב:' +
            '</a><br>' +
            '$2' + '</div>');
    text = text.replace(/\n/g, '<br>');
    return text;
}

dust.renderArray = function(template,arr,callback,endCallback)
{
    var out_arr = [];
    var _err = null;
    for(var i=0; i<arr.length; i++)
    {
        dust.render(template,arr[i],function(err,out){
            if(callback)
                callback(err,out);
            if(err)
                _err = err;
            out_arr.push(out);
        });
    }
    if(endCallback)
        endCallback(_err,out_arr.join(''));
};

var scrollTo = function(selector, options){
    options = options || {};
    var offset = $(selector).offset();
    if (offset) {
        $('html, body').animate({
            scrollTop:offset.top
        }, options.duration || 800);
        return true;
    }
    return false;
}

var connectPopup = function(callback){

    //open popup window

    alert('please login');

    if(callback)
        callback();
};



// handle image loading stuff

$(function(){

    function initTooltip(ui){
        ui.tooltip({
            bodyHandler: function() {
                return "" +
                    "בקרוב"
            },
            showURL: false
        });
        ui.attr('disabled','disabled');
        ui.attr('href','javascript:void(0)');
    }

    function initTooltipWithMessage(ui, message){
        ui.tooltip({
            bodyHandler: function() {
                return "" +
                    message
            },
            showURL: false
        });
        ui.attr('disabled','disabled');
        ui.attr('href','javascript:void(0)');
    }


    $('#failureForm').live('submit', function(e){
        e.preventDefault();
        var feedbackTb=this.feedbackTb;
        if(feedbackTb.value.replace(/\s/g,"") == ""){
            return;
        }
        db_functions.addKilkul(this.feedbackTb.value ,function(error,data){
            if(error){
                console.log(error);
            }else{
                feedbackTb.value='';
            }
        });

    });
    db_functions.getAndRenderFooterTags();


    var callback = function(event){
        var target_element = event.srcElement || event.target;
        if(target_element){
            if($(target_element).is('.auto-scale'))
                image_autoscale($('img',target_element));
            else
            {
                var autoscale = $('.auto-scale',target_element);
                if(autoscale.length)
                    image_autoscale($('img',autoscale));
            }
            if($(target_element).is('.gray_and_soon'))
                initTooltip($(target_element));
            else
            {
                var tooltip = $('.gray_and_soon',target_element);
                if(tooltip.length)
                    initTooltip(tooltip);
            }
        }
    };

    if($.browser.msie && Number($.browser.version) == 8)
    {
        var _append = Element.prototype.appendChild;
        Element.prototype.appendChild = function()
        {
            _append.apply(this,arguments);
            callback({srcElement:this});
        };
    }
    else
        $('body').bind('DOMNodeInserted',callback);

    image_autoscale($('.auto-scale img'));
    initTooltip($(".gray_and_soon"));
    initTooltipWithMessage($(".cycle_comming_soon"), "כאן יתקיים התהליך למימוש המציאות הנדרשת שהסכמנו לגביה במערכת הדיונים, באמצעות פעולות, אירועים ועדכונים שוטפים. יעלה בקרוב."   );
    initTooltipWithMessage($(".action_comming_soon"), "יעלה בקרוב");
});

function image_autoscale(obj, params)
{
    if(!obj.length)
        return;
    params = params || {};
    var fadeIn = params['fade'] || 300;
    obj.css({width:'', height:''}).hide();
    obj.parent().addClass('image_loading');
    obj.load(function()
    {
        var elm = $(this);
        var parent = $(elm.parent());
        parent.removeClass('image_loading');
        parent.css({'overflow':'hidden'});
        var parent_width = Number(parent.css('width').replace(/[^\d]/g,'')) || parent.innerWidth();
        var parent_height = Number(parent.css('height').replace(/[^\d]/g,'')) || parent.innerHeight();
        var parent_prop = parent_width * 1.0 / parent_height;
        parent.css({position:'relative'});

        var width = elm.width();
        var height = elm.height();
        if(!width)        {
            elm.css({position:'absolute', height:parent_height});
        } else if(!height) {
            elm.css({position:'absolute', width:parent_width});
        } else {
            var prop = width * 1.0 / height;
            var top=0.0, left=0.0;
            if( prop < parent_prop)
            {
                width = parent_width;
                height = width / prop;
                top = (parent_height - height)/2;
            }
            else
            {
                height = parent_height;
                width = height * prop;
                left = (parent_width - width)/2;
            }

            elm.css({position:'absolute', height:height, top:top, left:left});
        }
        elm.fadeIn(fadeIn)
    });

    obj.load();
};
