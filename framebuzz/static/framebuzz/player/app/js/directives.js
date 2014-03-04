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
                features: ['share', 'addtolibrary', 'muteconvo', 'progress', 'playpause' ],
                pluginPath: SOCK.root_path + 'swf/',
                flashName: 'flashmediaelement.swf',
                silverlightName: 'silverlightmediaelement.xap',
                alwaysShowControls: true,
                // There's a bug here where commenting and hitting the spacebar will
                // cause the space to not be entered, and the video to pause.
                enableKeyboard: false,
                timerRate: 500,
                enablePluginSmoothing: true,
                autosizeProgress: false,
                success: function(media) {
                    //  =====
                    //  Angular.js Globals
                    //  =====
                    $rootScope.player = media;
                    safeApply($rootScope);

                    //  =====
                    //  Browser-Specific Hacks
                    //  =====
                    var isOpera = !!window.opera || navigator.userAgent.indexOf('Opera') >= 0;
                    var isFirefox = typeof InstallTrigger !== 'undefined';
                    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
                    var isChrome = !!window.chrome;
                    var isIE = /*@cc_on!@*/false;

                    if (isSafari && !isChrome) {
                        $('.mejs-time-rail').addClass('safari');
                    }

                    if (isFirefox) {
                        if (navigator.appVersion.indexOf('Windows') != -1) {
                            $('.mejs-time-rail').addClass('winff');
                        }
                    }

                    //  =====
                    //  CSS Changes
                    //  =====
                    //$('.mejs-video').css({ height: '385px', width: '640px' });
                    //$('video').css({ height: '385px', width: '640px' });
                    $('.mejs-overlay-loading').remove();
                    $('.mejs-time-handle').remove();
                    $('.mejs-time-buffering').remove();

                    //  =====
                    //  jQuery Event Listeners
                    //  =====
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

                    $('.mejs-mute-conversation-button button').click(function() {
                        var button = $(this);
                        var buttonImg = button.find('.mejs-mute-conversation-icon');

                        if (button.hasClass('mejs-mute')) {
                            buttonImg.attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGUAAABjCAYAAACCJc7SAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjYyMTM3QjEzRTQxQjExRTI4QTIwQzc4MzI2RDJENTcwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjYyMTM3QjE0RTQxQjExRTI4QTIwQzc4MzI2RDJENTcwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjVEMUI3NThFMzUwMTFFMjhBMjBDNzgzMjZEMkQ1NzAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjIxMzdCMTJFNDFCMTFFMjhBMjBDNzgzMjZEMkQ1NzAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5SxLILAAAF+0lEQVR42uzd208j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');
                            button.removeClass('mejs-mute').addClass('mejs-unmute');

                            broadcaster.prepForBroadcast({ broadcastType: 'player_muteconvo' });
                        }
                        else {
                            buttonImg.attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGUAAABjCAYAAACCJc7SAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjYyMTM3QjE3RTQxQjExRTI4QTIwQzc4MzI2RDJENTcwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjYyMTM3QjE4RTQxQjExRTI4QTIwQzc4MzI2RDJENTcwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjIxMzdCMTVFNDFCMTFFMjhBMjBDNzgzMjZEMkQ1NzAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjIxMzdCMTZFNDFCMTFFMjhBMjBDNzgzMjZEMkQ1NzAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6ioJXNAAAC+UlEQVR42uyd7XHaQBBAZSYFUAJUEKUC5FEDoQJCB1BBhgpCByYVQAOMoQN1YEqgA7KXnOND6CQsS7rT+b2ZHf3BM5592r0v+3i4XC4R+MUDUpACSEEKIAUpgBSkkIUQpOz3++/ymEjEEglpvOEgkUkcJXZlH0zTtL4UETGUx0JiJjEi73dzkvgtsZY4NyZFhCgZPyWG5Lg2SshKy6kvRVfHlhbVeGubvlZNkZRBiRA1XrwgpHESndfY9oFBiZBn2lVrDHV+47tmX7plvSCks3FmLC3sXFUpW4R0WjHb0krRs6xf5KpzllIt6xsptC1/2pjZvhYIcdrGFkVjyozcOGV21b70XtaWvDhnKi1s91opE/LhBROzfcXkwwtiU0pCPrwgsS0ewTFIQQogBSmAFKQAUpACSAGkIAWQghRAClIAKYAUpABSkAJIQQogBZCCFEAKUgApSAGkAFKQAkhBCiAFKYAUQErfpJxJhRdc3WKUkQ8vyEwpR/LhBUdTyo58eMFfD+bNeOpWvBF5ccYpTdNxfva1Ii9O+Z///MWeVIvjKilapyzJjxOu8l50WfSTPH6Qp87YSJXMq1b0S9Ytna5LbrpT4bdC6DuKrXexQ2NCHvNXqtsqJdIffKRi2hUSWba3rBuShpg1OWyUdZkQa/sqaGeJPJ6YLn9s2iuhBvRD7uWvJ8WQo2Zl6qbphBzfjZKgvpNrY+lIH5NiyBlpMRNdPWpCwD35/1pSpqviqIWcyn6gMSk5Qb4k5LmlCp7b3vImKJLyhZe79K13MgMN6Ti4ySpRIsaulgSc0Rdse1RNWdsmlPbV1FR96cO6DClv48c0v4ZwBe3rbcvj4MsvFIqUuoP8LvJwj+8zV8oqMr7D1ydCGVO+vnP8mEce/wVPKFLu3eI56erw+khi8ImkqIH8W9SDM6JQpFSdkFaeYdC+uqXVDUWkvK9KenukHUL7GloWhOOop39jEOI6ZaMH9N7+z00IUg5GRWR6DOk1oVTK1FiD9J4/AgwAoQftpiFk1cUAAAAASUVORK5CYII=');
                            button.removeClass('mejs-unmute').addClass('mejs-mute');

                            broadcaster.prepForBroadcast({ broadcastType: 'player_unmuteconvo' });
                        }
                    });

                    $('.mejs-share-framebuzz-button').click(function() {
                        window.location.hash = '#/player/panel/share';
                    });

                    $('.mejs-add-library-button').click(function() {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_addtolibrary' });
                    });

                    //  =====
                    //  Scope Event Listeners
                    //  =====
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

                    //  =====
                    //  Video Player Event Listeners
                    //  =====
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

                    window.setTimeout(function() {
                        var playerTitleHtml = $('<div>').append($('h1.video-title').clone()).html();
                        $(playerTitleHtml).insertAfter('.mejs-share');
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
    .directive('bxslider', ['safeApply', function (safeApply) {
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

                    scope.$watch('updateSlider', function(val) {
                        if (val) {
                            slider.reloadSlider();

                            scope.updateSlider = false;
                            safeApply(scope);
                        }
                    }, true);
                });
            }
        };
    }])
    .directive('onfocus', ['safeApply', function(safeApply) {
        return {
            link: function(scope, element, attrs) {
                element.ready(function() {
                    var timeSet = false;
                    var unsetPostTime = function() {
                        scope.postTime = 0;
                        safeApply(scope);

                        $(element).val('');
                        $('#post-time').hide();
                        $('#duration').show().addClass('active');

                        timeSet = false;
                    };

                    $(element).on('keyup', function(e) {
                        var setPostTime = function() {
                            scope.setPostTime();

                            $('#duration').hide();
                            $('#post-time').show().addClass('active');

                            timeSet = true;
                        };

                        if (!timeSet) {
                            if (e.keyCode != 8 && e.keyCode != 46) {
                                setPostTime();
                            }
                        }
                        else {
                            if ($(element).val().length == 0) {
                                if (e.keyCode == 8 || e.keyCode == 46) {
                                    unsetPostTime();
                                }
                            }
                        }

                        var unregisterFocus = scope.$watch('clearFocus', function(val) {
                            if (val) {
                                $(element).trigger('blur');
                                unregisterFocus();
                            }
                        }, true);
                    });

                    $(element).on('blur', function() {
                        unsetPostTime();
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
    })
    .directive('heatmaphover', function() {
        return function(scope, element, attrs) {
            if (scope.$last === true) {
                element.ready(function() {
                    $('#heatmap tr td').mouseenter(function(e) {
                        $(this).addClass('active');
                        e.stopPropagation();
                    });
                });
            }
        };
    })
    .directive('typeahead', ["$timeout", "$rootScope", "broadcaster", function($timeout, $rootScope, broadcaster) {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            template: '<div class="fields">
                        <form class="clearfix">
                            <input id="users-autocomplete" data-ng-model="term" data-ng-change="query()" type="text" placeholder="Start typing to invite FrameBuzz users..." autocomplete="off">
                            <div ng-transclude></div>
                            <button id="btn-add-user-convo" type="button" class="btn btn-small btn-success"><i class="fa fa-plus-square"></i></button>
                        </form>
                        <div ng-transclude></div>
                      </div>',
            scope: {
                search: "&",
                select: "&",
                items: "=",
                term: "="
            },
            controller: ["$scope", function($scope) {
                $scope.items = [];
                $scope.hide = false;

                this.activate = function(item) {
                    $scope.active = item;
                };

                this.activateNextItem = function() {
                    var index = $scope.items.indexOf($scope.active);
                    this.activate($scope.items[(index + 1) % $scope.items.length]);
                };

                this.activatePreviousItem = function() {
                    var index = $scope.items.indexOf($scope.active);
                    this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
                };

                this.isActive = function(item) {
                    return $scope.active === item;
                };

                this.selectActive = function() {
                    this.select($scope.active);
                };

                this.select = function(item) {
                    $scope.hide = true;
                    $scope.focused = true;
                    $scope.select({item:item});
                };

                $scope.isVisible = function() {
                    return !$scope.hide && ($scope.focused || $scope.mousedOver);
                };

                $scope.query = function() {
                    $scope.hide = false;
                    broadcaster.prepForBroadcast({ broadcastType: 'player_searchusers', term: $scope.term });
                }

                $scope.$on('user_search_complete', function() {
                    $scope.items = broadcaster.message.data;

                    if ($scope.items.length == 0) {
                        $scope.hide = true;
                    }
                });
            }],

            link: function(scope, element, attrs, controller) {

                var $input = element.find('form > input');
                var $list = element.find('> div');

                $input.bind('focus', function() {
                    scope.$apply(function() { scope.focused = true; });
                });

                $input.bind('blur', function() {
                    scope.$apply(function() { scope.focused = false; });
                });

                $list.bind('mouseover', function() {
                    scope.$apply(function() { scope.mousedOver = true; });
                });

                $list.bind('mouseleave', function() {
                    scope.$apply(function() { scope.mousedOver = false; });
                });

                $input.bind('keyup', function(e) {
                    if (e.keyCode === 9 || e.keyCode === 13) {
                        scope.$apply(function() { controller.selectActive(); });
                    }

                    if (e.keyCode === 27) {
                        scope.$apply(function() { scope.hide = true; });
                    }
                });

                $input.bind('keydown', function(e) {
                    if (e.keyCode === 9 || e.keyCode === 13 || e.keyCode === 27) {
                        e.preventDefault();
                    };

                    if (e.keyCode === 40) {
                        e.preventDefault();
                        scope.$apply(function() { controller.activateNextItem(); });
                    }

                    if (e.keyCode === 38) {
                        e.preventDefault();
                        scope.$apply(function() { controller.activatePreviousItem(); });
                    }
                });

                scope.$watch('items', function(items) {
                    controller.activate(items.length ? items[0] : null);
                });

                scope.$watch('focused', function(focused) {
                    if (focused) {
                        $timeout(function() { $input.focus(); }, 0, false);
                    }
                });

                scope.$watch('isVisible()', function(visible) {
                    if (visible) {
                        var pos = $input.position();
                        var height = $input[0].offsetHeight;

                        $list.css({
                            top: pos.top + height,
                            left: pos.left,
                            position: 'absolute',
                            display: 'block'
                        });
                    } else {
                        $list.css('display', 'none');
                    }
                });
            }
        }
    }])
    .directive('typeaheadItem', function() {
        return {
            require: '^typeahead',
            link: function(scope, element, attrs, controller) {
                var item = scope.$eval(attrs.typeaheadItem);

                scope.$watch(function() { return controller.isActive(item); }, function(active) {
                    if (active) {
                        element.addClass('active');
                    } else {
                        element.removeClass('active');
                    }
                });

                element.bind('mouseenter', function(e) {
                    scope.$apply(function() { controller.activate(item); });
                });

                element.bind('click', function(e) {
                    scope.$apply(function() { controller.select(item); });
                });
            }
        };
    });
