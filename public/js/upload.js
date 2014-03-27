function uploadAttachmentIE9(url,input,cbk){
    var callback = 'cbk_' + IE_globalCounter++;
    window[callback] = cbk;
    if(url.indexOf('?') > -1)
        url += '&overrideMethod=PUT';
    else
        url += '?overrideMethod=PUT';
    $(input).attr('name','file');
    $('<form method="post" enctype="multipart/form-data" action="' + url + '" target="hiddenFrame" style="display:none"><input type="hidden" name="something" value="something">'+
        '<input type="hidden" name="callback" value="' + callback + '" >'+
        '</form>').appendTo('body')
        .append(input)
        .submit();
}
var SUPPORT_FILE_API = true, IE_globalCounter = 0;
$(function(){
    if($('<input type="file">')[0].files)
        return;

    SUPPORT_FILE_API = false;
    $('<iframe width="0" height="0" border="0" id="hiddenFrame" name="hiddenFrame"></iframe>').appendTo('body');

});
