'use strict';

/* Controllers */

angular.module('framebuzz.controllers', []).
  controller('VideoPlayerCtrl', 
        ['$scope', '$state', '$filter', 'socket', 'broadcaster', 'safeApply', 
            function($scope, $state, $filter, socket, broadcaster, safeApply) {    
                $scope.rootPath = SOCK.root_path;
                $scope.videoInstance = {};
                $scope.currentTime = 0;
                $scope.currentTimeHMS = '00:00';
                $scope.newThread = {};
                
                var eventTypes = {
                    initVideo: 'FB_INITIALIZE_VIDEO',
                    postNewThread: 'FB_POST_NEW_THREAD'
                };

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

                    socket.send_json({eventType: eventTypes.postNewThread, channel: SOCK.video_channel, data: postData});

                    $scope.newThread = {};
                    safeApply($scope);
                };

                $scope.postCommentAction = function() {

                };

                // --
                // PRIVATE METHODS
                // --
                
                var threadInCollection = function(thread) {
                    for (var i = 0; i < $scope.videoInstance.threads.length; i++) {
                        if ($scope.videoInstance.threads[i].id === thread.id) {
                            return true;
                        }
                    }

                    return false;
                };

                var addNewThread = function(newThread) {
                    var changed = false;
                    angular.forEach($scope.videoInstance.threads, function(thread, key) {
                        if (!threadInCollection(newThread)) {
                            $scope.videoInstance.threads.push(newThread);
                            changed = true;
                        }
                    });

                    if (changed) {
                        $scope.videoInstance.threads = $filter('orderBy')($scope.videoInstance.threads, 'time', true);
                    }
                };

                // --
                // PLAYER DIRECTIVE BROADCASTS
                // --

                $scope.$on('player_timeupdate', function() {
                    $scope.currentTime = broadcaster.message.currentTime;
                    $scope.currentTimeHMS = mejs.Utility.secondsToTimeCode($scope.currentTime);
                    safeApply($scope);
                });

                $scope.$on('player_muteconvo', function() {
                    $state.transitionTo('player.initView');
                });

                $scope.$on('player_unmuteconvo', function() {
                    $state.transitionTo('player.blendedView'); 
                });

                $scope.$on('player_share', function() {
                    console.log(broadcaster.message);
                });

                $scope.$on('player_privateconvo', function() {
                    console.log(broadcaster.message);
                });

                $scope.$on('player_playing', function() {
                    console.log(broadcaster.message);
                });

                $scope.$on('player_paused', function() {
                    console.log(broadcaster.message);
                });

                // --
                // EVENT HANDLERS
                // --

                socket.onopen(function() {
                    socket.send_json({eventType: eventTypes.initVideo, channel: SOCK.video_channel, data: ''});
                });

                socket.onmessage(function(e) {
                    var jsonData = JSON.parse(e.data);

                    if (jsonData.eventType == eventTypes.initVideo) {
                        $scope.videoInstance = jsonData.data;
                        safeApply($scope);

                        if ($scope.videoInstance.is_authenticated) {
                            $state.transitionTo('player.blendedView'); 
                        }
                        else {
                            // TODO: Transition to the login state.
                        }
                    }
                    else if (jsonData.eventType == eventTypes.postNewThread) {
                        var newThread = jsonData.data.thread;
                        if (newThread.is_visible) {
                            addNewThread(newThread);
                        }
                        else {
                            // Find the thread for the time, and update
                            // the has_hidden_sibilings value.
                            console.log('TODO: This comment is not visible.');
                        }
                    }
                    else {
                        console.log('Socket received unhandled message.');
                        console.log(jsonData);
                    }        
                });

                socket.onsent(function(e) {
                    // Note: This may be useful in the future,
                    // but will remain unimplemented until required.
                });

                socket.onclose(function() {
                    console.log('Socket is disconnected :(');
                });
            }
        ]    
    );