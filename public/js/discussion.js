function initDiscussionEditing(discussion,target){

    var original = discussion.text_field.replace(/\r/g,'');
    var mouseDown, mouseUp, top, left, drag;
    var range_txt;
    var range = {};
    var vision_text_history_count = discussion.vision_text_history.length;

    var queryPaper = ".paper";
    var paper = $(queryPaper);


    $(target)
        .on('mousedown', function (e) {
            mouseDown = e;
            $("#old_suggestion_popup").hide();
            console.log(mouseDown);
        })
        .on('keydown', function (e) {
            if(e.keyCode == 16){
                mouseDown = e;
            } else if ((e.shiftKey && (e.keyCode <= 40 && e.keyCode >= 37) || (e.ctrlKey && e.keyCode == 65))) {
                drag = true;
            } else if(!(e.keyCode <= 40 && e.keyCode >= 37)) {
                e.preventDefault();
            }
        })
        .on('keyup', function (e) {
            if(e.keyCode == 16){
                if(drag && paper.hasClass('passed_deadline')) {
                    popupProvider.showOkPopup({message:'עבר הזמן לעריכת המסמך'});
                    mouseDown = null;
                } else {
                    if(!mouseDown || paper.hasClass('paper-closed'))
                        return;
                    e.stopPropagation();
                    mouseUp = e;
                    var err = false;

                    left = Math.ceil((mouseDown.clientX + mouseUp.clientX) / 2 - 97);
                    top = Math.min(mouseDown.clientY, mouseUp.clientY) - $("#new_suggestion_popup").height() - 40 + $(window).scrollTop() + 35;
                    range_txt = window.getSelection().toString();

                    // if we got here after flipping the discussion content to textarea get range easily
                    if ($(this).attr('id') === "discussion_content_textarea") {
                        range = $(this).getSelection();
                        range_txt = range.text;
                    }

                    if (range.length > 0 || range_txt.length > 0) {
                        if (!user._id) {
                            popupProvider.showLoginPopup({}, function (err, result) {
                                if (!err)
                                    window.location = window.location;
                            });
                            return false;
                        }

                        // ie and accessibility work around
                        if (navigator.appName === "Microsoft Internet Explorer" || isNaN(top)) {
                            $("#pop_suggest_bt").click();
                        } else {
                            var offset = $('#discussion_edit_container').offset();
                            $("#old_suggestion_popup").hide();
                            $("#new_suggestion_popup")
                                .css({ top: top - offset.top - 50, left: (e.pageX - 97) - offset.left, opacity: 0 })
                                .show()
                                .animate({ top: '-=20px', opacity: 1 }, 100, 'linear');
                            setTimeout(function () {
                                mouseDown = null;
                            }, 500)
                        }
                    } else {
                        mouseDown = null;
                    }
                }
            }
        })
        .on('dragstart', function (e) {
            e.preventDefault();
        })
        .on('mousemove', function(e){
            if(mouseDown){
                drag = true;
            } else {
                drag = false;
            }
        })
        .on('mouseup', function (e) {
            if(drag && paper.hasClass('passed_deadline')) {
                popupProvider.showOkPopup({message:'עבר הזמן לעריכת המסמך'});
                mouseDown = null;
            } else {
                if(!mouseDown || paper.hasClass('paper-closed'))
                    return;
                e.stopPropagation();
                mouseUp = e;
                var err = false;

                left = Math.ceil((mouseDown.clientX + mouseUp.clientX) / 2 - 97);
                top = Math.min(mouseDown.clientY, mouseUp.clientY) - $("#new_suggestion_popup").height() - 40 + $(window).scrollTop() + 35;

                range_txt = window.getSelection().toString();

                // if we got here after flipping the discussion content to textarea get range easily
                if ($(this).attr('id') === "discussion_content_textarea") {
                    range = $(this).getSelection();
                    range_txt = range.text;
                } else {

                    var flag = discoverRange(range_txt);

                    if (range_txt.length == 0) {
                        mouseDown = null
                        return false;
                    }

                    if (flag === false || (range.start == 0 && range.end == 0)) {
                        var popupConfig = {};
                        popupConfig.message = "קרתה תקלה, נסה שנית";
                        popupConfig.removeCloseButton = true;
                        popupConfig.onOkCilcked = function (e) {
                            e.preventDefault();
                            clicked = 'ok';
                            //   if (flag === false){
                            $('#discussion_content').hide();
                            $('#discussion_content_textarea').show();
                            $('#discussion_content_textarea').css('height', $("#discussion_content_textarea")[0].scrollHeight);
                            $('.read_less').click();
                            $('.read_more').click();
                            //    }
                            $.colorbox.close();
                        },

                            popupProvider.showOkPopup(popupConfig);
                        return false;
                    }
                }

                if (range.length > 0 || range_txt.length > 0) {
                    if (!user._id) {
                        popupProvider.showLoginPopup({}, function (err, result) {
                            if (!err)
                                window.location = window.location
                        });
                        return false;
                    }


                    if (navigator.appName === "Microsoft Internet Explorer") {
                        $("#pop_suggest_bt").click();
                    } else {
                        var offset = $('#discussion_edit_container').offset();
                        $("#old_suggestion_popup").hide();
                        $("#new_suggestion_popup")
                            .css({ top: top - offset.top - 50, left: (e.pageX - 97) - offset.left, opacity: 0 })
                            .show()
                            .animate({ top: '-=20px', opacity: 1 }, 100, 'linear');
                        setTimeout(function () {
                            mouseDown = null;
                        }, 500)
                    }
                } else {
                    mouseDown = null;
                }
            }
        });

    $('body').on('click', '.edit_content', function(){
        var clicked = 'ok';
        //   if (flag === false){
        $('#discussion_content').hide();
        $('#discussion_content_textarea').show();
        $('#discussion_content_textarea').css('height', $("#discussion_content_textarea")[0].scrollHeight);
        $('.read_less').click();
        $('.read_more').click();
        $('#discussion_content_textarea').focus();
    });

    $('#pop_suggest_bt, .pop_suggest_bt').click(function (e) {
        e.stopPropagation();
        e.preventDefault();

        $("#send_suggestion").data('executing', false);
        $("#send_suggestion").removeClass('disable');


        $('#discussion_content_txt').text('"' + range_txt + '"');
        dust.render('request-change-dialog',{
            orig_text: range_txt,
            delete: $(this).hasClass('delete'),
            add: $(this).hasClass('add')
        },function(err,out){
            $.colorbox({
                html:out,
                width:'910px',
                height:'580px',
                onComplete:function(){
                    $(".popup-window").hide();
                    $('.request-change-dialog textarea#discussion_suggest').focus();
                    if($('#discussion_suggest').attr('disabled')){
                        $('.request-change-dialog #discussion_explanation').focus();
                        $('.request-change-dialog textarea#discussion_suggest').val(" ");
                    }
                }
            });


        });
    });

    function discoverRange(text) {
        var t = text;
        var occurences = original.split(text).length - 1;

        if (occurences > 1) return false;

        if (original.indexOf(text) != -1) {//no linebreaks
            range.start = original.indexOf(text);
            range.end = range.start + text.length;
        } else {//chrome
            t = text.replace(" \n", "\n");
            if (original.indexOf(t) != -1) {
                range.start = original.indexOf(t);
                range.end = range.start + t.length;
            } else {
                t = text.replace(/\r/g, "");
                if (original.indexOf(t) != -1) {
                    range.start = original.indexOf(t);
                    range.end = range.start + t.length;
                } else {
                    range.start = 0;
                    range.end = 0;
                    console.log("error");
                }
            }
        }

        console.log("start=" + range.start + " | end=" + range.end);
    }



    $('body').on('click', "#cancelWriteCommentBT", function () {
        $.colorbox.close();
    });

    $('body').mouseup(function (e) {
        var target = $(e.target);
        if (!target.is('.popup-window') || !target.parents('.popup-window').length) {
            $(".popup-window").hide();
        }

//        var container = $(".arrow_box_container");
//
//        if ((container.has(e.target).length === 0) && (!$(e.target).hasClass('grading_button'))) {
//            container.hide();
//            $('.slider-is-open').removeClass('slider-is-open');
//        }
    });


    $('body').on('click', "#send_suggestion", function () {
        var $this = $(this);

        if ($this.data('executing')) {
            return;
        }

        $this.data('executing', true);
        $this.addClass('disable');

        var part = {start: range.start, end: range.end, text: $(".request-change-dialog textarea#discussion_suggest").val()};

        // todo i have replaced vision with original, see that it works
        //arrange spaces
        if (original[part.end - 1] == " " && part.text[part.text.length - 1] != " ")

            part.text += " ";

        // in case of editing existing suggestion
        if ($('#send_suggestion').data('edit') === true) {
            $('#send_suggestion').data('edit', false);

            var sugg_id = $('#send_suggestion').data('suggestion-id');

            db_functions.editSuggestion(sugg_id, part.text, function (err, data) {
                if (!err) {
                    $this.data('executing', false);
                    $this.removeClass('disable');

                    // hide edit box
                    $('#write-comment').hide();

                    // change text of suggestion
                    $('#suggestions_wrapper').find('[data-id=' + sugg_id + ']').find('.alternative_part').text(part.text);

                    // edit button text back t what it used to be
                    $('#send_suggestion').text('הצע');
                }
            })
        } else {
            // create new suggestion
            var explanation = $("#discussion_explanation").val();
            var user_info = {
                user_logged_in: user.first_name ? true : false,
                action_done: (user.actions_done_by_user && user.actions_done_by_user.suggestion_on_object) ? true : false,
                action_name: "suggestion_on_object",
                tokens_owned: user.tokens ? user.tokens : 0,
                price: gamification_price['suggestion_on_discussion']
            }

            db_functions.addSuggestionToDiscussion(discussion._id, vision_text_history_count, [part], explanation, user_info, function doWork(err, data) {
                if (!err) {
                    activateMailNotifications();
                    // vision was updated while composing suggestion
                    if (data.cancel === true) {
                        updateVisionAndSuggestionText(data);
                        $this.data('executing', false);
                        $this.removeClass('disable');
                        return;
                    }
                    $this.data('executing', false);
                    $this.removeClass('disable');


                    if (data != 'canceled') {
                        $.colorbox.close();
                        /*
                         $("textarea#discussion_suggest").val('');
                         $("#user_tokens").text(data.updated_user_tokens);*/

                        render_suggestion(data, true);
                        scrollTo('#' + data.id);
                        $(".deals-box").show();
                        $('#suggestion_number').text(Number($('#suggestion_number').text()) + 1);
                        suggestions_list.push(data);
                    }
                } else {
                    var err = err;
                    if (err.responseText == "a suggestion with this indexes already exist") {
                        popupProvider.showOkPopup({message: "????? ???? ??? ????? ?????? ?????"});
                    }
                }
            });
        }
    });

    function displaySuggestionsRanges() {
        var lines = [];
        suggestions_list = suggestions_list.sort(function(a,b){
            return a.parts[0].start - b.parts[0].start;
        });
        var lastIndex = 0;
        var tab_counter = 0;
        $.each(suggestions_list, function (index, suggestion) {
            //var html = $('#discussion_content').html();
            var text = original.substr(suggestion.parts[0].start, suggestion.parts[0].end - suggestion.parts[0].start);
            //  console.log(text);
            if (suggestion.parts[0].start > original.length || suggestion.parts[0].start < lastIndex) {
                console.log('range problem |' + suggestion.id);
                return
            }
            text = text.replace(/(\r?\n)/g, '<br/>');
            lines.push(original.substr(lastIndex,suggestion.parts[0].start - lastIndex).replace(/(\r?\n)/g, '<br/>'));
            lines.push('<a href="javascript:;" data-tab="' + tab_counter + '" data-id="' + suggestion.id + '" class="marker_1 paper-mark">' + text + '</a>');
            tab_counter++;
            lastIndex = suggestion.parts[0].end;
        });
        lines.push(original.substr(lastIndex,original.length - lastIndex).replace(/(\r?\n)/g, '<br/>'));
        $('#discussion_content').html(lines.join(''));
    }

    $("#discussion_content").on("click", ".marker_1", function () {
        if (!mouseDown) {
            $('#suggestionTab').click();
            var id = $(this).data('id');
            $('html, body').animate({
                scrollTop: $("li.suggestion-item[data-id=" + id + "]").offset().top
            }, 500);
        }
    });
    $("body").on("keydown", ".marker_1", function (e) {
        if (e.keyCode == 13) {
            $('#suggestionTab').click();
            var id = $(this).data('id');
            $('html, body').animate({
                scrollTop: $("li.suggestion-item[data-id=" + id + "]").offset().top
            }, 500);
        }
    });
    $("#old_suggestion_popup").click(function(){
        $('#suggestionTab').click();
        var id = $(this).data('suggestion');
        $('html, body').animate({
            scrollTop: $("li.suggestion-item[data-id=" + id + "]").offset().top
        }, 500);
    });

    var fadeTO;

    $("#discussion_content").on('mouseenter','.marker_1',function(e){
        if ($("#discussion_content").parent().find(".icon-close").hasClass('hide')) return;

        var position = $(e.target).offset();
        var offset = $('#discussion_edit_container').offset();
        left = Math.ceil((position.left + $(e.target).width() / 2) - 97);

        if(fadeTO)
            clearTimeout(fadeTO);
        fadeTO = null;
        $(this).unbind('mouseleave').one('mouseleave',function(){
            fadeTO = setTimeout(function(){
                $("#old_suggestion_popup").hide().data('suggestion','');
            },500);
        });

        var suggestionId = $(this).data('id');
        var $popup = $("#old_suggestion_popup");
        if($popup.data('suggestion') == suggestionId)
            return;

        $popup
            .css({ top: position.top - offset.top - 50, left: left - offset.left, opacity: 0 })
            .show()
            .animate({ opacity: 1 }, 100, 'linear').data('suggestion',suggestionId);

    });

    function updateVisionAndSuggestionText(data) {
        // update vision
        $('#discussion_content_textarea').val(data.text_field);
        $('#discussion_content').html(data.text_field.replace(/\n/g, '<br />'));
        original = $('#discussion_content_textarea').val();

        // update original text
        var original_text = original.substring(range.start, range.end);
        $('#discussion_content_txt').text('"' + original_text + '"');

        // update history
        vision_text_history_count = data.discussion_vision_text_history.length;

        var popupConfig = {};
        popupConfig.popup_text =
            "שים לב: מסמך החזון עודכן לאחרונה. בדוק שההצעה שלך עדיין בתוקף ושהטקסט שסימנת לא השתנה";
        popupProvider.showOkPopup({message: popupConfig.popup_text});
    }

    function activateMailNotifications() {
        db_functions.activateMailNotification(user._id, function (err, data) {});
    };

    var suggestions_list, approved_suggestions_list;

    var suggestion_count, approved_count, post_count = 0;

    var init = function(){
        init_suggestions(function(){
            init_approved(function(){
                init_posts(function(){
                    go_to_hash();
                });
            });
        });
    };

    var go_to_hash = function(){
        //check if there is a hash, and if so find it and open it
        if(window.location.hash){
            var hash = window.location.hash,
                hash_item = $(hash);
            if(hash_item.hasClass('suggestion-item')){
                scrollTo(hash, 1000);
            } else if(hash_item.hasClass('discussion_suggestion_post')){
                var suggestion = hash_item.closest('li.suggestion-item');
                suggestion.find('.toggleComments').click();
                scrollTo(hash, 1000);
            } else if(hash_item.closest('#tab-3')) {
                $('.tab a[href=#tab-3]').click();
                if(hash_item.data('level') == 0){
                    scrollTo($(hash), 1000);
                } else {
                    var main_msg = hash_item.closest('li[data-level=0]');
                    toggleMessage('message-' + main_msg.data('id'));
                    scrollTo($(hash), 1000);
                }
            }
        }
    };

    var init_suggestions = function(callback){
        // get change suggestions and render
        db_functions.getSuggestionByDiscussion(discussion._id, 0, 0, function (err, data) {
            if (err) return false;

            $('#suggestion_number').text(data.meta.total_count);

            suggestions_list = data.objects;
            displaySuggestionsRanges();
            suggestion_count = suggestions_list.length;
            $.each(suggestions_list,function(i,suggestion){
                render_suggestion(suggestion);
            });
            while(suggestion_count > 0){};
            callback();
        });
    };

    var init_approved = function(callback){
        db_functions.getApprovedSuggestionsByDiscussion(discussion._id, 0, 0, function (err, data) {

            approved_suggestions_list = data.objects || {};
            approved_count = approved_suggestions_list.length;
            $.each(approved_suggestions_list,function(i,suggestion){
                render_suggestion(suggestion,false,true);
            });
            while(approved_count > 0){};
            callback();
            $('#approved_suggestion_number').text(data.meta.total_count);
        });
    };

    var sub_post_count = 0;
    //render a main post and responses if the post has any recursively
    var render_post = function(type, data, level, callback){
        sub_post_count++;
        data.user_avatar = avatar;
        dust.render('forum_post', data, function(err, out){
            if(!err){
                if(type == 'main')
                    $('.post-messages-container ul.main_container').append(out);
                else {
                    console.log('reply');
                    $('ul.replies-' + data.parent_id).prepend(out);
                }
            }


            //check if the post has any responses
            if(post_groups[data._id] && post_groups[data._id].length > 0) {
                var child_posts = post_groups[data._id];
                $.each(child_posts, function(i, child_post){

                    var new_level = level + 1;
                    child_post.time = new Date(child_post.creation_date).format('dd.mm.yyyy');
                    child_post.date = new Date(child_post.creation_date).format('HH:MM');
                    child_post.level = level + 1;
                    child_post.reply_level = level + 2;
                    if(child_post.text.length > 140)
                        child_post.text_short = child_post.text.substring(0, 140) + '...';
                    child_post.last = level == 2 ? true : false;
                    child_post.replies = post_groups[child_post._id] && post_groups[child_post._id].length > 0 ? post_groups[child_post._id].length : 0;
                    render_post('child', child_post, new_level);
                });
            }
            sub_post_count--;
            if (sub_post_count == 0 && callback)
                callback();
        });
    };
    var init_posts = function(callback) {
        var data = {
            discussion_id: discussion._id,
            limit: 0,
            sorts: {'creation_date': -1},
            offset: 0
        };
        db_functions.getDiscussionPosts(data, function(err, data){

            page_posts = data.page_posts;
            post_groups = data.post_groups;
            count = data.count;
            var post_count = page_posts.length;
            $('#comments_number').html(count);

            $.each(page_posts, function(i, post){
                post.time = new Date(post.creation_date).format('dd.mm.yyyy');
                post.date = new Date(post.creation_date).format('HH:MM');
                post.level = 0;
                post.reply_level = 1;
                if(post.text.length > 140)
                    post.text_short = post.text.substring(0, 140) + '...';
                post.hidden = true;
                post.replies = post_groups[post._id] && post_groups[post._id].length > 0 ? post_groups[post._id].length : 0;
                render_post('main', post, 0, function(){
                    post_count--;
                    if(post_count == 0) {
                        callback();
                    }
                });
            });
            // check if we have passed teh deadline
            if(new Date(discussion.deadline) < new Date()) {
                passed_deadline = true;
                $('.paper').addClass('passed_deadline');
                $('.paper-edit-text').html('עבר הזמן לעריכת המסמך');
                $('.paper-edit-title').hide();
                $('#tab-3').addClass('hidden');
                $('.message-reply').addClass('hidden');
            }
        });


    };
    init();



//render change suggestion
    function render_suggestion(suggestion, use_animation, is_approved) {
        // get original text and alternative text
        if (suggestion.parts && suggestion.parts.length) {

            if (is_approved){
                suggestion.original_part = suggestion.replaced_text;
                suggestion.alternative_part = suggestion.parts[0].text;

                // set text for context popup
                if (suggestion.context_before && suggestion.context_after && suggestion.context_before !== "undefined") {
                    suggestion.context_before = suggestion.context_before.substring(Math.max(suggestion.context_before.length - 400, 0), suggestion.context_before.length);
                    suggestion.context_after = suggestion.context_after.substring(0, Math.min(suggestion.context_after.length, 400));
                }

            }else{
                suggestion.original_part = function () {
                    var from = suggestion.parts[0].start;
                    var end = suggestion.parts[0].end;
                    return original.substr(from, end - from);
                };

                // set text for context popup
                suggestion.context_before = original.substring(Math.max(suggestion.parts[0].start - 400, 0), suggestion.parts[0].start, suggestion.parts[0].start);
                suggestion.context_after = original.substring(suggestion.parts[0].end, Math.min(original.length, suggestion.parts[0].end + 400));

                suggestion.alternative_part = function () {
                    return suggestion.parts[0].text;
                };
            }

            suggestion.is_approved = !!is_approved;
            suggestion.avatar = avatar;
            suggestion.no_post = paper.hasClass('passed_deadline');
            //suggestion = paper.hasClass('passed_deadline');
            suggestion.to_delete = suggestion.parts.length && (suggestion.parts[0].text == " ");
            dust.render('discussion_suggestion_new', suggestion, function (err, out) {
                $(is_approved ? '#approved_suggestions_wrapper' : '#suggestions_wrapper').append(out);
                image_autoscale($((is_approved ? '#approved_suggestions_wrapper' : '#suggestions_wrapper')  +' .auto-scale img'));

//                if (use_animation == true) {
//                    var bgc = $('.suggestion_holder').last().css('background-color');
//                    $('.suggestion_holder ').last().css('background-color', 'pink');
//                    $('.suggestion_holder ').last().animate({backgroundColor: bgc}, 3000);
//                }
                // check if got here after not logged user tryed to grade suggestion
                var action = getURLParameter('action');
                if (action !== "null") {
                    var id = window.location.hash;
                    action = ".button_" + action;

                    if (!id) return false;

                    $(id).find('.suggestion_bottom_segment ' + action + ' input').click();
                }
                db_functions.getCommentsBySuggestion(suggestion.id, function (err, data) {
                    suggestion.comments = data.objects;
                    dust.renderArray('discussion_suggestion_comment_new',suggestion.comments,null,function(err,out){
                        $('#' + suggestion._id).find('ul').html(out);
                    });
                });
                suggestion_count--;
                approved_count--;
            });
        }
        return null;
    };

    $('#approved_suggestions_wrapper,#suggestions_wrapper').on('click','.toggleComments',function(){
        var $li = $(this).parents('.suggestion-item');
        var suggestionId = $li.data('id');
        var message = $li.find('.primary-message');

        if (message.hasClass('message-closed')) {
            message.removeClass('message-closed');
            message.addClass('message-open');

            $li.find('>ul,>.reply-to-message').removeClass("hide");

            // Transform the button to a close button
            $li.find(' button.review-respond').html('<i class="icon icon-small-pad-left icon-close-comments"></i>סגור');
            var suggestion = $.grep(suggestions_list,function(suggestion){
                return suggestion.id == suggestionId;
            })[0];
            if(!suggestion)
                return;
        }
        else if (message.hasClass('message-open')) {
            message.removeClass('message-open');
            message.addClass('message-closed');

            $li.find('>ul,>.reply-to-message').addClass("hide");

            // Transform the button to a replies button
            $li.find(' button.review-respond').html('תגובות');
        }
    });

    $('#approved_suggestions_wrapper,#suggestions_wrapper').on('click', '.add_suggestion_comment', function (e) {
        activateMailNotifications();
        var $parent = $(this).parents('.reply-to-message');
        var $suggestion = $parent.parents('.suggestion-item');
        var $commentList = $parent.siblings('ul');
        var post_or_suggestion_id = $suggestion.data('id');
        var suggestion = $.grep(suggestions_list,function(suggestion){
            return suggestion.id == post_or_suggestion_id;
        })[0];
        if(!suggestion)
            return;
        var text = $parent.find('textarea').val();

        if (text.trim() == '') return false;


        var add_comment = $(this).parent('.add_comment');
        db_functions.addCommentToSuggestion(post_or_suggestion_id, discussion._id, text, function (err, comment) {
            $parent.find('textarea').val('');
            var file = $('#tab-1 .post-new-message-upload')[0].files[0];

            if(!file)
                return afterPost();

            popupProvider.showLoading({message:'מעלה קובץ...'});

            uploadAttachment(comment._id,file,afterPost);

            function afterPost(error,attachment){
                if(error)
                    return console.error(error);
                if(attachment){
                    comment.attachment = attachment;
                    $.colorbox.close();
                }
                dust.render('discussion_suggestion_comment_new',comment,function(err,out){
                    $commentList.prepend(out);
                });
                $('.new_post .post-new-message-upload').val('');
                $('.new_post .post-new-message-attachment').hide();
            }
        });

    });

    $('.container').on('change','.post-new-message-upload',function(e){
        var file = this.files[0];
        if(file){
            var $parent = $(this).parents('.post-new-message-body');
            $parent.find('.post-new-message-attachment label').text(file.name);
            $parent.find('.post-new-message-attachment').show();
        }
    });

    function uploadAttachment( id, file,cbk){
        var client = new XMLHttpRequest();

        /* Create a FormData instance */
        var formData = new FormData();
        /* Add the file */
        formData.append("upload", file);
        client.open("put", "/api/post_suggestion_attachments/" + id + "?discussion_id=" + discussion._id, true);
        //client.setRequestHeader("Content-Type", "multipart/form-data");
        client.send(formData);  /* Send to server */

        /* Check the response status */
        client.onreadystatechange = function()
        {
            if (client.readyState == 4){
                if(client.status < 200 || client.status >= 300)
                    return cbk(client.status);
                var attachment = JSON.parse(client.responseText);
                cbk(null,attachment);
            }
        }
    }

    // toggle edit class to open/close contxt popup window or edit suggestion button
    $('#approved_suggestions_wrapper, #suggestions_wrapper').on('mouseenter', '.change_proposal',function (e) {
        var edit_window = $(this).parent().find('.edit_window');
        var window_height = edit_window.height();
        var window_padding = parseInt(edit_window.css("padding-top"));
        var window_border = parseInt(edit_window.css("border-top-width"));

        $(this).parents('.suggestion-item').toggleClass('show_context_popup');
//        $(this).parents('.suggestion_wrapper').toggleClass('show_edit_button');

        //set window top
        edit_window.css('top', 10 - window_height - (window_padding * 2 + window_border * 2));

    }).on('mouseleave', '.message-text', function () {

        $('.suggestion-item').removeClass('show_context_popup');
    });

    $('#suggestions_wrapper').on('click', '.edit_window', function (e) {
        $('.btn-read-more').click();
        scrollTo('#discussion_edit_container');
    })

}

function toggleComments(ui) {



}