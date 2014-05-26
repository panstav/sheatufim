function uploadAttachmentIE9(url,input,cbk){
    var callback = 'cbk_' + IE_globalCounter++;
    window[callback] = cbk;
    if(url.indexOf('?') > -1)
        url += '&overrideMethod=PUT';
    else
        url += '?overrideMethod=PUT';
		
	var $form = $(input).parents('form');
		
//    var $form = $('#hiddenForm')
	$form.attr('action',url);
	$form.find('input[name=callback]').val(callback);	
    $form.submit();
    /*var $form = $('<form method="POST" enctype="multipart/form-data" action="' + url + '" target="hiddenFrame">'+
        '<input type="hidden" name="callback" value="' + callback + '" >'+
		'<input type="file" name="file">' +
        '</form>').appendTo('body');
		.submit();
		*/
}
var SUPPORT_FILE_API = true, IE_globalCounter = 0;
$(function(){
    if($('<input type="file">')[0].files)
        return;

    SUPPORT_FILE_API = false;
	$('body').addClass('noUploadApi');
    $('<iframe width="0" height="0" border="0" id="hiddenFrame" name="hiddenFrame"></iframe>').appendTo('body');

});
