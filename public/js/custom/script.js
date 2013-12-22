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

function scrollToTop(){
    $('html, body').animate({scrollTop:$('body').position().top}, 1000);
}