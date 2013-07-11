'use strict';

/* Controllers */

angular.module('framebuzz.controllers', []).
  controller('VideoPlayerCtrl', function($scope, socket) {
    $scope.player = {};
    $scope.is_initialized = false;
    
    $scope.video_instance = {};

    socket.onopen(function() {
        socket.send_json({eventType: 'FB_INITIALIZE_VIDEO', channel: SOCK.video_channel});
        
        console.log('Socket is connected! :)');
    });

    socket.onmessage(function(e) {
        var jsonData = JSON.parse(e.data);

        if (jsonData.eventType == 'FB_INITIALIZE_VIDEO') {
            $scope.video_instance = jsonData.data;
            $scope.is_initialized = true;
        }
        else {
            console.log('Socket received unhandled message.');
            console.log(jsonData);
        }        
    });

    socket.onsent(function() {
        console.log('Socket sent a message!');
    });

    socket.onclose(function() {
        console.log('Socket is disconnected :(');
    });
  });