var FrameBuzzProfile = (function($) {
    var _isShare = false,
        _isMyProfile = false,
        _urls = {},
        _currentFilterClass = null,
        _currentRequest = null;

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

    function bindAddVideoButton() {
        var video_id = null;

        $('body').on('blur', '#id_video_id', function() {
            var url = $(this).val();

            if (url.length > 0) {
                video_id = youtube_parser(url);
            }
        });

        $('body').on('submit', '#add-video-form', function(e) {
            video_id = youtube_parser($('#id_video_id').val());

            if (video_id !== null) {
                var postUrl = $(this).attr('action');
                var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

                $.post(postUrl, {
                    'video_id': video_id, 
                    'is_featured': 'false',
                    'csrfmiddlewaretoken': csrfToken
                }, function(data, textStatus, jqXHR) {
                    var redirectUrl = window.location.href + 'share/' + video_id + '/';
                    window.location.href = redirectUrl;
                });
            }

            return false;
        });
    }

    function initTooltips() {
        $('.tooltip').tooltip();
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

        $('body').on('click', 'a.feed-item-type.toggle', function(e) {
            e.preventDefault();

            var link = $(this);
            var url = link.attr('href');

            $.get(url, function(data) {
                link.find('.fa-stack').toggleClass('active');

                var addOrRemoveIcon = link.find('.fa-stack-1x');
                if (addOrRemoveIcon.hasClass('fa-minus')) {
                    addOrRemoveIcon.removeClass('fa-minus').addClass('fa-plus');
                }
                else {
                    addOrRemoveIcon.removeClass('fa-plus').addClass('fa-minus');
                }
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

                initTooltips();

                _currentFilterClass = filterClass;
                $(window).trigger('resize');
            });

            return false;
        });
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
        initTooltips();
    }

    function initHelpDialog() {
        var menu = $('ul.dropdown-menu');
        var dialog = $('#modal-help');
        dialog.modal();

        dialog.on('shown.bs.modal', function(e) {
            if (!menu.is(':visible')) { 
                menu.addClass('open');
            }
            menu.find('li.help').addClass('active');
        });

        dialog.on('hidden.bs.modal', function(e) {
            menu.removeClass('open');
            menu.find('li.help').removeClass('active');
        });
    }

    return {
      init: function(isMyProfile, isShare, urls, showHelp) {
        _isShare = isShare;
        _isMyProfile = isMyProfile;
        _urls = urls;
        _showHelp = showHelp;

        if (_isMyProfile) {
            bindAddVideoButton();
            
            if (_showHelp) {
                initHelpDialog();
            }

            $('#menu-show-help').click(function() {
                initHelpDialog();
                return false;
            });
        }
        
        bindFilter();
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

        var feedContainer = $('#feed');
        var recommendationsContainer = $('#recommendations div.ajax');

        // Load recommendations.
        $.get(urls.recommendations, function(html) {
            recommendationsContainer.html(html);

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
            initTimeline();
        });
    }};
}(jQuery));