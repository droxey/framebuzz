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
                enablePluginDebug: true,
                features: ['title', 'share', 'addtolibrary', 'muteconvo', 'privateconvo', 'progress', 'playpause'],
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
                enablePseudoStreaming: true,
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
                    var hasHitPlay = false;

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
                    $('.mejs-overlay-loading').remove();
                    $('.mejs-time-handle').remove();
                    $('.mejs-time-buffering').remove();

                    //  =====
                    //  jQuery Event Listeners
                    //  =====

                    var headerHover = false;

                    var fadeOutControls = function() {
                        var activeHeader = $('div.active-header');
                        $('.mejs-video').addClass('fade-out-controls');
                        
                        if (activeHeader.hasClass('show-controls')) {
                            activeHeader.addClass('fade-out-controls');
                        }

                        window.setTimeout(function() {
                            $('.mejs-video').removeClass('fade-out-controls');
                            $('.mejs-video').removeClass('show-controls');
                            activeHeader.removeClass('show-controls');
                            activeHeader.removeClass('fade-out-controls');
                        }, 250);
                    };

                    $('.mejs-mediaelement').mouseenter(function(e) {
                        $('.mejs-video').addClass('show-controls');
                        activeHeader.addClass('show-controls');
                    });

                    $('.mejs-video').mouseleave(function(e) {
                        fadeOutControls();
                    });

                    $(document).on('click', '.sign-in-button', function() {
                        fadeOutControls();
                    });

                    $(document).on('click', '.mejs-mute-convo-button', function() {
                        var button = $(this);
                        if (button.hasClass('mejs-mute')) {
                            button.removeClass('mejs-mute').addClass('mejs-unmute');
                            button.html('<i class="fa fa-comment"></i>Show Conversation');
                            broadcaster.prepForBroadcast({ broadcastType: 'player_muteconvo' });
                        }
                        else {
                            button.removeClass('mejs-unmute').addClass('mejs-mute');
                            button.html('<i class="fa fa-comment"></i>Mute Conversation');
                            broadcaster.prepForBroadcast({ broadcastType: 'player_unmuteconvo' });
                        }
                    });

                    $(document).on('click', '.mejs-start-private-session', function() {
                        fadeOutControls();

                        window.setTimeout(function() {
                            broadcaster.prepForBroadcast({ broadcastType: 'player_startprivateconvo' });
                        }, 300);
                    });

                    $('.mejs-share-framebuzz-button').click(function() {
                        fadeOutControls();

                        window.setTimeout(function() {
                            window.location.hash = '#/player/panel/share';
                        }, 300);
                    });

                    $('.mejs-add-library-button').click(function() {
                        fadeOutControls();
                        
                        window.setTimeout(function() {
                            broadcaster.prepForBroadcast({ broadcastType: 'player_addtolibrary' });
                        }, 300);
                    });

                    //  =====
                    //  Scope Event Listeners
                    //  =====
                    scope.$on('$viewContentLoaded', function() {
                        if ($('#buzz-layer > div.panel').length > 0) {
                            if (isSafari) {
                                $('#heatmap').addClass('safari');
                            }

                            $('#buzz-layer').hoverIntent({
                                over: function() {
                                    $('.mejs-mediaelement').trigger('mouseleave');
                                },
                                out: function() {
                                }
                            });

                            if (!hasHitPlay) {
                                $('#buzz-layer > div.panel').addClass('hide-before-play');
                            }
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
                        hasHitPlay = true;

                        $('#buzz-layer > div.panel').removeClass('hide-before-play');
                        $('.mejs-video').css({ height: '385px', width: '640px' });

                        broadcaster.prepForBroadcast({ broadcastType: 'player_playing' });
                    }, false);

                    media.addEventListener('pause', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_paused' });
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
    .directive('textboxwidth', function() {
        return function(scope, element, attrs) {
            scope.$watch('replyThread', function(val) {
                window.setTimeout(function() {
                    var textbox = element.next();
                    var textboxWidth = textbox.width();
                    
                    textbox.css({
                        'padding-left': (element.width() + 12) + 'px',
                        'width': (textboxWidth - element.width() - 12) + 'px'
                    });
                }, 500);
            });
        };
    })
    .directive('onfocus', ['safeApply', '$state', function(safeApply, $state) {
        return {
            link: function(scope, element, attrs) {
                element.ready(function() {
                    var timeSet = false;

                    var unsetPostTime = function() {
                        if (!$state.is('player.loginView') && !$state.is('player.signupView')) {
                            scope.postTime = 0;
                            safeApply(scope);

                            $(element).val('');
                            $('#post-time').hide();
                            $('#duration').show().addClass('active');

                            timeSet = false;
                        }
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

                    $(element).on('blur', function(e) {
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
    .directive('loginpopup', ['localStorageService', function(localStorageService) {
        return function(scope, element, attrs) {
            $(element).click(function() {
                var newWindow = window.open(attrs.loginpopup,'frameBuzzSSOLoginWindow','toolbar=0,resizable=0,status=0,width=640,height=528');
                if (window.focus) { newWindow.focus(); }
                localStorageService.set('loggingIn', true);
                return false;
            });
        };
    }])
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
            template: '<div class="input-fields">' +
                        '<form class="clearfix">' +
                            '<input id="users-autocomplete" data-ng-model="term" data-ng-change="query()" type="text" placeholder="Find friends&hellip;" autocomplete="off">' +
                            '<div ng-transclude></div>' +
                        '</form>' +
                     '</div>',
            scope: {
                search: "&",
                select: "&",
                items: "=",
                term: "="
            },
            controller: ["$scope", function($scope) {
                $scope.items = [];
                $scope.hide = false;
                $scope.active = null;

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
                };

                $scope.$on('user_search_complete', function() {
                    $scope.items = broadcaster.message.data;
                });
            }],

            link: function(scope, element, attrs, controller) {
                var controllerSet = false;
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
                        scope.$apply(function() { this.selectActive(); });
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
        };
    }])
    .directive('typeaheadItem', ['broadcaster', function(broadcaster) {
        return {
             link: function($scope, $element, $attributes) {
                 var item = $scope.$eval($attributes.typeaheadItem);
                 var siblings = $element.parent().children();

                 $element.bind('click', function(e) {
                     siblings.removeClass('active');
                     $element.addClass('active');

                    broadcaster.prepForBroadcast({ broadcastType: 'player_addinvitee', invitee: item });

                    $('div.menu').hide();
                    $element.remove();
                    $('#users-autocomplete').val('');
                 });
            }
        };
 }])
 .directive('redirectConversation', ['broadcaster', function(broadcaster) {
     return {
         link: function($scope, $element, $attributes) {
            $scope.$on('private_convo_started', function() {
                var url = broadcaster.message.data;
                var seconds = 4;
                var countdownTimer = window.setInterval(timer, 1000);

                function timer() {
                    seconds = seconds - 1;
                    if (seconds <= 0) {
                        $element.text('Redirecting...');

                        clearInterval(countdownTimer);
                        window.location.href = url;
                    }
                    else {
                        var secondText = seconds == 1 ? ' second...' : ' seconds...';
                        $element.text('Loading new conversation in ' + seconds.toString() + secondText);
                    }
                }
            });
         }
     };
 }]);
