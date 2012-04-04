/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 22/02/12
 * Time: 14:33
 * To change this template use File | Settings | File Templates.
 */

dust.renderArray = function(template,arr,callback)
{
    for(var i=0; i<arr.length; i++)
    {
        dust.render(template,arr[i],callback);
    }
};

var db_functions = {
    dbGetAllSubjects: function(){
        $.ajax({
            url: '/api/subjects',
            type: "GET",
            async: true,
            success: function (data) {
                var size = data.objects.length;
                dust.renderArray('subject',data.objects,function(err,out)
                {
                   $('#subjects_list').append(out);
                });

//                for (var i=0; i < size; i++){
//                    var subject = data.objects[i];
//
//                    var subject_link = $(document.createElement('a'))
//                        .attr("id", 'subject_link_' + i);
//                    subject_link.attr('href', "/account/selectedSubjectPage?subject_id="+subject._id + '&subject_name=' + subject.name);
//                    subject_link.text(subject.name);
//                    $('#subjects_list').append(subject_link).append('<br />');
//
//                    if (subject.is_hot){
//                        var hot_subject_link = $(document.createElement('a'))
//                            .attr("id", 'hot_subject_link_' + i);
//                        hot_subject_link.attr('href', "/account/selectedSubjectPage?subject_id="+subject._id + '&subject_name=' + subject.name);
//                        hot_subject_link.text(subject.name);
//                        console.log(hot_subject_link);
//                        $('.hot_subject').append(hot_subject_link).append('<br />');
//                    }
//                }
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    dbGetInfoItemsByTagName: function(tag_name){
        $.ajax({
            url: '/api/information_items?tags=' + tag_name,
            type: "GET",
            async: true,
            success: function (data) {

                console.log(data);

                var length = data.objects.length;

                if (length > 0){
                    var blank_row = $(document.createElement('p'))
                        .attr('id', 'tags_header');
                    blank_row.text('I FOUND THOSE ITEMS:');
                    $('.tags').append(blank_row);
                }else{
                    alert('no information items!');
                }

                for (var i in data.objects)
                    items.add(data.objects[i], "tags");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },
    dbAddInfoItemToShoppingCart: function(info_item_id, callback){
        $.ajax({
            url: 'http://dev.empeeric.com/api/shopping_cart/' + info_item_id,
            type: "PUT",
            async: true,
            success: function () {
//                            addInfoItemToUserShoppingCart(info_item_index, info_item_id);
                callback(true);
                console.log("item information inserted to shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(false);
                alert('error');
            }
        });
    },

    getUserShopingCart: function(callback){
        $.ajax({
            url: '/api/shopping_cart',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }

        });
    },

    dbDeleteInfoItemFromShoppingCart: function(info_item_id){
        $.ajax({
            url: '/api/shopping_cart/' + info_item_id,
            type: "DELETE",
            async: true,
            success: function () {
//                          removeInfoItemFromUserShoppingCart(info_item_index);
                console.log('info item deleted from shopping cart');
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log('error delete info item from shoping cart');
            }
        });
    },

    getInfoItemsOfSubjectByKeywords: function(keywords, subject_id, callback){
        console.log("inside getInfoItemsOfSubjectByKeywords:");
        var keywords_arr = keywords.trim().replace(/\s+/g,".%2B");

        console.log("keywords_arr: " + keywords_arr);



        console.log('/api/information_items/?text_field__regex='+ keywords_arr + '&subject_id=' + subject_id);
        $.ajax({
            url: '/api/information_items/?text_field__regex='+ keywords_arr + '&subject_id=' + subject_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);

                callback(true, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(false, null);
                alert('error');
            }

        });
    },

    getDiscussionById: function(discussion_id, callback){
        $.ajax({
            url: '/api/discussions/'+ discussion_id /*+ "&is_published=true"  i check it in the server - if isnt published only creator can sea it*/,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);

                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('error');
            }

        });
    },

    getDiscussionsByTagName: function(tag_name){
        $.ajax({
            url: '/api/discussions?tags=' + tag_name,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    getDiscussionsBySubject: function(subject_id, callback){
        $.ajax({
            url: '/api/discussions/?subject_id=' + subject_id + "&is_published=true",
            type: "GET",
            async: true,
            success: function (data) {
//                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('error');
            }

        });
    },

    createPreviewDiscussion: function(subject_id, vision, title, callback){
        $.ajax({
            url: '/api/discussions/',
            type: "POST",
            async: true,
                data: {"subject_id": subject_id, "title": title, "vision_text": vision},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('error');
            }
        });
    },

    createDiscussion: function(subject_id, subject_name, vision, title, callback){
        console.log('data: {"subject_id": subject_id, "vision_text": vision, "title": title, "is_published": true},');
        $.ajax({
            url: '/api/discussions/',
            type: "POST",
            async: true,
            data: {"subject_id": subject_id, "subject_name": subject_name, "vision_text": vision, "title": title, "is_published": true},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert(' createDiscussion error');
            }
        });
    },

    diployDiscussion: function(created_discussion_id, callback){
        $.ajax({
            url: '/api/discussions/' + created_discussion_id,
            type: "PUT",
            async: true,
            success: function () {
                callback(null);
                console.log("item information inserted to discussion shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError);
                alert('error');
            }
        });
    },

    getDiscussionShoppingCart: function(discussion_id, callback){

        $.ajax({
            url: '/api/discussions_shopping_cart?discussion_id=' + discussion_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('error');
            }

        });
    } ,

    addInfoItemToDiscussionShoppingCart: function(info_item_id, created_discussion_id, callback){
        $.ajax({
            url: '/api/discussions_shopping_cart/' + info_item_id,
            type: "PUT",
            async: true,
            data: {"discussion_id": created_discussion_id},
            success: function () {
                callback(null);
                console.log("item information inserted to discussion shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError);
                alert('error');
            }
        });
    },

    deleteInfoItemFromDiscussionShoppingCart: function(info_item_id, created_discussion_id){
        $.ajax({
            url: '/api/discussions_shopping_cart/' + info_item_id + '/?discussion_id=' + created_discussion_id,
            type: "DELETE",
            async: true,
            success: function () {
                console.log("item information inserted to discussion shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    getPostByDiscussion: function(discussion_id, callback){
        $.ajax({
            url: '/api/posts?discussion_id=' + discussion_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log("posts are" + " " + data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('get Posts error');
            }
        });
    },

    addPostToDiscussion: function(discussion_id, post_content, callback){

        $.ajax({
            url: '/api/posts/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "text": post_content},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError)
                callback(thrownError, null);
                alert('create Post error');
            }
        });
    },

    getDiscussionPostsByTokens: function(discussion_id, limit_number, callback){
        $.ajax({
            url: '/api/posts?discussion_id=' + discussion_id + '&is_comment_on_action=false&order_by=-tokens&limit=' + limit_number,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError)
                callback(thrownError, null);
                alert('get Posts error');
            }
        });
    },

    addSuggestionToDiscussion: function(discussion_id, parts, callback){

        $.ajax({
            url: '/api/suggestions/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "parts": parts},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError)
                callback(thrownError, null);
                alert('create Post error');
            }
        });
    },
    //this post/change_suggestion has ref to a post/suggestion/vision
    addCommentPostToDiscussion: function(discussion_id, post_content, ref_to_post_id, is_comment_on_vision, callback){

        $.ajax({
            url: '/api/posts/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "text": post_content, "ref_to_post_id": ref_to_post_id, "is_comment_on_vision": is_comment_on_vision},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('create Post error');
            }
        });
    },

    addDiscussionGrade: function(discussion_id, grade, callback){
        $.ajax({
            url: '/api/grades/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "evaluation_grade": grade},
            success: function (data) {
                callback(null, data);

            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);

            }
        });
    },

    getCycleById: function(cycle_id, callback){
        $.ajax({
            url: '/api/cycles/'+ cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);

            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);

            }
        });
    },

    addUserToCycleFollower: function(cycle_id, callback){
        $.ajax({
            url: '/api/cycles/'+ cycle_id,
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);

            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);

            }
        });
    },

    /*getActionById: function(action_id, callback){
        $.ajax({
            url: '/api/actions/action_id',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },*/

    getCyclesByTagName: function(tag_name){
        $.ajax({
            url: '/api/cycles?tags=' + tag_name,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    getApprovedActionByCycle: function(cycle_id, callback){
        $.ajax({
            url: '/api/actions?cycle_id='+ cycle_id + '&is_approved=true',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getNotApprovedActionByCycle: function(cycle_id, callback){
        $.ajax({
            url: '/api/actions?cycle_id='+ cycle_id + '&is_approved=false',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getCategories: function(callback){
        $.ajax({
            url: '/api/categories',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getActionResoueces: function(callback){
        $.ajax({
            url: '/api/action_resources',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },


    addAction: function(cycle_id, title, description, action_resources, required_participants, execution_date, callback){
        $.ajax({
            url: '/api/actions',
            type: "POST",
            data: {"cycle_id": cycle_id, "title" : title, "description": description, "action_resources": action_resources  || [],
                   "required_participants": required_participants, "execution_date": execution_date},
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    addUserToAction: function(action_id, callback){
        $.ajax({
            url: '/api/actions/' + action_id,
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    }
/*

{"title" : "ban tnuva!!!", "description" : "do not buy tnuva products", "category": "4f61f9403ac2bf440f000002",
    "action_resources": [{"resource": {"category":"4f61f9403a2bf440f000002", "name": "lemons"}, "amount" : "78"}], "required_participants": "1", "cycle_id": "4f5f68c4d79ae4a81200000a", "is_approved": false}

    */
}

