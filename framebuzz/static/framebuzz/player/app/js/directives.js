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
            features: ['youtube', 'progress', 'volume', 'muteconvo'],
            flashName: '../swf/flashmediaelement.swf',
            silverlightName: '../swf/silverlightmediaelement.xap',
            alwaysShowControls: true,
            // There's a bug here where commenting and hitting the spacebar will
            // cause the space to not be entered, and the video to pause.
            enableKeyboard: false,
            timerRate: 500,
            defaultVideoWidth: '640px',
            defaultVideoHeight: '380px',
            success: function(media) {
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
});
