var Chat = (function() {
  var _socket;

  function init(socket) {
    _socket = socket;

    _socket.send_json({eventType: 'subscribeToChannel', channel: SOCK.video_channel});
  }

  return {
     init: init
  };

})();


var initsock = function(callback) {
  sock = new SockJS('http://' + SOCK.host + ':' + SOCK.port + '/' + SOCK.channel);

  sock.onmessage = function(e) {
    console.log('got message!');
    console.log('message', e.data);
  };

  sock.onclose = function() {
    console.log('closed :(');
  };

  sock.onopen = function() {
    console.log('open');
    if (sock.readyState !== SockJS.OPEN) {
      throw "Connection NOT open";
    }
    callback(sock);
  };

};


$(function() {
  initsock(function(socket) {
    Chat.init(socket);
  });
});