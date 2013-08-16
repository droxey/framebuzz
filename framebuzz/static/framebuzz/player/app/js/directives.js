'use strict';

/* Directives */


angular.module('framebuzz.directives', [])
    .directive('appVersion', 'version', function(version) {
        return function(scope, elm, attrs) {
          elm.text(version);
        };
    })
    .directive('mediaElement', ['broadcaster', '$state', '$rootScope', 'safeApply', function(broadcaster, $state, $rootScope, safeApply) {
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
                defaultVideoHeight: '385px',
                videoHeight: '385px',
                videoWidth: '640px',
                autosizeProgress: false,
                success: function(media) {
                    $('.mejs-video').css({ height: '385px', width: '640px' });

                    $rootScope.player = media;
                    safeApply($rootScope);

                    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
                        $('.mejs-time-rail').addClass('safari');
                    }

                    $('.mejs-volume-button').addClass('mejs-fade-in');
                    $('.mejs-time-loaded').remove();
                    $('.mejs-time-handle').remove();
                    $('.mejs-time-buffering').remove();

                    $('.mejs-mediaelement').mouseenter(function(e) {
                        $('.mejs-video').addClass('show-controls');
                    });
                    
                    $('.mejs-video').mouseleave(function(e) {
                        $('.mejs-video').addClass('fade-out-controls');

                        window.setTimeout(function() {
                            $('.mejs-video').removeClass('fade-out-controls');
                            $('.mejs-video').removeClass('show-controls');
                        }, 250);
                    });

                    scope.$on('$viewContentLoaded', function() {
                        if ($('#buzz-layer > div.panel').length > 0) {
                            $('#buzz-layer > div.panel').hoverIntent({
                                over: function() {
                                    $('.mejs-mediaelement').trigger('mouseleave');
                                },
                                out: function() {

                                }
                            });
                        }
                    });

                    scope.$on('library_toggle_complete', function() {
                        $('.mejs-add-library-button').removeClass('added removed');
                        $('.mejs-add-library-button').addClass(broadcaster.message.className);
                    });

                    media.addEventListener('timeupdate', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_timeupdate', currentTime: media.currentTime });
                    }, false);

                    media.addEventListener('playing', function(e) {
                        $('.mejs-video').css({ height: '385px', width: '640px' });
                        broadcaster.prepForBroadcast({ broadcastType: 'player_playing' });
                    }, false);

                    media.addEventListener('pause', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_paused' });
                    }, false);

                    media.addEventListener('player_muteconvo', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_muteconvo' });
                    }, false);

                    media.addEventListener('player_unmuteconvo', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_unmuteconvo' });
                    }, false);

                    media.addEventListener('player_share', function(e) {
                        window.location.hash = '#/player/panel/share';
                    }, false);

                    media.addEventListener('player_addtolibrary', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_addtolibrary' });
                    }, false);

                    window.setTimeout(function() {
                        var playerTitleHtml = $('<div>').append($('h1.video-title').clone()).html();
                        $(playerTitleHtml).insertAfter('.mejs-share');
                        console.log(playerTitleHtml);
                    }, 1500);
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
        var slider = null;

        return function (scope, element, attrs) {
            if (scope.$last === true) {
                element.ready(function () {
                    var sliderOpts = {
                        infiniteLoop: false,
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
                        
                    slider = element.parent().bxSlider(sliderOpts);
                    element.parent().css({ 'width': '99999px' });
                    element.parent().parent().css({ 'width': '130px', 'height': '23px' });
                    element.parent().parent().parent().css({ 'width': '131px', 'max-width': '131px' });
                    
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
                var newWindow = window.open(attrs.loginpopup,'frameBuzzSSOLoginWindow','toolbar=0,resizable=0,status=0,width=640,height=528');
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
    })
    .directive("repeatPassword", function() {
        return {
            require: "ngModel",
            link: function(scope, elem, attrs, ctrl) {
                var otherInput = elem.inheritedData("$formController")[attrs.repeatPassword];

                ctrl.$parsers.push(function(value) {
                    if(value === otherInput.$viewValue) {
                        ctrl.$setValidity("repeat", true);
                        return value;
                    }
                    ctrl.$setValidity("repeat", false);
                });

                otherInput.$parsers.push(function(value) {
                    var valid = (value === ctrl.$viewValue);
                    ctrl.$setValidity("repeat", valid);
                    return value;
                });
            }
        };
    });