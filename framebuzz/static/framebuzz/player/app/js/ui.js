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