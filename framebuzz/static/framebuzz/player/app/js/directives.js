'use strict';

/* Directives */


angular.module('framebuzz.directives', [])
    .directive('appVersion', 'version', function(version) {
        return function(scope, elm, attrs) {
          elm.text(version);
        };
    })
    .directive('mediaElement', function(broadcaster) {
        return function(scope, element, attrs) {
            $(element).mediaelementplayer({
                features: ['share', 'addtolibrary', 'volume', 'muteconvo', 'progress'],
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
                    $('.mejs-volume-button').addClass('mejs-fade-in');
                    $('.mejs-time-total span').not('.mejs-time-current').remove();

                    $('.mejs-video').mouseenter(function() {
                        $(this).addClass('show-controls');
                        $(this).parent().addClass('show-title');
                    });

                    $('.mejs-video').mouseleave(function() {
                        $(this).addClass('fade-out-controls')
                            .delay(250)
                            .queue(function(next) {
                                $('.mejs-video').removeClass('fade-out-controls');
                                $('.mejs-video').removeClass('show-controls');
                                $('#player-layer').removeClass('show-title');
                                next();
                            });
                    });

                    $('#player-controls').on('click', function(e) {
                        console.log('bound');
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
    })
    .directive('scrollbar', ['$rootScope', 'broadcaster', function($rootScope, broadcaster) {
        return function(scope, element, attrs) {
            if (attrs.scrollbar == 'true') {
                $(element).perfectScrollbar();
            }

            scope.$on('$viewContentLoaded', function() {
                $(element).perfectScrollbar('destroy');
                $(element).perfectScrollbar();
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
                        infiniteLoop: false,
                        hideControlOnEnd: true,
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
                        scope.setPostTime();

                        $('#duration').hide();
                        $('#post-time').show().addClass('active');
                    });

                    $(element).on('focusout', function() {
                        scope.postTime = 0;
                        safeApply(scope);

                        $('#post-time').hide();
                        $('#duration').show().addClass('active');
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
    });