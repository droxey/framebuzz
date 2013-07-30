'use strict';

/* Directives */


angular.module('framebuzz.directives', [])
    .directive('appVersion', 'version', function(version) {
        return function(scope, elm, attrs) {
          elm.text(version);
        };
    })
    .directive('mediaElement', ['broadcaster', '$rootScope', 'safeApply', function(broadcaster, $rootScope, safeApply) {
        return function(scope, element, attrs) {
            $(element).mediaelementplayer({
                features: ['share', 'addtolibrary', 'volume', 'muteconvo', 'progress', 'playpause' ],
                pluginPath: SOCK.root_path + 'swf/',
                flashName: 'flashmediaelement.swf',
                silverlightName: 'silverlightmediaelement.xap',
                alwaysShowControls: true,
                // There's a bug here where commenting and hitting the spacebar will
                // cause the space to not be entered, and the video to pause.
                enableKeyboard: false,
                timerRate: 500,
                defaultVideoWidth: '640px',
                defaultVideoHeight: '380px',
                autosizeProgress: false,
                success: function(media) {
                    $rootScope.player = media;
                    safeApply($rootScope);

                    $('.mejs-volume-button').addClass('mejs-fade-in');
                    $('.mejs-time-loaded').remove();
                    $('.mejs-time-handle').remove();
                    $('.mejs-time-buffering').remove();

                    $('.mejs-video').mouseenter(function() {
                        $(this).addClass('show-controls');
                        $(this).parent().addClass('show-title');

                        $('#buzz-layer > div.panel > div.scrollable').mouseenter(function() {
                            $('.mejs-video').trigger('mouseleave');
                        });
                    });
                    
                    $('.mejs-video').mouseleave(function() {
                        $(this).addClass('fade-out-controls');
                        window.setTimeout(function() {
                            $('.mejs-video').removeClass('fade-out-controls');
                            $('.mejs-video').removeClass('show-controls');
                            $('#player-layer').removeClass('show-title');
                        }, 250);
                    });

                    scope.$on('library_toggle_complete', function() {
                        $('.mejs-add-library-button').removeClass('added removed');
                        $('.mejs-add-library-button').addClass(broadcaster.message.className);
                    });

                    media.addEventListener('timeupdate', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_timeupdate', currentTime: media.currentTime });
                    }, false);

                    media.addEventListener('playing', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_playing' });
                    }, false);

                    media.addEventListener('pause', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_paused' });
                    }, false);

                    media.addEventListener('player_muteconvo', function(e) {
                        window.location.hash = '#/player/panel';
                    }, false);

                    media.addEventListener('player_unmuteconvo', function(e) {
                        window.location.hash = '#/player/panel/blended';
                    }, false);

                    media.addEventListener('player_share', function(e) {
                        window.location.hash = '#/player/panel/share';
                    }, false);

                    media.addEventListener('player_addtolibrary', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_addtolibrary' });
                    }, false);
                }
            });
        };
    }])
    .directive('scrollbar', ['$rootScope', 'broadcaster', function($rootScope, broadcaster) {
        return function(scope, element, attrs) {
            if (attrs.scrollbar == 'true') {
                $(element).perfectScrollbar({
                    wheelSpeed: 20
                });
            }

            scope.$on('$viewContentLoaded', function() {
                $(element).perfectScrollbar('destroy');
                $(element).perfectScrollbar({
                    wheelSpeed: 20
                });
            });

            scope.$on('player_timeupdate', function() { 
                $(element).perfectScrollbar('update');
            });
        };
    }])
    .directive('maxinput', function() {
        return function(scope, element, attrs) {
            $(element).maxlength({showFeedback: false, max: 180});
        };
    })
    .directive('bxslider', function () {
        return function (scope, element, attrs) {
            if (scope.$last === true) {
                element.ready(function () {
                    var sliderOpts = {
                        infiniteLoop: true,
                        minSlides: 1,
                        maxSlides: 5,
                        moveSlides: 5,
                        startSlide: 0,
                        slideWidth: '26px',
                        pager: false,
                        slideSelector: 'li.slide',
                        responsive: false,
                        tickerHover: true,
                        speed: 500,
                        preloadImages: 'all',
                        autoStart: false,
                        prevText: '&nbsp;',
                        nextText: '&nbsp;', 
                        prevSelector: '.icon-left-dir',
                        nextSelector: '.icon-right-dir', 
                        easing: 'ease-in-out'
                    };
                        
                    var slider = element.parent().bxSlider(sliderOpts);
                    element.parent().css({ 'width': '99999px' });
                    element.parent().parent().css({ 'width': '130px', 'height': '23px' });
                    element.parent().parent().parent().css({ 'width': '136px', 'max-width': '136px' });
                    
                    $('div.bx-loading').remove();
                });
            }
        }; 
    })
    .directive('onfocus', ['safeApply', function(safeApply) {
        return {
            link: function(scope, element, attrs) {
                element.ready(function() {
                    $(element).on('focus', function() {
                        var setPostTime = function() {
                            scope.setPostTime();
                            
                            $('#duration').hide();
                            $('#post-time').show().addClass('active');
                        };

                        setPostTime();

                        var unregisterFocus = scope.$watch('clearFocus', function(val) {
                            if (val) {
                                $(element).trigger('blur');
                                unregisterFocus();
                            }
                        }, true);
                    });

                    $(element).on('blur', function() {
                        scope.postTime = 0;
                        safeApply(scope);

                        $(element).val('');
                        $('#post-time').hide();
                        $('#duration').show().addClass('active');

                        return false;
                    });
                });
            }
        };
    }])
    .directive('share', function() {
        return function(scope, element, attrs) {
            element.share({
                networks: ['facebook','googleplus','twitter'],
                theme: 'icon',
                useIn1: false,
                urlToShare: SOCK.share_url
            });
        };
    })
    .directive('loginpopup', function() {
        return function(scope, element, attrs) {
            $(element).click(function() {
                var nextUrl = location.href.replace(location.hash, "");
                var loginUrl = attrs.loginpopup + '&nextUrl=' + nextUrl;
                var newWindow = window.open(loginUrl,'frameBuzzSSOLoginWindow','toolbar=0,resizable=0,status=0,width=640,height=528');
                if (window.focus) { newWindow.focus(); }
                return false;
            });
        };
    })
    .directive('copytoclipboard', ['notificationFactory', function(notificationFactory) {
        return function(scope, element, attrs) {
            $(element).zclip({ 
                path: '/static/framebuzz/player/app/lib/jquery/ZeroClipboard.swf', 
                copy: attrs.copytoclipboard,
                afterCopy: function() {
                    notificationFactory.success('Copied to Clipboard!');
                }
            });

            $('.zclip').css({ 
                'height': '26px', 
                'left': '352px', 
                'top': '195px', 
                'width': '50px', 
                'z-index': 200 
            });

            $('.zclip').hoverIntent({
                over: function() {
                    $(element).addClass('fade-in');
                },
                out: function() {
                    $(element).removeClass('fade-in');
                }
            });
        };
    }])
    .directive('animationclass', function() {
        return function(scope, element, attrs) {
            element.ready(function() {
                window.setTimeout(function() {
                    element.hide();
                    element.addClass(attrs.animationclass);
                    element.show();
                }, 100);
            });
        }
    });