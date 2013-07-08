'use strict';

/* Controllers */

angular.module('framebuzz.controllers', []).
  controller('VideoPlayerCtrl', function($scope, socket) {
    $scope.video = {};
    $scope.heatmap = {};
    $scope.threads = {};

    socket.onopen(function() {
        socket.send_json({eventType: 'FB_INITIALIZE_VIDEO', channel: SOCK.video_channel});
        
        console.log('Socket is connected! :)');
    });

    socket.onmessage(function(e) {
        var jsonData = JSON.parse(e.data);
        
        if (jsonData.eventType == 'FB_INITIALIZE_VIDEO') {
            $scope.video = jsonData.data.video;
            $scope.heatmap = jsonData.data.heatmap;
            $scope.threads = jsonData.data.threads;
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