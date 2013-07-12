'use strict';

/* Controllers */

angular.module('framebuzz.controllers', []).
  controller('VideoPlayerCtrl', function($scope, socket, timeUpdate, safeApply) {
    // --
    // MODELS
    // --
    $scope.videoInstance = {};
    $scope.currentTime = 0;
    $scope.currentTimeHMS = '0:00';

    // --
    // PUBLIC METHODS
    // --
    
    $scope.postNewComment = function() {

    };

    $scope.postCommentAction = function() {

    };

    // --
    // PRIVATE METHODS
    // --

    $scope.$on('timeUpdate', function() {
        $scope.currentTime = timeUpdate.message.currentTime;
        $scope.currentTimeHMS = convertSecondsToHMS($scope.currentTime);
        safeApply($scope);
    });

    socket.onopen(function() {
        socket.send_json({eventType: 'FB_INITIALIZE_VIDEO', channel: SOCK.video_channel});
        
        console.log('Socket is connected! :)');
    });

    socket.onmessage(function(e) {
        var jsonData = JSON.parse(e.data);

        if (jsonData.eventType == 'FB_INITIALIZE_VIDEO') {
            $scope.videoInstance = jsonData.data;
            safeApply($scope);
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
  }).$inject = ['$scope', 'timeUpdate'];