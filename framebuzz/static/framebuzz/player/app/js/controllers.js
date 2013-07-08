'use strict';

/* Controllers */

angular.module('framebuzz.controllers', []).
  controller('VideoPlayerCtrl', function($scope, socket) {
    socket.onopen(function() {
        socket.send_json({eventType: 'FB_SUBSCRIBE_TO_CHANNEL', channel: SOCK.video_channel});
        
        console.log('Socket is connected! :)');
    });

    socket.onmessage(function(e) {
        console.log(e.data);
        console.log('Socket received message.');
    });

    socket.onsent(function() {
        console.log('Socket sent a message!');
    });

    socket.onclose(function() {
        console.log('Socket is disconnected :(');
    });
  });