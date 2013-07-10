'use strict';

/* Directives */


angular.module('framebuzz.directives', [])
  .directive('appVersion', 'version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  })
  .directive('mediaElement', function() {
    return function(scope, element, attrs) {
        new MediaElement('video-element', {
            features: ['youtube','progress'],
            flashName: '../swf/flashmediaelement.swf',
            silverlightName: '../swf/silverlightmediaelement.xap',
            timerRate: 500,
            defaultVideoHeight: '385px',
            defaultVideoWidth: '640px',
            success: function (media) {
                media.addEventListener('timeupdate', function(e) {
                    var currentTimeHMS = convertSecondsToHMS(media.currentTime);
                    $('span.add-on em.current').text(currentTimeHMS);
                }, false);

                media.addEventListener('playing', function(e) {

                }, false);

                media.addEventListener('pause', function(e) {
                    $('.mejs-video').unbind('hover');
                    $('.mejs-overlay-play').hide().addClass('mejs-overlay-pause').fadeIn(500).show();
                }, false);
            }
        });
    };
});
