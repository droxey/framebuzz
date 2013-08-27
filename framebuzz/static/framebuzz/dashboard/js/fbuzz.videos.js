function FramebuzzVideos() {
    this.yt_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
}                   

FramebuzzVideos.prototype.youtube_parser = function(url_post, csrf_token) {
    url = $("#txbUrl").val();
    video_id = url.match(this.yt_regex);
    if (video_id && video_id[7].length==11) {
        code = "<iframe src='http://framebuzz.com/v/" + video_id[7] + "' class='restricted' scrolling='no' frameBorder='0' height = '360' width = '675'></iframe>" ;
        $("#txaCode").val(code);
        
        data = {
            csrfmiddlewaretoken: csrf_token,
            video_id:video_id[7]
        }
        
        $.ajax({
            type: "POST",
            url: url_post,
            data: data
        }).success(function(){
            $("#div-success-fbuzz-video").show();
            /*setTimeout(function(){
                $("#div-success-fbuzz-video").hide();
            }, 5000);*/
        });
    }
    else {
        alert("This doesn't seem to be a valid YouTube URL! Please try again.");
    }
}

FramebuzzVideos.prototype.get_embeded_code = function(video_id) {
    return"<iframe src='http://framebuzz.com/v/" + video_id + "' class='restricted' scrolling='no' frameBorder='0' height = '360' width = '675'></iframe>" ;
}

FramebuzzVideos.prototype.save_selected_videos = function(url, csrf_token) {
    var selected_videos =[];    
    $("input[type=checkbox]:checked").not("#chk-all").each(function(){
        selected_videos.push($(this).attr("data-videoid"));
    });    
    $.ajax({
        type: "POST",
        url: url,
            data: {
                    csrfmiddlewaretoken: csrf_token,
                    youtube_ids: selected_videos
            }
    }).success(function(){
        $("#div-success-yt-video").show();
        $("#txbUrl").val('');
        //setTimeout(function(){
        //    $("#div-success-yt-video").hide();
        //}, 5000);
    });   
}

FramebuzzVideos.prototype.change_view_type = function(url, csrf_token, view_type) {
     $.ajax({
        type: "POST",
        url: url,
            data: {
                    csrfmiddlewaretoken: csrf_token,
                    view_type: view_type
            }
    }).success(function(html){
        $("#library-wrapper").empty();
        $("#library-wrapper").html(html);
        switch (view_type) {
            case 'list':
                        $("#video-container").css("min-height", "95%");
                        $("tr").not("#header-row").click(function(){
                            var videos = new FramebuzzVideos();
                            videos.bind_video_info($(this), 1);
                        });
                break;
            
            case 'gallery':
                        var autoheight = ($("#content").height() + ($("#gallery-wrapper").height())/2) ;
                        //$("#content").css("height", autoheight);
                        $("#content").css("height", "95%");
                        $(".img-box").click(function(){
                            var videos = new FramebuzzVideos();
                            videos.bind_video_info($(this), 2);
                        });
                        
                break;
            
            default: $("#video-container").css("min-height", "95%");
                break;
        }
    }); 
}

FramebuzzVideos.prototype.bind_video_info = function(ele, type) {
    var imgsource = '';
    var title = '';
    var id = '';
    var comment_count = '';
    var youtube_url = '';
        
    switch (type) {
        case 1: // Display as List
            var tds = ele.children();
            comment_count = tds[4].innerHTML;
            imgsource = $(tds[5]).html();
            title = tds[0].innerHTML;
            id = $(tds[6]).children(':first').attr('data-videoid');
            youtube_url = tds[7].innerHTML;
        break;
        
        case 2: // Display as Thumbnail
            var id = $(ele).attr("data-videoid");
            comment_count = $(ele).attr("comment_count");
            var children = ele.children();
            imgsource = $(children[0]).html();
            title = $(children[1]).text();
            break;
    }
        
    $("#vcard-description").text(title);
    $("#vcard-thumbnail").html(imgsource);
    $("#vcard-comment-count").text(comment_count);
    $("#vcard-id").val(id);
    $("#vcard-yturl").val(youtube_url);
    $("#vcard-fbuzz-code").val(this.get_embeded_code(id));
    $('.slider-button').addClass('on').html($(this).data("on-text"));
}

FramebuzzVideos.prototype.delete_video = function(url, csrf_token, video_id) {
    $.ajax({
        type: "POST",
        url: url,
        data:{
              csrfmiddlewaretoken: csrf_token,
              video_id: video_id,
              view_type: $("#video-view-type").val()
        }
    }).success(function(html){
        
        $("#vcard-description").text('');
        $("#vcard-thumbnail").html('<img src="/static/framebuzz/dashboard/img/no-img-gallery.png" width="93" height="92"/>');
        $("#vcard-comment-count").text('O');
        $("#vcard-id").val('');
        $("#vcard-yturl").val('');
        $("#vcard-fbuzz-code").val('');
        
        $("#library-wrapper").empty();
        $("#library-wrapper").html(html);
        $("#video-view-type option:selected").removeAttr("selected");
        $("#video-container").css("height", "95%");
        
        $("#left").css("top", '100px');
        $("#right").css("top", "80px");
        $("#div-messages").show();
        
        
        setTimeout(function(){
            $("#div-messages").hide();
            $("#left").css('top', '70px');
            $("#right").css('top', '50px');
        }, 5000);
        
        $(".ui-select").css({
            top: '10px',
            'z-index': '1'
        });
        $(".cell-like:first-child").css("padding-right", '10px');
        $("#right").css({
            'left': '220px'
        });
        $("#select-wrapper").css({
            "padding-bottom": "10px"    
        });
    });
}

FramebuzzVideos.prototype.show_detail = function(url, csrf_token, video_id) {
    var params = {
        csrfmiddlewaretoken: csrf_token,
        video_id: video_id
    };
    
    $.ajax({
        type: "POST",
        url: url,
        data: params
    }).success(function(html){
        $("#library-wrapper").empty();
        $("#library-wrapper").html(html);
        $("#video-view-type option:selected").removeAttr("selected");
        $("#video-container").css("height", "95%");
        $(".ui-select").css({
            top: '10px',
            'z-index': '1'
        });
        $(".cell-like:first-child").css("padding-right", '10px');
    });
}

FramebuzzVideos.prototype.show_comment_stream = function(url, csrf_token, video_id) {
     var params = {
        csrfmiddlewaretoken: csrf_token,
        video_id: video_id
    };
    
    $.ajax({
        type: "POST",
        url: url,
        data: params
    }).success(function(html){
        $("#library-wrapper").empty();
        $("#library-wrapper").html(html);
        $("#video-view-type option:selected").removeAttr("selected");
        $("#video-container").css("height", "95%");
        $(".ui-select").css({
            top: '10px',
            'z-index': '1'
        });
        $(".cell-like:first-child").css("padding-right", '10px');
        $("#right").css({
            'left': '220px'
        });
        $("#select-wrapper").css({
            "padding-bottom": "10px"    
        });
    });
}
