var FrameBuzzProfile = (function($) {
    var _isShare = false,
        _isMyProfile = false,
        _page = 1,
        _pages = 1,
        _urls = {},
        _currentFilterClass = null,
        _currentRequest = null,
        _endOfPageMessages = {
            'latest': '', 
            'added_video_to_library': '',
            'conversations': '',
            'favorites': '',
            'following': '',
            'followers': ''
        };

    function bindAddVideoButton() {
        var video_id = null;

        $('body').on('blur', '#id_video_id', function() {
            var url = $(this).val();

            if (url.length > 0) {
                video_id = youtube_parser(url);
            }
        });

        $('body').on('submit', '#add-video-form', function(e) {
            e.preventDefault();

            var postUrl = $(this).attr('action');
            var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

            $.post(postUrl, {
                'video_id': video_id, 
                'is_featured': $('#id_is_featured').is(':checked'),
                'csrfmiddlewaretoken': csrfToken
            }, function(data, textStatus, jqXHR) {
                if (data.length == 0) {
                    var redirectUrl = window.location.href + 'share/' + video_id + '/';
                    window.location.href = redirectUrl;
                }
                else {
                    console.log(data);
                }
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
            $('#id_video_id').val('');
            $('#id_video_id').attr('placeholder', "This doesn't seem to be a YouTube URL! Please try again.");
        }
    }

    function initToggleButtons() {
        $('body').on('click', 'a.video-toggle-button', function(e) {
            e.preventDefault();

            var link = $(this);
            var url = link.attr('href');

            $.get(url, function(data) {
                link.toggleClass('active');
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

    function bindFilter() {
        $('body').on('click', 'a.filter', function() {
            var el = $(this);
            filterClass = el.attr('data-filter');
            _pages = parseInt(el.attr('data-pages'));

            if (_isShare) {
                _currentFilterClass = '.added_video_to_library';

                $('#share').fadeOut('fast', function() {
                    $('#share').remove();
                });
            }

            if (_isMyProfile && filterClass != '*') {
                $('#feed-list').isotope({ filter: filterClass + '.mine' });
            }
            else {
                $('#feed-list').isotope({ filter: filterClass });
            }

            $('ul.nav-pills li.active').removeClass('active');
            $('a[data-filter="' + filterClass +'"]').parent().toggleClass('active');

            if (filterClass == '*' && _currentFilterClass != '*') {
                _pages = parseInt($('#feed-list').attr('data-total-pages'));
                _page = 1;
            }
            else {
                _currentFilterClass = filterClass;
                getPage(1, true);
            }

            return false;
        });
    }

    function initCustomize() {
        $('body').on('click', 'a.customize', function() {
            var avatarUrl = $(this).attr('href');

            $.get(avatarUrl, function(html) {
                $('#customize-modal div.md-content div.tab-content #add').html(html);
                $('#customize-modal div.md-content nav ul.nav-tabs').tabs();

                var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
                var uploadButton = $('<button/>')
                    .addClass('btn btn-info')
                    .prop('disabled', true)
                    .text('Processing...')
                    .on('click', function () {
                        var $this = $(this),
                            data = $this.data();
                        $this
                            .off('click')
                            .removeClass('btn-info')
                            .addClass('btn-danger')
                            .text('Abort')
                            .on('click', function () {
                                $this.remove();
                                data.abort();
                            });
                        data.submit().always(function () {
                            $this.remove();
                        });
                    });

                $('#id_avatar').fileupload({
                    url: avatarUrl,
                    dataType: 'json',
                    autoUpload: false,
                    acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,
                    maxFileSize: 5000000, // 5 MB
                    // Enable image resizing, except for Android and Opera,
                    // which actually support image resizing, but fail to
                    // send Blob objects via XHR requests:
                    disableImageResize: /Android(?!.*Chrome)|Opera/
                        .test(window.navigator.userAgent),
                    previewMaxWidth: 100,
                    previewMaxHeight: 100,
                    previewCrop: true,
                    formData: { 'csrfmiddlewaretoken': csrfToken }
                }).on('fileuploadadd', function (e, data) {
                    data.context = $('<div/>').appendTo('#files');
                    $.each(data.files, function (index, file) {
                        var node = $('<p class="clearfix" />').append($('<span/>').text(file.name));
                        if (!index) {
                            node.append(uploadButton.clone(true).data(data));
                        }
                        node.appendTo(data.context);
                    });
                }).on('fileuploadprocessalways', function (e, data) {
                    var index = data.index,
                        file = data.files[index],
                        node = $(data.context.children()[index]);

                    if (file.preview) {
                        node.prepend(file.preview);
                    }
                    if (file.error) {
                        node.append('<br>').append($('<span class="text-danger"/>').text(file.error));
                    }
                    if (index + 1 === data.files.length) {
                        data.context.find('button').text('Upload').prop('disabled', !!data.files.error);
                    }
                }).on('fileuploadprogressall', function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $('#progress .progress-bar').css('width', progress + '%');
                }).on('fileuploaddone', function (e, data) {
                    $.each(data.result.files, function (index, file) {
                        if (file.url) {
                            var success = $('<span class="text-success"/>').text('Upload successful!');
                            $(data.context.children()[index]).append('<br>').append(success);

                            window.setTimeout(function() {
                                $.when($('button.md-close').trigger('click'))
                                 .then(function() {
                                    window.location.reload();
                                });
                            }, 2000);
                        } else if (file.error) {
                            var error = $('<span class="text-danger"/>').text(file.error);
                            $(data.context.children()[index]).append('<br>').append(error);
                        }
                    });
                }).on('fileuploadfail', function (e, data) {
                    $.each(data.files, function (index, file) {
                        var error = $('<span class="text-danger"/>').text('File upload failed.');
                        $(data.context.children()[index]).append('<br>').append(error);
                    });
                }).prop('disabled', !$.support.fileInput)
                    .parent().addClass($.support.fileInput ? undefined : 'disabled');

            });

            return false;
        });
    }

    function bindCardFunctions() {
        initTooltips();
        initToggleButtons();
    }

    function insertCards(container, elements) {
        container.isotope('insert', elements, function() {
            bindCardFunctions();

            $('img.lazy', elements).lazyload({ 
                effect: "fadeIn",
                event: 'scroll trigger-lazy-load'
            });
        });
    }

    function getPage(page, filtering) {
        if (_currentRequest != null) {
            _currentRequest.abort();
        }

        var $container = $('#feed-list'),
            nextPageUrl = _urls.feed + '?page=' + page;

        if (_currentFilterClass != null && _currentFilterClass != '*') {
            nextPageUrl = nextPageUrl + '&filter=' + _currentFilterClass.replace('.', '');
        }

        _currentRequest = $.get(nextPageUrl, function(newElements) {
            var $elements = $(newElements);

            if (filtering && page == 1) {
                var oldItemsCount = $('li' + _currentFilterClass, $container).size();
                if (oldItemsCount == 0) {
                    insertCards($container, $elements);
                }
                else {
                    var newItemsCount = $elements.size();
                    var newElementsSlice = $elements.slice(oldItemsCount, (newItemsCount - oldItemsCount));

                    insertCards($container, newElementsSlice);
                }

                if (_currentFilterClass == '*') {
                    _currentFilterClass = null;
                }
            }
            else {
                insertCards($container, $elements);
            }

            _currentRequest = null;
        });
    }

    function lazyLoadImages() {
        $("img.lazy").lazyload({ 
            effect: "fadeIn",
            event: 'scroll trigger-lazy-load'
        });
    }

    return {
      init: function(isMyProfile, isShare, urls) {
        _isShare = isShare;
        _isMyProfile = isMyProfile;
        _urls = urls;

        bindFilter();
        lazyLoadImages();

        // Init isotope and infinite scroll.
        var feedContainer = $('#feed');
        var recommendationsContainer = $('div.recommendations > div.ajax');

        if (_isMyProfile) {
            bindAddVideoButton();
            initEditables();
            initCustomize();

            // Load recommendations.
            $.get(urls.recommendations, function(html) {
                recommendationsContainer.html(html);
                initTooltips();
                $('img.lazy', recommendationsContainer).lazyload({ 
                    effect: "fadeIn",
                    event: 'scroll trigger-lazy-load'
                });
            });
        }
        else {
            initFollowButton();
        }

        $.get(urls.feed + '?init=true', function(html) {
            if ($(html).find('li.empty').length == 0) {
                $('ul.nav-pills').show(function() {
                    $(this).animate({ opacity: 1.0 }, 500);
                });
            }

            feedContainer.html(html);

            $('img.lazy', feedContainer).lazyload({ 
                effect: "fadeIn",
                event: 'scroll trigger-lazy-load'
            });

            var $container = $('#feed-list'),
                _pages = parseInt($container.attr('data-total-pages'));

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
                        startPage: 1,
                        triggerFromBottom: '10%',
                        targetElement: $container,
                        loader:'<div class="spin"><i class="icon-spinner icon-spin icon-large"></i></div>',
                        pagesToScroll: _pages,
                        beforePageChanged:function (page, container) {

                        },
                        handleScroll: function(page, container, doneCallback) {
                            _page = page;

                            var filtering = _currentFilterClass != null && _currentFilterClass != '*';
                            if (filtering) {
                                _pages = $('a[data-filter="' + _currentFilterClass +'"]').eq(0).attr('data-pages');
                            }

                            if (_page <= _pages) {
                                getPage(page, filtering);
                            }
                        },
                        afterPageChanged: function(page, container) {
                            if (page == _pages) {
                                var emptyBrick = $('<li class="brick empty" />');
                                var messageContainer = $('<div class="action-wrapper" />');
                            }
                        }
                    });
                });
            });
        }
    };
}(jQuery));