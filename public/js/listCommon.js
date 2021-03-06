
var listCommon = (function(){
    return {
            reloadList: function (uiContainerId,original_type ,template_name,query,cbk ){
                var jqueryContainer  = $('#'+uiContainerId)  ;
                if(!query){
                  query={};
                }
                db_functions.getListItems(original_type, query, function(err,data){
                    jqueryContainer.css('height',jqueryContainer.height());
                    jqueryContainer.empty();
                    $.each(data.objects,function(index,elm)
                    {
                        elm._index = index;
                        elm.get_link = function()
                        {
                            return '/' + original_type + '/' + elm._id;
                        };
                        elm.get_link_uri = function()
                        {
                            return encodeURIComponent(elm.get_link());
                        }
                        if(template_name == "discussion_list_item_new") {
                            elm.deadline = new Date(elm.deadline) < new Date() ? null : elm.deadline;
                        }
                    });

                    dust.renderArray(template_name,data.objects,null,function(err,out)
                    {
                        jqueryContainer.append(out);
                        jqueryContainer.css('height','');
                       // $('#mainList img').autoscale();
                    });
                    if(cbk)
                        cbk();
                });
            }
        }
})() ;