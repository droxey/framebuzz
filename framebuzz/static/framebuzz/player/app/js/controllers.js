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
                $scope.newReply = {};
                $scope.selectedThread = null;
                $scope.loginModel = {};
                $scope.signupModel = {};
                $scope.selectedThreadSiblings = {};
                
                var eventTypes = {
                    initVideo: 'FB_INITIALIZE_VIDEO',
                    postNewComment: 'FB_POST_NEW_COMMENT',
                    getThreadSiblings: 'FB_GET_THREAD_SIBLINGS',
                    login: 'FB_LOGIN',
                    signup: 'FB_SIGNUP'
                };

                // --
                // PUBLIC METHODS
                // --
                
                $scope.login = function() {
                    var messageData = {
                        'login': $scope.loginModel.username,
                        'password': $scope.loginModel.password
                    };

                    var message = {eventType: eventTypes.login, channel: SOCK.user_channel, data: messageData };
                    console.log(message);
                    socket.send_json(message);

                    $scope.loginModel = {};
                    safeApply($scope);
                };

                $scope.signup = function() {
                    socket.send_json({eventType: eventTypes.signup, channel: SOCK.user_channel, data: $scope.signupModel });

                    $scope.signupModel = {};
                    safeApply($scope);
                }
                
                $scope.postNewThread = function() {
                    var postData = {
                        'object_pk': $scope.videoInstance.video.id,
                        'content_type': 'core.video',
                        'time': $scope.currentTime,
                        'comment': $scope.newThread.comment
                    };

                    socket.send_json({eventType: eventTypes.postNewComment, channel: SOCK.video_channel, data: postData});

                    $scope.newThread = {};
                    safeApply($scope);
                };

                $scope.postNewReply = function() {
                    var postData = {
                        'object_pk': $scope.videoInstance.video.id,
                        'content_type': 'core.video',
                        'time': $scope.currentTime,
                        'comment': $scope.newReply.comment,
                        'parent': $scope.selectedThread.id
                    };

                    console.log({eventType: eventTypes.postNewComment, channel: SOCK.video_channel, data: postData});

                    socket.send_json({eventType: eventTypes.postNewComment, channel: SOCK.video_channel, data: postData});

                    $scope.newReply = {};
                    safeApply($scope);
                };

                $scope.postCommentAction = function(comment, action) {

                };

                $scope.setSelectedThread = function(thread) {
                    $scope.selectedThread = thread;

                    // TODO: Fetch siblings!
                    socket.send_json({eventType: eventTypes.getThreadSiblings, channel: SOCK.user_channel, data: { threadId: thread.id }});
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

                var addNewReply = function(newReply) {
                    var changed = false;
                    angular.forEach($scope.videoInstance.threads, function(thread, key) {
                        if (thread.id == newReply.parent_id) {
                            thread.replies.push(newReply);
                            changed = true;
                        }
                    });

                    if (changed) {
                        safeApply($scope);
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

                $scope.$on('player_share', function() {
                    console.log(broadcaster.message);
                });

                $scope.$on('player_privateconvo', function() {
                    console.log(broadcaster.message);
                });

                $scope.$on('player_playing', function() {
                    $state.transitionTo('player.blendedView'); 
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
                    }
                    else if (jsonData.eventType == eventTypes.postNewComment) {
                        if (jsonData.data.thread !== undefined) {
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
                        
                        if (jsonData.data.reply !== undefined) {
                            var newReply = jsonData.data.reply;
                            addNewReply(newReply);
                        }
                    }
                    else if (jsonData.eventType == eventTypes.getThreadSiblings) {
                        $scope.selectedThreadSiblings = jsonData.data;
                        safeApply($scope);
                    }
                    else if (jsonData.eventType == eventTypes.login) {
                        $scope.videoInstance.is_authenticated = jsonData.data.login_success;
                        safeApply($scope);

                        $state.transitionTo('player.initView');
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
                    $scope.videoInstance = {};
                    $scope.currentTime = 0;
                    $scope.currentTimeHMS = '00:00';

                    $state.transitionTo('player.initView');
                });
            }
        ]    
    );