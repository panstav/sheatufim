
function initDiscussionEditing(target, subject_id, subject_name){
    $(target).click(function () {
        dust.render('subject_shopping_cart', {
            id: subject_id,
            name: subject_name
        }, function (err, out) {
            $.colorbox({
                html: out,
                width: '70%',
                height: '70%',
                onComplete: function () {
                    listCommon.reloadList('shoppingCartItemList', 'information_items', 'subject_shopping_cart_item',
                        {subjects: subject_id});
                }
            });

        })
    });
};
