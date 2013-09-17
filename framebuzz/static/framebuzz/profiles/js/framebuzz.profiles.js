var FrameBuzzProfile = (function($) {
    var isShare = false,
        currentPageUrl,
        currentVideoUrl,
        currentTab = '#activity';

    function triggerMasonry() {
        new AnimOnScroll( document.getElementById( 'feed' ), {
            minDuration : 0.4,
            maxDuration : 0.7,
            viewportFactor : 0.2
        } );

        setTimeout( function() {
            $( window ).trigger( 'scroll' );
        }, 50 );
    }

    function bindTabs() {
        bindScroll();

        $('body').on('click', 'a.tab-link', function(e) {
            e.preventDefault();
            if (currentTab == this.hash) { return; }
            isShare = $('#share').length > 0;

            var shareHidden = false;
            if (isShare && currentTab == '#videos') {
                $('#share').removeClass('fadein');
                shareHidden = true;
            }
          
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

                if (shareHidden) { 
                    $('#share').addClass('hidden');
                    $('#videos').removeClass('share');
                }

                pane.tab('show');
                $('a[href="' + currentTab + '"]').parent().addClass('active');

                if (currentTab == '#avatar') {
                    $('#id_avatar').fileupload({
                        done: function (e, data) {
                            window.location.reload();
                        }
                    });
                }

                bindScroll();
                triggerMasonry();
                initTooltips();
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
                    'is_featured': $('#id_is_featured').is(':checked'),
                    'csrfmiddlewaretoken': csrfToken
                }, function(data, textStatus, jqXHR) {
                    if (data.length == 0) {
                        var videosUrl = $('ul.nav-tabs a[href="#videos"]').attr('data-url');
                        $('#videos').load(videosUrl, function(result) {
                            $('ul.nav-tabs').tab('show');
                            $('div.tab-pane').removeClass('active');
                            $('#videos').addClass('active');

                            $('#share').addClass('fadein');

                            $('#add-framebuzz-modal').modal('hide');

                            bindScroll();
                            triggerMasonry();
                            initTooltips();
                            //initToggleButtons();
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

    function bindScroll() {
        var targetElement = $('#profile-container div.tab-content div.tab-pane.active');
        if ($('ul.endless', targetElement).length > 0) {
            var grid = $('ul.endless', targetElement),
                pages = parseInt(grid.attr('data-total-pages'));

            $(window).paged_scroll({
                handleScroll:function (page,container,doneCallback) {
                    console.log(page);
                    
                    page = page + 1;
                    var nextPageUrl = currentPageUrl + '?page=' + page;

                    if (page <= pages) {
                        $.get(nextPageUrl, function(pageHtml) {
                            grid.append(pageHtml);
                            triggerMasonry();
                        });
                    }
                },
                triggerFromBottom: '10%',
                targetElement: targetElement,
                loader:'<div class="loader">Loading next page&hellip;</div>',
                pagesToScroll: pages
            });
        }
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

            var link = $(this);
            var url = link.attr('href');

            $.get(url, function(data) {
                $(currentTab).load(currentPageUrl, function(result) {
                    $('ul.nav-tabs').tab('show');
                    //$('div.tab-pane').removeClass('active');

                    $('ul.nav-tabs li a[href="' + currentTab + '"]').addClass('active');
                    $(currentTab).addClass('active');

                    bindScroll();
                    triggerMasonry();
                    initTooltips();
                });
            });

            return false;
        });

        $('body').on('click', 'a.follow-button, a.unfollow-button', function () {
            $.post($(this).attr("href"), {});
            $(this).parent().find("a.follow-button, a.unfollow-button").toggle();
            return false;
        });
    }

    return {
      init: function() {
        bindAddVideoModal();
        initTooltips();
        initEditables();
        initToggleButtons();
        bindTabs();

        isShare = $('#share').length > 0;
        if (isShare && currentTab == '#videos') {
            $('#share').removeClass('fadein');
        }

        var activeTab = $('ul.nav-tabs li.active a');
        currentPageUrl = activeTab.attr('data-url');
        currentTab = activeTab.attr('href');

        $(currentTab).load(currentPageUrl, function(result) {
            $('ul.nav-tabs').tab('show');

            if (currentTab == '#activity') {
                $('#profile-container ul.nav-tabs li.start').addClass('active');
            }
            
            if (isShare && currentTab == '#videos') {
                $('#profile-container ul.nav-tabs li.videos').addClass('active');
                $('#share').addClass('fadein');      
            }

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