'use strict';

/* Directives */


angular.module('framebuzz.directives', [])
    .directive('appVersion', 'version', function(version) {
        return function(scope, elm, attrs) {
          elm.text(version);
        };
    })
    .directive('mediaElement', function(timeUpdate) {
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
                    $('.mejs-time-total span').not('.mejs-time-current').remove();

                    media.addEventListener('timeupdate', function(e) {
                        timeUpdate.prepForBroadcast({ currentTime: media.currentTime });
                    }, false);

                    media.addEventListener('playing', function(e) {

                    }, false);

                    media.addEventListener('pause', function(e) {

                    }, false);
                }
            });
        };
    })
    .directive('scrollbar', function(timeUpdate) {
        return function(scope, element, attrs) {
            $(element).perfectScrollbar();

            scope.$on('timeUpdate', function() {
                $(element).perfectScrollbar('update');
            });
        };
    });