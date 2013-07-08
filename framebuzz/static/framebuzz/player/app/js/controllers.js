'use strict';

/* Controllers */

angular.module('framebuzz.controllers', []).
  controller('VideoPlayerCtrl', function($scope, socket) {
    socket.onopen(function() {
        console.log('Socket is connected! :)');
    });

    socket.onmessage(function() {
        console.log('Socket received message.');
    });

    socket.onclose(function() {
        console.log('Socket is disconnected :(');
    });
  });