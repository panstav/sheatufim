

var db_functions = {

    loggedInAjax: function(options)
    {
        var onError = options.error || function()
        {
            console.log(arguments[2]);
        };
        options.error =  function (xhr, ajaxOptions, thrownError) {
            if(xhr.status == 401 && xhr.responseText == 'not authenticated'){
                connectPopup(function(){
                    onError(xhr,ajaxOptions,thrownError);
                });
            }
            else
                onError(xhr,ajaxOptions,thrownError);
        };
        $.ajax(options);
    },

    getHotObjects: function(callback){
        this.loggedInAjax({
            url: '/api/hot_objects',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);

                callback(data);
            }
        });
    },

    //blogs
    getPopularArticles: function(limit_number,callback){
        this.loggedInAjax({
            url: '/api/articles?order_by=-popularity_counter&limit=' + limit_number,
            type: "GET",
            async: true,
            success: function (data) {
                //    console.log(data);
                callback( data);
            }
        });
    },

    getPopularHeadlines: function(limit_number,callback){
        this.loggedInAjax({
            url: '/api/headlines?limit=' + limit_number,
            type: "GET",
            async: true,
            success: function (data) {
                //   console.log(data);
                callback( data);
            }
        });
    },

    addKilkul: function(text_field, callback){
        this.loggedInAjax({
            url: '/api/kilkuls',
            type: "POST",
            async: true,
            data: {"text_field": text_field},
            success: function (data) {
                callback(null, data);
            }
        });
    },
    getSuccessStories: function(callback){
        this.loggedInAjax({
            url: '/api/success_stories',
            type: "GET",
            async: true,
            success: function (data) {
                callback(data);
            }
        });
    },
    getAndRenderFooterTags:function()
    {
        this.loggedInAjax({
            url:'/api/tags?limit=10',
            type:'GET',
            async:true,
            success:function(data){
                dust.render('footer_tags',data,function(err,out)
                {
                    $('#footer_tags').append(out);
                });
            }
        });
    }

}

$(function(){
   $('body').bind('DOMNodeInserted',function(){
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
       }
   });
});

function image_autoscale(obj, params)
{
    if(!obj.length)
        return;
    params = params || {};
    var fadeIn = params['fade'] || 300;
    obj.css({width:'', height:''}).hide();
    obj.load(function()
    {
        var elm = $(this);
        var parent = $(elm.parent());
        parent.css({'overflow':'hidden'});
        var parent_width = parent.innerWidth();
        var parent_height = parent.innerHeight();
        var parent_prop = parent_width * 1.0 / parent_height;
        parent.css({position:'relative'});

        var width = elm.width();
        var height = elm.height();
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

        elm.css({position:'absolute', width:width, height:height, top:top, left:left});
        elm.fadeIn(fadeIn)
    });

    obj.load();
};