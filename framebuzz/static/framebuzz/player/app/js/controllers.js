'use strict';

/* Controllers */

angular.module('framebuzz.controllers', []).
  controller('VideoPlayerCtrl', 
        ['$rootScope', '$scope', '$state', '$filter', '$http', 'socket', 'broadcaster', 'safeApply', 'notificationFactory', 
            function($rootScope, $scope, $state, $filter, $http, socket, broadcaster, safeApply, notificationFactory) {    
                $scope.rootPath = SOCK.root_path;
                $scope.videoInstance = {};
                $scope.videoInstance.is_authenticated = SOCK.is_authenticated;
                $scope.currentTime = 0;
                $scope.currentTimeHMS = '00:00';
                $scope.newThread = {};
                $scope.newReply = {};
                $scope.selectedThread = null;
                $scope.clearFocus = false;
                $scope.isCollapsed = false;
                $scope.updateSlider = false;

                $scope.loginModel = {};
                $scope.signupModel = {};
                $scope.loginUrls = SOCK.login_urls;

                $scope.replyClicked = false;
                $scope.userProfile = {};
                $scope.activities = {};
                $scope.postTime = 0;
                $scope.playing = false;
                $scope.paused = false;
                $scope.timeOrderedThreads = null;
                $scope.selectedThreadIndex = -1;
                $scope.share = {};

                var eventTypes = {
                    initVideo: 'FB_INITIALIZE_VIDEO',
                    postNewComment: 'FB_POST_NEW_COMMENT',
                    getThreadSiblings: 'FB_GET_THREAD_SIBLINGS',
                    login: 'FB_LOGIN',
                    signup: 'FB_SIGNUP',
                    commentAction: 'FB_COMMENT_ACTION',
                    playerAction: 'FB_PLAYER_ACTION',
                    getActivityStream: 'FB_ACTIVITY_STREAM',
                    getUserProfile: 'FB_USER_PROFILE',
                    shareViaEmail: 'FB_EMAIL_SHARE',
                    addToLibrary: 'FB_ADD_TO_LIBRARY',
                    notification: 'FB_USER_NOTIFICATION',
                    toggleFollow: 'FB_TOGGLE_FOLLOW'
                };

                // --
                // PUBLIC METHODS
                // --
                
                $scope.login = function() {
                    $http({
                        method: 'POST', 
                        url: SOCK.login_url, 
                        data: { 
                            login: $scope.loginModel.username, 
                            password: $scope.loginModel.password
                        },
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

                            $state.transitionTo('player.blendedView');
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

                            $state.transitionTo('player.blendedView');
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

                            $state.transitionTo('player.blendedView');
                        }
                    })
                    .error(function(data, status, headers, config) {
                    
                    });
                }
                
                $scope.postNewThread = function() {
                    var time = $scope.postTime == null 
                        ? angular.copy($scope.currentTime) 
                        : angular.copy($scope.postTime);

                    var timeTruncated = parseFloat(time.toString().substring(0, 9));
                    var postData = {
                        'object_pk': $scope.videoInstance.video.id,
                        'content_type': 'core.video',
                        'time': timeTruncated,
                        'comment': $scope.newThread.comment,
                        'username': $scope.videoInstance.user.username
                    };

                    socket.send_json({
                        eventType: eventTypes.postNewComment, 
                        channel: SOCK.video_channel, 
                        data: postData
                    });

                    $scope.newThread = {};
                    $scope.clearFocus = true;
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

                $scope.setPostTime = function() {
                    $scope.postTime = angular.copy($scope.currentTime);
                    $scope.postTimeHMS = mejs.Utility.secondsToTimeCode($scope.postTime);
                    safeApply($scope);
                };

                $scope.setSelectedThread = function(thread) {
                    var index = -1;

                    if (thread === null || thread === undefined) {
                        thread = getNextThreadInTimeline();
                    }

                    if (thread != null) {
                        index = $scope.timeOrderedThreads.indexOf(thread);

                        $state.transitionTo('player.activeView.thread', { threadId: thread.id });
                        $scope.selectedThreadIndex = index;
                        $scope.selectedThread = thread;
                        safeApply($scope);

                        $scope.player.pause();
                    }
                };

                $scope.setSelectedThreadAndTime = function(thread) {
                    $scope.setSelectedThread(thread);
                    $scope.setVideoTime(thread.time);
                }

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

                $scope.setVideoTime = function(time) {
                    $scope.currentTime = time;
                    $scope.currentTimeHMS = mejs.Utility.secondsToTimeCode(time);
                    safeApply($scope);

                    $rootScope.player.setCurrentTime(time);
                };

                $scope.shareViaEmail = function() {
                    var postData = {
                        'shareWithEmail': $scope.share.email,
                    };

                    socket.send_json({
                        eventType: eventTypes.shareViaEmail, 
                        channel: SOCK.user_channel, 
                        data: postData
                    });

                    $scope.share = {};
                    safeApply($scope);

                    var message = 'An email has been sent to ' + postData.shareWithEmail + '.';
                    notificationFactory.success(message);
                };

                $scope.toggleFollow = function(username) {
                    socket.send_json({
                        eventType: eventTypes.toggleFollow, 
                        channel: SOCK.user_channel, 
                        data: { 
                            'user_to_toggle': username,
                            'username': $scope.videoInstance.user.username,
                        }
                    });
                };

                $scope.openPlayerLink = function(url) {
                    // This isn't ideal. Move to a directive.
                    window.location.href = url;
                    window.onbeforeunload = function() {
                        $('#player-container').fadeIn('fast');
                    };
                };

                $scope.resumeVideo = function() {
                    $state.transitionTo('player.blendedView');
                    $scope.player.play();
                };

                // --
                // PRIVATE METHODS
                // --
                
                var getThreadById = function(threadId) {
                    var found = null;

                    angular.forEach($scope.videoInstance.threads, function(thread, key) {
                        if (thread.id == threadId) {
                            found = thread;
                        }
                    });

                    return found;
                };

                var getReplyByIdAndThread = function(id, thread) {
                    angular.forEach(thread.replies, function(reply, key) {
                        if (reply.id == id) {
                            return reply;
                        }
                    });
                };

                var getNextThreadInTimeline = function() {
                    if ($scope.currentTime > 0) {
                        var time = angular.copy($scope.currentTime);
                        var foundThread = null;
                        
                        if ($scope.videoInstance.threads.length > 0) {
                            for (var i = 0; i < $scope.videoInstance.threads.length; i++) {
                                if ($scope.videoInstance.threads[i].time <= time) {
                                    foundThread = $scope.videoInstance.threads[i];
                                }

                                if (foundThread !== null) { break; }
                            }

                            if (foundThread == null) {
                                foundThread = $scope.videoInstance.threads[0];
                            }
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
                    
                    if (!threadInCollection(newThread)) {
                        if (newThread.hidden_by_id !== undefined && !newThread.is_visible) {
                            angular.forEach($scope.videoInstance.threads, function(thread, key) {    
                                if (thread.id == newThread.hidden_by_id) {
                                    thread.has_hidden_siblings = true;
                                }
                            });
                        }
                        
                        $scope.videoInstance.threads.push(newThread);
                        changed = true;
                    }

                    if (changed) {
                        $scope.videoInstance.threads = $filter('orderBy')($scope.videoInstance.threads, 'time', true);
                        $scope.timeOrderedThreads = $filter('orderBy')($scope.videoInstance.threads, 'time');
                        safeApply($scope);
                    }
                };

                var addNewReply = function(newReply) {
                    var changed = false;
                    angular.forEach($scope.videoInstance.threads, function(thread, key) {
                        if (thread.id == newReply.parent_id) {
                            thread.replies.push(newReply);
                            thread.has_replies = true;
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
                    if ($scope.videoInstance.is_authenticated) {
                        socket.send_json({
                            eventType: eventTypes.addToLibrary, 
                            channel: SOCK.user_channel, 
                            data: { 
                                username: $scope.videoInstance.user.username
                            }
                        });
                    }
                    else {
                        notificationFactory.error('Please log in first!');
                    } 
                });

                $scope.$on('player_muteconvo', function() {
                    $scope.isCollapsed = true;
                    safeApply($scope);
                });

                $scope.$on('player_unmuteconvo', function() {
                    $scope.isCollapsed = false;
                    safeApply($scope);
                });

                $scope.$on('player_playing', function() {
                    if (!$state.is('player.loginView') && 
                        !$state.is('player.signupView') && 
                        !$state.is('player.blendedView')) {
                        $state.transitionTo('player.blendedView');
                    }

                    $scope.playing = true;
                    $scope.paused = false;
                    safeApply($scope);
                
                    if ($scope.videoInstance.is_authenticated) {
                        socket.send_json({
                            eventType: eventTypes.playerAction, 
                            channel: SOCK.user_channel, 
                            data: { 
                                action: 'player_playing',
                                username: $scope.videoInstance.user.username,
                                time: $scope.currentTime
                            }
                        });
                    } 
                });

                $scope.$on('player_paused', function() {
                    if ($state.is('player.blendedView')) {
                        if ($scope.videoInstance.threads.length > 0) {
                            $scope.setSelectedThread();
                        }
                        else {
                            $state.transitionTo('player.activeView.thread',  { threadId: 0 });
                        }
                    }

                    $scope.playing = false;
                    $scope.paused = true;
                    safeApply($scope);

                    if ($scope.videoInstance.is_authenticated) {
                        socket.send_json({
                            eventType: eventTypes.playerAction, 
                            channel: SOCK.user_channel, 
                            data: { 
                                action: 'player_paused',
                                username: $scope.videoInstance.user.username,
                                time: $scope.currentTime
                            }
                        });
                    }
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
                        $scope.timeOrderedThreads = $filter('orderBy')($scope.videoInstance.threads, 'time');
                        safeApply($scope);

                        if ($rootScope.selectedThreadId !== undefined ) {
                            var thread = getThreadById($rootScope.selectedThreadId);
                            window.setTimeout(function() {
                                $scope.setSelectedThreadAndTime(thread);
                                $scope.player.pause();
                            }, 1500);
                        }
                        else {
                            $state.transitionTo('player.blendedView');
                        }

                        if ($scope.videoInstance.is_authenticated) {
                            var className = $scope.videoInstance.user.video_in_library ? 'added' : 'removed';
                            broadcaster.prepForBroadcast({ broadcastType: 'library_toggle_complete', className: className });
                        }
                    }
                    else if (jsonData.eventType == eventTypes.postNewComment) {
                        $scope.videoInstance.heatmap = jsonData.data.heatmap;
                        safeApply($scope);

                        if (jsonData.data.thread !== undefined) {
                            var newThread = jsonData.data.thread;
                            addNewThread(newThread);

                            $scope.clearFocus = false;
                            $scope.updateSlider = true;
                            safeApply($scope);
                        }
                        
                        if (jsonData.data.reply !== undefined) {
                            var newReply = jsonData.data.reply;
                            addNewReply(newReply);
                        }
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

                        $scope.player.pause();
                        
                        if (!$state.is('player.userProfileView')) {
                            $state.transitionTo('player.userProfileView', { username: $scope.userProfile.user.username });
                        }
                    }
                    else if (jsonData.eventType == eventTypes.addToLibrary) {
                        notificationFactory.success(jsonData.data.message);

                        $scope.videoInstance.user = jsonData.data.user;
                        safeApply($scope);

                        var className = $scope.videoInstance.user.video_in_library ? 'added' : 'removed';
                        broadcaster.prepForBroadcast({ broadcastType: 'library_toggle_complete', className: className });
                    }
                    else if (jsonData.eventType == eventTypes.notification) {
                        notificationFactory.info(jsonData.data.message);
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