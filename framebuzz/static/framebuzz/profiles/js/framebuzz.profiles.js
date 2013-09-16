var FrameBuzzProfile = (function($) {
    var currentPageUrl,
        currentVideoUrl,
        currentTab = '#activity';

    function triggerMasonry() {
        new AnimOnScroll( document.getElementById( 'feed' ), {
            minDuration : 0.4,
            maxDuration : 0.7,
            viewportFactor : 0.2
        } );
    }

    function bindTabs() {
        $('body').on('click', 'a.tab-link', function(e) {
            e.preventDefault();
            if (currentTab == this.hash) { return; }
          
            currentPageUrl = $(this).attr('data-url');
            currentTab = this.hash;
            var pane = $(this);

            if (currentTab == '#avatar') {
                $('div.tab-pane').removeClass('active');
                $('ul.dropdown-menu li').removeClass('active'); 
            }
            
            $('ul.nav-tabs li').removeClass('active'); 
            $(currentTab).load(currentPageUrl, function(result) { 
                $('div.tab-pane').removeClass('active');
                $('ul.dropdown-menu li').removeClass('active'); 
                pane.tab('show');

                $('a[href="' + currentTab + '"]').parent().addClass('active');

                if (currentTab == '#avatar') {
                    $('#id_avatar').fileupload({
                        done: function (e, data) {
                            window.location.reload();
                        }
                    });
                }

                triggerMasonry();
            });
        });
    }

    function bindAddVideoModal() {
        $('body').on('hide', '#add-framebuzz-modal', function () {
            $(this).removeData('modal');
        });

        // Load 'add video' in modal.
        $('body').on('shown', '#add-framebuzz-modal', function(e) {
            var video_id = null;

            $('#add-framebuzz-modal').on('blur', '#id_video_id', function() {
                var url = $(this).val();

                if (url.length > 0) {
                    video_id = youtube_parser(url);
                }
            });

            $('#add-framebuzz-modal').on('submit', 'form', function(e) {
                e.preventDefault();

                var postUrl = $(this).attr('action');
                var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

                $.post(postUrl, {
                    'video_id': video_id, 
                    'is_featured': $('#id_is_featured').val(),
                    'csrfmiddlewaretoken': csrfToken
                }, function(data, textStatus, jqXHR) {
                    if (data.length == 0) {
                        $('#videos').load("{% url 'profiles-videos' profile_user %}", function(result) {
                            $('ul.nav-tabs').tab('show');
                            $('div.tab-pane').removeClass('active');
                            $('#videos').addClass('active');

                            $('#add-framebuzz-modal').modal('hide');
                        });
                    }
                    else {
                        var container = $('#add-framebuzz-modal div.modal-body');
                        container.fadeOut('fast', function() {
                            $('#add-framebuzz-modal div.modal-body').html(data);
                            container.fadeIn('fast');
                        });
                    }
                });
            });
        });
    }

    function initTooltips() {
        $('.tooltip').tooltip();
    }

    function initEditables() {
        $('.editable').editable();
    }

    function youtube_parser(url){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match&&match[7].length==11){
            return match[7];
        } else{
            alert("This doesn't seem to be a YouTube URL! Please try again.");
        }
    }

    function initToggleButtons() {
        $('body').on('click', 'a.video-toggle-button', function(e) {
            e.preventDefault();

            var url = $(this).attr('href');
            $.get(url, function(data) {
                $('ul.nav-tabs a[href="' + currentTab + '"]').trigger('click');
            });

            return false;
        });

        $('body').on('click', '#follow_button, #unfollow_button', function () {
            $.post($(this).attr("href"), {});
            $(this).parent().find("#follow_button, #unfollow_button").toggle();
            return false;
        });
    }

    return {
      init: function() {
        bindAddVideoModal();
        initTooltips();
        initEditables();
        initToggleButtons();

        var activeTabUrl = $('ul.nav-tabs li.active a').attr('data-url');
        $('#activity').load(activeTabUrl, function(result) {
            $('ul.nav-tabs').tab('show');
            $('#profile-container ul.nav-tabs li.start').addClass('active');

            bindTabs();
            triggerMasonry();
        });
      }
    };
}(jQuery));


//     $('#avatar').on('submit', 'form', function(e) {
//         e.preventDefault();

//         var postUrl = $(this).attr('action');
//         var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

//         if ($(this).attr('id') == '#upload-avatar-form') {

//         }
//         else {
//             var formData = $(this).serialize();

//             $.ajax({
//                 url: postUrl,
//                 type: 'POST',
//                 data: formData,
//                 success: function(data) {
//                     if (data.length == 0) {
//                         window.location.reload();
//                     }
//                     else {
//                         var container = $('#avatar');
//                         container.fadeOut('fast', function() {
//                             container.html(data);
//                             container.fadeIn('fast');
//                         });
//                     }
//                 }
//             });
//         }

//         return false;
//     });