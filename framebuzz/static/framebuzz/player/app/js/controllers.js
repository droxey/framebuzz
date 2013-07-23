'use strict';

/* Controllers */

angular.module('framebuzz.controllers', []).
  controller('VideoPlayerCtrl', 
        ['$scope', '$state', '$filter', '$http', 'socket', 'broadcaster', 'safeApply', 
            function($scope, $state, $filter, $http, socket, broadcaster, safeApply) {    
                $scope.rootPath = SOCK.root_path;
                $scope.videoInstance = {};
                $scope.videoInstance.is_authenticated = SOCK.is_authenticated;
                $scope.currentTime = 0;
                $scope.currentTimeHMS = '00:00';
                $scope.newThread = {};
                $scope.newReply = {};
                $scope.selectedThread = null;
                $scope.loginModel = {};
                $scope.signupModel = {};
                $scope.selectedThreadSiblings = {};
                $scope.replyClicked = false;
                $scope.userProfile = {};
                $scope.activities = {};

                var eventTypes = {
                    initVideo: 'FB_INITIALIZE_VIDEO',
                    postNewComment: 'FB_POST_NEW_COMMENT',
                    getThreadSiblings: 'FB_GET_THREAD_SIBLINGS',
                    login: 'FB_LOGIN',
                    signup: 'FB_SIGNUP',
                    commentAction: 'FB_COMMENT_ACTION',
                    playerAction: 'FB_PLAYER_ACTION',
                    getActivityStream: 'FB_ACTIVITY_STREAM',
                    getUserProfile: 'FB_USER_PROFILE'
                };

                // --
                // PUBLIC METHODS
                // --
                
                $scope.login = function() {
                    $http({
                        method: 'POST', 
                        url: SOCK.login_url, 
                        data: { login: $scope.loginModel.username, password: $scope.loginModel.password },
                        headers: {
                            "Content-Type": "application/json; charset=UTF-8"
                        }
                    })
                    .success(function(data, status, headers, config) {
                        if (data.data.login_success) {
                            $scope.videoInstance.is_authenticated = data.data.login_success;
                            $scope.videoInstance.user = data.data.user;
                            $scope.loginModel = {};
                            safeApply($scope);

                            $state.transitionTo('player.panelView');
                        }
                    })
                    .error(function(data, status, headers, config) {
                        
                    });
                };

                $scope.logout = function() {
                    $http({
                        method: 'POST', 
                        url: SOCK.logout_url
                    })
                    .success(function(data, status, headers, config) {
                        if (data.logged_out !== undefined) {
                            $scope.videoInstance.user = {};
                            $scope.videoInstance.is_authenticated = false;
                            safeApply($scope);

                            $state.transitionTo('player.panelView');
                        }
                    })
                    .error(function(data, status, headers, config) {
                    });
                };

                $scope.signup = function() {
                    var messageData = {
                        'username': $scope.signupModel.username,
                        'password1': $scope.signupModel.password,
                        'password2': $scope.signupModel.confirmPassword,
                        'email': $scope.signupModel.email
                    };

                    $http({
                        method: 'POST', 
                        url: SOCK.signup_url, 
                        data: messageData,
                        headers: {
                            "Content-Type": "application/json; charset=UTF-8"
                        }
                    })
                    .success(function(data, status, headers, config) {
                        if (data.data.login_success) {
                            $scope.videoInstance.is_authenticated = data.data.login_success;
                            $scope.videoInstance.user = data.data.user;
                            $scope.signupModel = {};
                            safeApply($scope);

                            $state.transitionTo('player.panelView');
                        }
                    })
                    .error(function(data, status, headers, config) {
                    
                    });
                }
                
                $scope.postNewThread = function() {
                    var postData = {
                        'object_pk': $scope.videoInstance.video.id,
                        'content_type': 'core.video',
                        'time': $scope.currentTime,
                        'comment': $scope.newThread.comment,
                        'username': $scope.videoInstance.user.username
                    };

                    socket.send_json({
                        eventType: eventTypes.postNewComment, 
                        channel: SOCK.video_channel, 
                        data: postData
                    });

                    $scope.newThread = {};
                    safeApply($scope);
                };

                $scope.postNewReply = function() {
                    var postData = {
                        'object_pk': $scope.videoInstance.video.id,
                        'content_type': 'core.video',
                        'time': $scope.currentTime,
                        'comment': $scope.newReply.comment,
                        'parent': $scope.selectedThread.id,
                        'username': $scope.videoInstance.user.username
                    };

                    socket.send_json({
                        eventType: eventTypes.postNewComment, 
                        channel: SOCK.video_channel, 
                        data: postData
                    });

                    $scope.newReply = {};
                    safeApply($scope);
                };

                $scope.postCommentAction = function(comment, action) {
                    socket.send_json({
                        eventType: eventTypes.commentAction, 
                        channel: SOCK.user_channel, 
                        data: { 
                            threadId: comment.id, 
                            action: action,
                            username: $scope.videoInstance.user.username
                        }
                    });
                };

                $scope.setSelectedThread = function(thread = null) {
                    if (thread === null) {
                        thread = getNextThreadInTimeline();
                    }
                    console.log(thread);
   
                    $scope.selectedThread = thread;

                    socket.send_json({
                        eventType: eventTypes.getThreadSiblings, 
                        channel: SOCK.user_channel, 
                        data: { 
                            threadId: thread.id 
                        }
                    });
                };

                $scope.showReplyFormForThread = function(thread) {
                    
                };

                $scope.getActivityStream = function() {
                    socket.send_json({
                        eventType: eventTypes.getActivityStream, 
                        channel: SOCK.user_channel, 
                        data: { 
                            username: $scope.videoInstance.user.username 
                        }
                    });
                };

                $scope.getUserProfile = function(username) {
                    if (username === undefined) {
                        username = $scope.videoInstance.user.username;
                    }

                    socket.send_json({
                        eventType: eventTypes.getUserProfile, 
                        channel: SOCK.user_channel, 
                        data: { 
                            username: username 
                        }
                    });
                }

                $scope.toBeImplemented = function() {
                    alert('Not implemented yet!');
                };

                // --
                // PRIVATE METHODS
                // --
                
                var getThreadById = function(threadId) {
                    angular.forEach($scope.videoInstance.threads, function(thread, key) {
                        if (thread.id == threadId) {
                            return thread;
                        }
                    });
                };

                var getNextThreadInTimeline = function() {
                    if ($scope.currentTime > 0) {
                        var time = angular.copy($scope.currentTime);
                        var timeOrderedThreads = $filter('orderBy')($scope.videoInstance.threads, 'time');
                        var foundThread = null;
                        
                        for (var i = 0; i < timeOrderedThreads.length; i++) {
                            if (timeOrderedThreads[i].time >= time) {
                                foundThread = timeOrderedThreads[i];
                            }

                            if (foundThread !== null) { break; }
                        }

                        return foundThread;
                    }
                }
                
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
                    $state.transitionTo('player.share');
                });

                $scope.$on('player_addtolibrary', function() {
                    console.log(broadcaster.message);
                });

                $scope.$on('player_playing', function() {
                    if ($state.is('player.panelView')) {
                        $state.transitionTo('player.blendedView');
                    }
                
                    socket.send_json({
                        eventType: eventTypes.playerAction, 
                        channel: SOCK.user_channel, 
                        data: { 
                            action: 'player_playing',
                            username: $scope.videoInstance.user.username,
                            time: $scope.currentTime
                        }
                    }); 
                });

                $scope.$on('player_paused', function() {
                    socket.send_json({
                        eventType: eventTypes.playerAction, 
                        channel: SOCK.user_channel, 
                        data: { 
                            action: 'player_paused',
                            username: $scope.videoInstance.user.username,
                            time: $scope.currentTime
                        }
                    });
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
                            addNewThread(newThread);
                        }
                        
                        if (jsonData.data.reply !== undefined) {
                            var newReply = jsonData.data.reply;
                            addNewReply(newReply);
                        }
                    }
                    else if (jsonData.eventType == eventTypes.getThreadSiblings) {
                        $scope.selectedThreadSiblings = jsonData.data.siblings;
                        safeApply($scope);

                        $state.transitionTo('player.activeView.comments', { id: $scope.selectedThread.id });
                    }
                    else if (jsonData.eventType == eventTypes.commentAction) {
                        $scope.selectedThread = jsonData.data.thread;
                        safeApply($scope); 
                    }
                    else if (jsonData.eventType == eventTypes.getActivityStream) {
                        $scope.activities = jsonData.data.activities;
                        safeApply($scope);
                        $state.transitionTo('player.activeView.activity');
                    }
                    else if (jsonData.eventType == eventTypes.getUserProfile) {
                        $scope.userProfile = jsonData.data;
                        safeApply($scope);

                        $state.transitionTo('player.userProfileView', { username: $scope.userProfile.user.username });
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
                    $state.transitionTo('player.initView');
                });
            }
        ]    
    );