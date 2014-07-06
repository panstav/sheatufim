$(document).ready(function () {
    var is_tabbing = false,
        $popover = null;
    $('body').keydown(function (e) {
        console.log('keydown called');
        var code = e.keyCode || e.which;
        if (code == '9') { //tab
            console.log('tabbing');
            is_tabbing = true;
            //workaround for marker navigation
            // (explicitly focusing on next maker...)
            if($(e.target).hasClass('marker_1')) {
                var next_tab_id = $(e.target).data('tab') + 1,
                    $next_tab = $("#discussion_content a[data-tab=" + next_tab_id + "]");
                if($next_tab.length)
                    $("#discussion_content a[data-tab=" + next_tab_id + "]").focus();
                else
                    $('#suggestionTab').focus();
            }
            //workaround for textarea editor navigation...
            if($(e.target).hasClass('discussion_content_textarea')) {
                $('#suggestionTab').focus();
            }
        }
    });

    // bind a click event to the 'skip' link
    $(".skip").click(function(event){
        // strip the leading hash and declare
        // the content we're skipping to
        var skipTo="#"+this.href.split('#')[1];

        // Setting 'tabindex' to -1 takes an element out of normal
        // tab flow but allows it to be focused via javascript
        $(skipTo).attr('tabindex', -1).on('blur focusout', function () {

            // when focus leaves this element,
            // remove the tabindex attribute
            $(this).removeAttr('tabindex');

        }).focus(); // focus on the content container
    });

    $('body').mouseup(function (e) {
        is_tabbing = false;
        $('body').find('.focused').removeClass('focused');
    });


    $('body').on('focus', "a, input, li, button", null, function (event) {
        if (is_tabbing) {
            console.log('focused added');
            $(event.target).addClass("focused");
        }
    }).on('blur', "*", null, function (event) {
        $(event.target).removeClass("focused");
    });

    $(document).on('focus', '.qq-uploader input', function(event){
        if (is_tabbing) {
            $(event.target).closest('.user_image').addClass("focused");
        }
    }).on('blur', ".qq-uploader input", null, function (event) {
        $(event.target).closest('.user_image').removeClass("focused");
    });

    $(document).on('focus', '.email_settings input', function(event){
        if (is_tabbing) {
            $(event.target).next('label').addClass("focused");
        }
    }).on('blur', ".email_settings input", null, function (event) {
        $(event.target).next('label').removeClass("focused");
    });

    $(document).on('focus', '.paper-mark', function(event){
        if (is_tabbing) {
            $(event.target).mouseenter();
        }
    });
});

