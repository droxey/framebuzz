var FrameBuzzProfile = (function($) {
    var _isShare = false,
        _isMyProfile = false,
        _urls = {},
        _currentFilterClass = null,
        _currentRequest = null;

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
            if (_currentRequest != null) { _currentRequest.abort(); }

            var el = $(this),
                filterClass = el.attr('data-filter'),
                innerContainer = $('div.responsive-timeline > div.container'),
                nextPageUrl = _urls.feed + '?page=1';

            if ($('#share').length > 0) {
                _currentFilterClass = '.added_video_to_library';

                $('#share').fadeOut('fast', function() {
                    $('#share').hide();
                });
            }

            $('a.filter').parent().removeClass('active');
            $('a[data-filter="' + filterClass + '"]').parent().toggleClass('active');
            innerContainer.find('div.item').remove();

            if (filterClass != null && filterClass != '*') {
                nextPageUrl = nextPageUrl + '&filter=' + filterClass.replace('.', '');
            }

            _currentRequest = $.get(nextPageUrl, function(newElements) {
                var elements = $('div.item', $(newElements));
                innerContainer.append(elements);

                lazyLoadImages();
                initTooltips();
                initToggleButtons();

                _currentFilterClass = filterClass;

                $(window).trigger('resize');
            });

            return false;
        });
    }

    function lazyLoadImages() {
        $('img.lazy').not('.loaded').lazyload({ 
            event: 'scroll trigger-lazy-load'
        }).addClass('loaded');
    }

    function initTimeline() {
        $('.responsive-timeline').rTimeline({
            theme: 'light', 
            url: _urls.feed,
            data: function(iteration) {
                var page = iteration + 2;

                if (_currentFilterClass != null && _currentFilterClass != '*') {
                    return { 'page': page, 'filter': _currentFilterClass.replace('.', '') };
                }

                return { 'page': page };
            }
        });

        initToggleButtons();
        lazyLoadImages();
        initTooltips();

        $(window).trigger('resize');
    }

    return {
      init: function(isMyProfile, isShare, urls) {
        _isShare = isShare;
        _isMyProfile = isMyProfile;
        _urls = urls;

        bindFilter();
        lazyLoadImages();
        initFollowButton();

        $(document).on('click', 'a.play-video', function() {
            var url = $(this).attr('href');

            $("html, body").animate({ scrollTop: 0 }, "normal", function() {
                $('#share div.ajax').fadeIn('fast', function() {
                    $('#video-container').html('');
                    $('#share').show();
                });

                $.get(url, function(data) {
                    $('#share div.ajax').fadeOut('fast', function() {
                       $('#video-container').html(data);
                       $('li.start').addClass('active');
                   });
                });
            });

            return false;
        });

        // Init isotope and infinite scroll.
        var feedContainer = $('#feed');
        var recommendationsContainer = $('#recommendations div.ajax');

        if (_isMyProfile) {
            bindAddVideoButton();
        }

        // Load recommendations.
        $.get(urls.recommendations, function(html) {
            recommendationsContainer.html(html);
            lazyLoadImages();

            $('a.avatar')
                .mouseenter(function() {
                    var title = $(this).parent().siblings('span.title');
                    var name = $('strong', title);
                    var newText = $(this).attr('data-name');

                    name.text(newText);
                })
                .mouseleave(function() {
                    var title = $(this).parent().siblings('span.title');
                    var name = $('strong', title);

                    name.text('Popular Personalities');
                });
        });

        $.get(urls.feed + '?init=true', function(html) {
            feedContainer.html(html);
            setTimeout(function() {
                initTimeline();
            }, 1000);
            
        });
    }};
}(jQuery));