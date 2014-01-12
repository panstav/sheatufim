$(document).ready(function () {

});

function replyTo(m) {
    queryMessage = "." + m + " > .reply-to-message";
    $(queryMessage).removeClass("hide");
}

function toggleMessage(m) {

    queryMessage = "." + m + " .primary-message";
    message = $(queryMessage);

    if (message.hasClass('message-closed')) {

        message.removeClass('message-closed');
        message.addClass('message-open');

        queryTicker = "." + m + " .primary-ticker > i";
        $(queryTicker).removeClass("icon-expand");
        $(queryTicker).addClass("icon-collapse");

        queryInnerMessages = "." + m + " > ul";
        $(queryInnerMessages).removeClass("hide");
    }
    else if ($(queryMessage).hasClass('message-open')) {

        message.removeClass('message-open');
        message.addClass('message-closed');

        queryTicker = "." + m + " .primary-ticker > i";
        $(queryTicker).removeClass("icon-collapse");
        $(queryTicker).addClass("icon-expand");

        queryInnerMessages = "." + m + " > ul";
        $(queryInnerMessages).addClass("hide");

    }
}

function closeReply(m) {
    queryMessage = "." + m + " > .reply-to-message";
    $(queryMessage).addClass("hide");
}



function togglePaper() {

    queryPaper = ".paper";
    paper = $(queryPaper);

    // Grab the hidden span and anchor
    var more_text = $('body.document-review .paper pre').children('span.more_text');

    if (paper.hasClass('paper-closed')) {

        paper.removeClass('paper-closed');
        paper.addClass('paper-opened');

        $('.paper i.icon-close').removeClass('hide');
        $('.paper .btn-read-more').addClass('hide');

        more_text.show();
        more_text.removeClass('hide');
        $('.more_text_split').hide();

        $('.paper-edit').show();

    }
    else if (paper.hasClass('paper-opened')) {

        paper.removeClass('paper-opened');
        paper.addClass('paper-closed');

        $('.paper i.icon-close').addClass('hide');
        $('.paper .btn-read-more').removeClass('hide');

        more_text.hide();
        more_text.addClass('hide');
        $('.more_text_split').show();

        $('.paper-edit').hide();

    }

    $('#discussion_content_textarea').hide();
    $('#discussion_content').show();
}

function scrollToTop() {
    $('html, body').animate({ scrollTop: $('body').position().top }, 1000);
}

$(document).ready(function () {



    $('.btn-nav-login').bind('click', function (e) {

        e.stopPropagation();

        $bubble = $('.login-bubble');
        $bubble.removeClass('hide');
        $('.login-bubble input[type="text"]:first-of-type').focus();
        $bubble.css({
            'top': $(this).position().top + $(this).outerHeight() + $('.login-bubble .icon-login-bubble-tip').height(),
            'left': $(this).position().left - (($bubble.outerWidth() - $(this).outerWidth()) / 2)
        });

    });

    $(document).bind('click', function (e) {

        if (!$(e.target).is('.login-bubble, .login-bubble *')) {
            if (!$('.login-bubble').hasClass('hide')) {
                $('.login-bubble').addClass('hide');
            }
        }

    });

});

$(window).load(function () {

    // Horizontally & Vertically align the zira image
    $('img.align-me').each(function() {

        $(this).css("top", function () {
            return (230 - $(this).height()) / 2;
        });

        $(this).css("left", function () {
            return (230 - $(this).width()) / 2;
        });

    });

});

$(function () {

    // Grab all the excerpt class
    $('body.document-review .paper pre').each(function () {

        // Run formatWord function and specify the length of words display to viewer
        $(this).html(formatWords($(this).html(), 130));

        // Hide the extra words
        $(this).children('span.more_text').hide();

    });

    $('btn-read-more').click(function(){
        // Grab the hidden span and anchor
        var more_text = $(this).children('span.more_text');

        // Toggle visibility using hasClass
        // I know you can use is(':visible') but it doesn't work in IE8 somehow...
        if (more_text.hasClass('hide')) {
            more_text.show();
            more_text.removeClass('hide');
        } else {
            more_text.hide();
            more_text.addClass('hide');
        }

        return false;
    });

});

// Accept a paragraph and return a formatted paragraph with additional html tags
function formatWords(sentence, show) {

    // split all the words and store it in an array
    var words = sentence.split(' ');
    var new_sentence = '';

    // loop through each word
    for (i = 0; i < words.length; i++) {

        // process words that will visible to viewer
        if (i <= show) {
            new_sentence += words[i] + ' ';

            // process the rest of the words
        } else {

            // add a span at start
            if (i == (show + 1)) new_sentence += '<span class="more_text_split">...</span><span class="more_text hide">';

            new_sentence += words[i] + ' ';

            // close the span tag and add read more link in the very end
            if (words[i+1] == null) new_sentence += '</span>';
        }
    }

    return new_sentence;

}	