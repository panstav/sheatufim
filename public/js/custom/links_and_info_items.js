var get_and_render = {
    info_items: function(subject_id){
        var info_items_data = {
            subjects: subject_id,
            limit: 3,
            sorts: {'creation_date': -1},
            offset: 0
        };
        db_functions.getInfoItemsOfSubject(info_items_data, function(err, res){
            if(err) return;
            dust.renderArray('information_item_sidebar', res.objects, function(err, html){
                if(err) return;
                $('.list.information_items').html(html);
            })
        });
    },
    links: function(subject_id){
        var links_data = {
            subjects: subject_id,
            limit: 6,
            sorts: {'creation_date': -1},
            offset: 0
        };

        db_functions.getLinksOfSubject(links_data, function(err, res){
            if(err) return;
            dust.renderArray('link_sidebar', res.objects, function(err, html){
                if(err) return;
                $('.list.links').html(html);
            })
        });
    }
}

