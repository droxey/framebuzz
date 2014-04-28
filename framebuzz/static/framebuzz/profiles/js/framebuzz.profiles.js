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
                    if (window.location.href.indexOf('dashboard') !== -1) {
                        window.location.reload();
                    }   
                    else {
                        var redirectUrl = window.location.href + 'share/' + video_id + '/';
                        window.location.href = redirectUrl;
                    }
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

            var url = $(this).attr('href'),
                links = $('a[href="' + url + '"]'),
                stats = $('#user-stats'),
                parentItem = $(this).parent().parent().parent().parent(),
                isFavorite = parentItem.hasClass('added_to_favorites'),
                isVideo = parentItem.hasClass('added_video_to_library'),
                isMine = parentItem.hasClass('mine'),
                addOrRemoveIcon = $(this).find('.fa-stack-1x'),
                removing = addOrRemoveIcon.hasClass('fa-minus'),
                statsItem = null,
                isVideoScreen = $(this).hasClass('share-add'),
                toggleText = $(this).find('.toggle-text');

            $.get(url, function(data) {
                links.each(function(k, v) {
                    $(v).find('.fa-stack').toggleClass('active');
                });
                
                if (removing) {
                    links.each(function(k, v) {
                        $(v).find('.fa-stack-1x').removeClass('fa-minus').addClass('fa-plus');
                    });

                    if (isVideoScreen) {
                        toggleText.parent().removeClass('remove').addClass('add');
                        toggleText.text('Post Video');
                    } 
                    else {
                        if (isMine && (isFavorite || isVideo)) {
                            parentItem
                                .removeClass('added')
                                .addClass('removed')
                                .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
                                  $(this).remove();
                                  $(window).trigger('resize');
                               });
                        }
                    }   
                }
                else {
                    links.each(function(k, v) {
                        $(v).find('.fa-stack-1x').removeClass('fa-plus').addClass('fa-minus');
                    });

                    if (isVideoScreen) {
                        toggleText.parent().removeClass('add').addClass('remove');
                        toggleText.text('Remove Post');
                    }
                    else {
                        if (_isMyProfile) {
                            var newItem = parentItem.clone(true),
                                username = $('#user-display-name').find('a').text(),
                                headerLink = $('.header-content > p > strong > a', newItem),
                                headerAvatar = $('div.row.header > div.avatar > img', newItem),
                                avatarLinkSrc = $('a.nav-link.avatar > img').attr('src');

                            newItem.addClass('mine');
                            newItem.find('.action-timestamp').text(' 0 minutes ago');
                            headerAvatar.attr('src', avatarLinkSrc);
                            headerLink.text(username);
                            headerLink.attr('href', window.location.href);

                            if (newItem.hasClass('conversations')) {
                                isFavorite = true;

                                newItem.removeClass('conversations').addClass('added_to_favorites');
                                newItem.find('.action-name').text(' faved');
                            }

                            newItem.insertBefore(parentItem.parent().children().eq(0));
                            newItem.addClass('added');

                            $(window).trigger('resize');
                        }
                    }
                }

                if (_isMyProfile) {
                    if (isFavorite) {
                        statsItem = stats.find('li.favorites');
                    }
                    else {
                        statsItem = stats.find('li.videos');
                    }

                    var statsText = parseInt($('a.filter > strong', statsItem).text());
                    var updateStats = removing ? (statsText - 1) : (statsText + 1);
                    $('a.filter > strong', statsItem).text(updateStats);
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
                menu.css({ 'display': 'block !important; '});
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
                       $('#video-container div.details div.description div.scroller').perfectScrollbar({suppressScrollX: true});
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