var convertSecondsToHMS = function(totalSec) {
  var hours = parseInt( totalSec / 3600 ) % 24;
  var minutes = parseInt( totalSec / 60 ) % 60;
  var seconds = parseInt(totalSec % 60, 10);

  if (hours == 0) {
    return (minutes < 10 ? "0" + minutes : minutes) + ":"
      + (seconds  < 10 ? "0" + seconds : seconds);
  }
  else {
    return (hours < 10 ? "0" + hours : hours) + ":"
      + (minutes < 10 ? "0" + minutes : minutes) + ":"
      + (seconds  < 10 ? "0" + seconds : seconds);
  }
};


$(document).ready(function() {
  var player = new MediaElementPlayer('#ytVideo', {
    features: ['youtube','progress'],
    flashName: '../../swf/flashmediaelement.swf',
    silverlightName: '../../swf/silverlightmediaelement.xap',
    alwaysShowControls: true,
    // There's a bug here where commenting and hitting the spacebar will
    // cause the space to not be entered, and the video to pause.
    enableKeyboard: false,
    timerRate: 900,
    success: function (media) {
      videoPlayer = media;

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
});