var FrameBuzzProfile = (function($) {
    var _isShare = false,
        _isMyProfile = false,
        _page = 1,
        _urls = {},
        _masonry = null,
        _currentFilterClass = null;

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

            var link = $(this);
            var url = link.attr('href');

            $.get(url, function(data) {
                link.toggleClass('active');
                console.log(link.prev('li'));
            });

            return false;
        });
    }

    function initFollowButton() {
        $('body').on('click', 'a.follow-button, a.unfollow-button', function () {
            $.post($(this).attr("href"), {});
            $(this).parent().find("a.follow-button, a.unfollow-button").toggle();
            return false;
        });
    }

    function filter(el, filterClass) {
        $('ul.nav-pills li.active').toggleClass('active');
        $('a[data-filter="' + filterClass +'"]').parent().toggleClass('active');
        getPage(1, true);
    }

    function bindFilter() {
        $('body').on('click', 'a.filter', function() {
            var el = $(this);
            _currentFilterClass = el.attr('data-filter');

            if (_isShare) {
                $('#share').fadeOut('fast', function() {
                    $('#share').remove();
                    filter(el, _currentFilterClass);
                });
            }
            else {
                filter(el, _currentFilterClass);
            }

            return false;
        });
    }

    function initUploaders() {
        $('body').on('hide', '#upload-modal', function () {
            $(this).removeData('modal');
        });

        // Load uploaders in modal.
        $('body').on('shown', '#upload-modal', function(e) {
            var url = window.location.hostname === 'blueimp.github.io' ?
            '//jquery-file-upload.appspot.com/' : 'server/php/';

            var uploadButton = $('<button/>')
                .addClass('btn btn-primary')
                .prop('disabled', true)
                .text('Processing...')
                .on('click', function () {
                    var $this = $(this),
                        data = $this.data();
                    $this
                        .off('click')
                        .text('Cancel')
                        .on('click', function () {
                            $this.remove();
                            data.abort();
                        });
                    data.submit().always(function () {
                        $this.remove();
                    });
                });

            $('#id_avatar').fileupload({
                url: url,
                dataType: 'json',
                autoUpload: false,
                acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,
                maxFileSize: 5000000, // 5 MB
                // Enable image resizing, except for Android and Opera,
                // which actually support image resizing, but fail to
                // send Blob objects via XHR requests:
                disableImageResize: /Android(?!.*Chrome)|Opera/
                    .test(window.navigator.userAgent),
                previewMaxWidth: 300,
                previewMaxHeight: 300,
                previewCrop: true
            }).on('fileuploadadd', function (e, data) {
                data.context = $('<div/>').appendTo('#files');
                $.each(data.files, function (index, file) {
                    var node = $('<p/>')
                            .append($('<span/>').text(file.name));
                    if (!index) {
                        node
                            .append('<br>')
                            .append(uploadButton.clone(true).data(data));
                    }
                    node.appendTo(data.context);
                });
            }).on('fileuploadprocessalways', function (e, data) {
                var index = data.index,
                    file = data.files[index],
                    node = $(data.context.children()[index]);
                if (file.preview) {
                    node
                        .prepend('<br>')
                        .prepend(file.preview);
                }
                if (file.error) {
                    node
                        .append('<br>')
                        .append($('<span class="text-danger"/>').text(file.error));
                }
                if (index + 1 === data.files.length) {
                    data.context.find('button')
                        .text('Upload')
                        .prop('disabled', !!data.files.error);
                }
            }).on('fileuploadprogressall', function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $('#progress .progress-bar').css(
                    'width',
                    progress + '%'
                );
            }).on('fileuploaddone', function (e, data) {
                $.each(data.result.files, function (index, file) {
                    if (file.url) {
                        var link = $('<a>')
                            .attr('target', '_blank')
                            .prop('href', file.url);
                        $(data.context.children()[index])
                            .wrap(link);
                    } else if (file.error) {
                        var error = $('<span class="text-danger"/>').text(file.error);
                        $(data.context.children()[index])
                            .append('<br>')
                            .append(error);
                    }
                });
            }).on('fileuploadfail', function (e, data) {
                $.each(data.files, function (index, file) {
                    var error = $('<span class="text-danger"/>').text('File upload failed.');
                    $(data.context.children()[index])
                        .append('<br>')
                        .append(error);
                });
            }).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
            });
    }

    function bindCardFunctions() {
        initTooltips();
        initToggleButtons();
    }

    function getPage(page, filter) {
        var $container = $('#feed-list'),
            nextPageUrl = _urls.feed;

        if (_currentFilterClass != null) {
            nextPageUrl = nextPageUrl + '?page=1&filter=' + _currentFilterClass.replace('.', '');
        }
        else {
            nextPageUrl = nextPageUrl + '?page=' + page;
        }

        console.log(nextPageUrl);

        $.get(nextPageUrl, function(newElements) {
            if (filter) {
                $container.isotope({ filter: _currentFilterClass });

                if (_currentFilterClass == '*') { 
                    _currentFilterClass = null;
                }
            }

            $container.isotope('insert', $(newElements), function() {
                bindCardFunctions();
            });
        });
    }

    return {
      init: function(isMyProfile, isShare, urls) {
        _isShare = isShare;
        _isMyProfile = isMyProfile;
        _urls = urls;

        bindFilter();

        if (_isMyProfile) {
            bindAddVideoModal();
            initEditables();
            //initUploaders();

            // Load recommendations.
            $.get(urls.recommendations, function(html) {
                recommendationsContainer.html(html);
                initTooltips();
            });
        }
        else {
            initFollowButton();
        }

        // Init isotope and infinite scroll.
        var feedContainer = $('#feed');
        var recommendationsContainer = $('div.recommendations > div.ajax');

        $.get(urls.feed + '?init=true', function(html) {
            feedContainer.html(html);

            var $container = $('#feed-list'),
                pages = parseInt($container.attr('data-total-pages'));

            $.when($container.isotope({
                itemSelector : 'li.brick',
                animationEngine: 'best-available',
                masonry: {
                    columnWidth: 336
                }
            }))
            .then(function() {
                bindCardFunctions();

                    $(window).paged_scroll({
                        handleScroll: function (page, container, doneCallback) {
                            _page = page + 1;
                            var filter = _currentFilterClass != null;

                            if (page <= pages) {
                                getPage(page, filter);
                            }
                        },
                        triggerFromBottom: '10%',
                        targetElement: feedContainer,
                        loader:'',
                        pagesToScroll: pages
                    });
                });
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