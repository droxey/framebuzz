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
                features: ['share', 'privateconvo', 'volume', 'muteconvo', 'progress'],
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
                    });

                    $('.mejs-video').mouseleave(function() {
                        $(this).addClass('fade-out-controls')
                            .delay(250)
                            .queue(function(next) {
                                $('.mejs-video').removeClass('fade-out-controls');
                                $('.mejs-video').removeClass('show-controls');
                                next();
                            });
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
                        window.location.hash = '#/player';
                        //broadcaster.prepForBroadcast({ broadcastType: 'player_muteconvo' });
                    }, false);

                    media.addEventListener('player_unmuteconvo', function(e) {
                        window.location.hash = '#/player/panel/blended';
                    }, false);

                    media.addEventListener('player_share', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_share' });
                    }, false);

                    media.addEventListener('player_privateconvo', function(e) {
                        broadcaster.prepForBroadcast({ broadcastType: 'player_privateconvo' });
                    }, false);
                }
            });
        };
    })
    .directive('scrollbar', function(broadcaster) {
        return function(scope, element, attrs) {
            $(element).perfectScrollbar();

            scope.$on('player_timeupdate', function() {
                $(element).perfectScrollbar('update');
            });
        };
    });