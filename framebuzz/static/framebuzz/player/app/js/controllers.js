'use strict';

/* Controllers */

angular.module('framebuzz.controllers', []).
  controller('VideoPlayerCtrl', function($scope, socket, timeUpdate, safeApply) {
    
    // --
    // MODELS
    // --
    
    $scope.videoInstance = {};
    $scope.currentTime = 0;
    $scope.currentTimeHMS = '00:00';
    $scope.newThread = {};

    // --
    // PUBLIC METHODS
    // --
    
    $scope.postNewThread = function() {
        var postData = {
            'object_pk': $scope.videoInstance.video.id,
            'content_type': 'core.video',
            'time': $scope.currentTime,
            'comment': $scope.newThread.comment
        };

        socket.send_json({eventType: 'FB_POST_NEW_THREAD', channel: SOCK.video_channel, data: postData})
    };

    $scope.postCommentAction = function() {

    };

    // --
    // PRIVATE METHODS
    // --

    $scope.$on('timeUpdate', function() {
        $scope.currentTime = timeUpdate.message.currentTime;
        $scope.currentTimeHMS = mejs.Utility.secondsToTimeCode($scope.currentTime);
        safeApply($scope);
    });

    socket.onopen(function() {
        socket.send_json({eventType: 'FB_INITIALIZE_VIDEO', channel: SOCK.video_channel, data: ''});
        
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