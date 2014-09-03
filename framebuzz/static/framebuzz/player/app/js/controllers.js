'use strict';

/* Controllers */

angular.module('framebuzz.controllers', [])
  .controller('VideoPlayerCtrl',
        ['$rootScope', '$scope', '$state', '$filter', '$http', 'socket', 'broadcaster', 'safeApply', 'notificationFactory', 'localStorageService',
            function($rootScope, $scope, $state, $filter, $http, socket, broadcaster, safeApply, notificationFactory, localStorageService) {
                $scope.rootPath = SOCK.root_path;
                $scope.videoInstance = {};
                $scope.videoInstance.is_authenticated = SOCK.is_authenticated;
                $scope.currentTime = 0;
                $scope.currentTimeHMS = '00:00';
                $scope.newThread = {};
                $scope.sessionKey = SOCK.private_session_key;
                $scope.newReply = {};
                $scope.selectedThread = null;
                $scope.clearFocus = false;
                $scope.isCollapsed = false;
                $scope.updateSlider = false;
                $scope.activeViewTitle = '';
                $scope.requiresLogin = false;

                $scope.loginModel = {};
                $scope.signupModel = {};
                $scope.formSubmitted = false;
                $scope.enterPasswordModel = {};
                $scope.formErrors = '';
                $scope.loginUrls = SOCK.login_urls;

                $scope.replyClicked = false;
                $scope.replyThread = {};

                $scope.userProfile = {};
                $scope.activities = {};
                $scope.postTime = 0;
                $scope.playing = false;
                $scope.paused = false;
                $scope.timeOrderedThreads = null;
                $scope.selectedThreadSiblings = [];
                $scope.share = {};
                $scope.shareUrl = SOCK.share_url;

                $scope.searchResults = [];
                $scope.invitees = [];
                $scope.inviteeUsernamesOrEmails = [];

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
                    toggleFollow: 'FB_TOGGLE_FOLLOW',
                    startPrivateConvo: 'FB_START_PRIVATE_CONVO',
                    searchUsers: 'FB_SEARCH_USERS',
                    enterPassword: 'FB_ENTER_PASSWORD'
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
                            $scope.formErrors = '';
                            safeApply($scope);

                            if ($state.is('player.loginView') || $state.is('player.signupView')) {
                                if ($scope.newThread.comment !== undefined) {
                                    $scope.postNewThread();
                                }
                                $state.transitionTo('player.blendedView');
                            }   
                        }
                        else {
                            if (data.data.errors['__all__'] !== undefined) {
                                $scope.formErrors = data.data.errors;
                                safeApply($scope);

                                console.log($scope.formErrors);
                            }
                        }
                    })
                    .error(function(data, status, headers, config) {

                    });
                };

                $scope.logout = function() {
                    $http({
                        method: 'POST',
                        url: SOCK.logout_url,
                        data: { 'csrf_token': '' }
                    })
                    .success(function(data, status, headers, config) {
                        if (data.logged_out !== undefined) {
                            $scope.videoInstance.user = {};
                            $scope.videoInstance.is_authenticated = false;
                            safeApply($scope);

                            localStorageService.clearAll();

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
                            $scope.formErrors = '';
                            safeApply($scope);

                            if ($state.is('player.loginView') || $state.is('player.signupView')) {
                                if ($scope.newThread.comment !== undefined) {
                                    $scope.postNewThread();
                                    $state.transitionTo('player.onboardingView');
                                }
                                else {
                                    $state.transitionTo('player.blendedView');
                                }
                            }
                        }
                        else {
                            if (data.data.errors['__all__'] !== undefined) {
                                $scope.formErrors = data.data.errors;
                                safeApply($scope);
                            }
                        }
                    })
                    .error(function(data, status, headers, config) {

                    });
                }

                $scope.enterPassword = function() {
                    if ($scope.enterPasswordModel.password !== undefined) {
                        socket.send_json({
                            eventType: eventTypes.enterPassword,
                            channel: SOCK.user_channel,
                            data: {
                                password: $scope.enterPasswordModel.password,
                                session_key: $scope.sessionKey,
                                video_id: SOCK.video_id
                            }
                        });
                    }
                };

                $scope.initReply = function(thread) {
                    $scope.replyClicked = !$scope.replyClicked;
                    $scope.replyThread = $scope.replyClicked ? thread : null;
                    safeApply($scope);

                    if (!$state.is('player.activeView.thread')) {
                        $scope.setSelectedComment(thread);
                    }
                };

                $scope.postNewThread = function() {
                    var postData = localStorageService.get('fbz_pending_comment');

                    if (postData !== null) {
                        localStorageService.remove('fbz_pending_comment');
                    }
                    else {
                        if ($scope.newThread == null) {
                            return;
                        }

                        var time = $scope.postTime == null
                            ? angular.copy($scope.currentTime)
                            : angular.copy($scope.postTime);

                        var timeTruncated = parseFloat(time.toString().substring(0, 9));
                        postData = {
                            'object_pk': $scope.videoInstance.video.id,
                            'content_type': 'core.video',
                            'time': timeTruncated,
                            'comment': $scope.newThread.comment,
                            'username': $scope.videoInstance.user.username,
                            'session_key': $scope.sessionKey,
                            'video_id': SOCK.video_id
                        };
                    }

                    if ($scope.videoInstance.is_authenticated) {
                        postData.username = $scope.videoInstance.user.username;

                        socket.send_json({
                            eventType: eventTypes.postNewComment,
                            channel: SOCK.video_channel,
                            data: postData
                        });

                        $scope.newThread = {};
                        $scope.clearFocus = true;
                        safeApply($scope);
                    }
                    else {
                        // Show the 'login or signup' screen.
                        // Store the comment for later.
                        localStorageService.set('fbz_pending_comment', postData);

                        $scope.formSubmitted = true;

                        $scope.player.pause();
                        $state.transitionTo('player.loginView');   
                    }
                };

                $scope.postNewReply = function() {
                    var postData = {
                        'object_pk': $scope.videoInstance.video.id,
                        'content_type': 'core.video',
                        'time': 0.000,
                        'comment': $scope.newReply.comment,
                        'parent': $scope.replyThread.id,
                        'username': $scope.videoInstance.user.username,
                        'session_key': $scope.sessionKey,
                        'video_id': SOCK.video_id
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
                            username: $scope.videoInstance.user.username,
                            session_key: $scope.sessionKey,
                            video_id: SOCK.video_id
                        }
                    });
                };

                $scope.closeLoginScreen = function() {
                    $scope.newThread = {};
                    $scope.formSubmitted = false;
                    safeApply($scope);
                    
                    $state.transitionTo('player.blendedView');
                };

                $scope.setPostTime = function() {
                    $scope.postTime = angular.copy($scope.currentTime);
                    $scope.postTimeHMS = mejs.Utility.secondsToTimeCode($scope.postTime);
                    safeApply($scope);
                };

                $scope.setSelectedThread = function(thread) {
                    var filteredList = [];

                    if (thread === null || thread === undefined) {
                        thread = getNextThreadInTimeline();
                    }

                    if (thread != null) {
                        var time = parseInt(thread.time, 10);

                        angular.forEach($scope.videoInstance.threads, function(obj, key) {
                            if (parseInt(obj.time, 10) == time) {
                                filteredList.push(obj);
                            }
                        });

                        $scope.selectedThreadSiblings = filteredList;
                        $scope.activeViewTitle = "Comments at " + thread.time_hms;
                        safeApply($scope);

                        $state.transitionTo('player.activeView.siblings', { threadId: thread.id });
                        $scope.player.pause();
                    }
                };

                $scope.setSelectedComment = function(thread) {
                    var index = -1;

                    if (thread != null) {
                        index = $scope.timeOrderedThreads.indexOf(thread);

                        $state.transitionTo('player.activeView.thread', { threadId: thread.id });
                        $scope.selectedCommentIndex = index;
                        $scope.selectedComment = thread;
                        $scope.activeViewTitle = thread.user.display_name + "'s Comment";
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
                            username: $scope.videoInstance.user.username,
                            session_key: $scope.sessionKey,
                            video_id: SOCK.video_id
                        }
                    });
                };

                $scope.getUserProfile = function(username) {
                    // temporary!
                    return;
                    
                    if (username === undefined) {
                        username = $scope.videoInstance.user.username;
                    }

                    socket.send_json({
                        eventType: eventTypes.getUserProfile,
                        channel: SOCK.user_channel,
                        data: {
                            username: username,
                            session_key: $scope.sessionKey,
                            video_id: SOCK.video_id
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
                        'session_key': $scope.sessionKey,
                        'video_id': SOCK.video_id
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
                            'session_key': $scope.sessionKey,
                            'video_id': SOCK.video_id
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

                $scope.initPrivateConvo = function() {
                    if ($scope.videoInstance.is_authenticated) {
                        socket.send_json({
                            eventType: eventTypes.startPrivateConvo,
                            channel: SOCK.user_channel,
                            data: {
                                'username': $scope.videoInstance.user.username,
                                'invitees': $scope.inviteeUsernamesOrEmails,
                                'session_key': $scope.sessionKey,
                                'video_id': SOCK.video_id
                            }
                        });
                    }
                    else {
                        notificationFactory.error('Please log in first!');
                    }
                };

                $scope.hasSearchResults = function() {
                    return $scope.searchResults.length > 0;
                };

                $scope.removeInvitee = function(invitee) {
                    var index = $scope.invitees.indexOf(invitee);
                    $scope.invitees.splice(index, 1);
                };

                $scope.addInviteeEmailAddress = function(term) {
                    var invitee = {
                        display_name: term,
                        avatar_url: null
                    };

                    $scope.invitees.unshift(invitee);
                    $scope.inviteeUsernamesOrEmails.unshift(term);
                    safeApply($scope);

                    // TODO: this is bad and you should feel bad. fix it.
                    $('div.menu').hide();
                };

                $scope.initLogin = function() {
                    $scope.requiresLogin = false;
                    safeApply($scope);

                    $state.transitionTo('player.loginView');
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

                        if ($scope.videoInstance.threads !== undefined
                                && $scope.videoInstance.threads.length > 0) {
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
                    angular.forEach($scope.videoInstance.threads, function(thread, key) {
                        if (thread.id == newReply.parent_id) {
                            thread.replies.push(newReply);
                            thread.has_replies = true;
                        }
                    });

                    $scope.replyThread = {};
                    $scope.replyClicked = false;
                    safeApply($scope);
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
                    if ($scope.videoInstance == null || !$scope.videoInstance.is_authenticated) {
                        $scope.requiresLogin = true;
                        safeApply($scope);

                        window.location.hash = '#/player/panel/hello/user/login';
                    }
                    else {
                        socket.send_json({
                            eventType: eventTypes.addToLibrary,
                            channel: SOCK.user_channel,
                            data: {
                                username: $scope.videoInstance.user.username,
                                session_key: $scope.sessionKey,
                                video_id: SOCK.video_id
                            }
                        });
                    }
                });

                $scope.$on('player_startprivateconvo', function() {
                    if ($scope.videoInstance == null || !$scope.videoInstance.is_authenticated) {
                        $scope.requiresLogin = true;
                        safeApply($scope);

                        window.location.hash = '#/player/panel/hello/user/login';
                    }
                    else {
                        window.location.hash = '#/player/panel/private';
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
                    if ($state.is('player.enterPasswordView')) {
                        return;
                    }

                    if (!$state.is('player.blendedView')) {
                        $state.transitionTo('player.blendedView');
                    }

                    $scope.playing = true;
                    $scope.paused = false;
                    safeApply($scope);

                    socket.send_json({
                        eventType: eventTypes.playerAction,
                        channel: SOCK.user_channel,
                        data: {
                            action: 'player_playing',
                            username: SOCK.username,
                            time: $scope.currentTime,
                            session_key: $scope.sessionKey,
                            video_id: SOCK.video_id
                        }
                    });
                });

                $scope.$on('player_paused', function() {
                    $scope.playing = false;
                    $scope.paused = true;
                    safeApply($scope);

                    socket.send_json({
                        eventType: eventTypes.playerAction,
                        channel: SOCK.user_channel,
                        data: {
                            action: 'player_paused',
                            username: SOCK.username,
                            time: $scope.currentTime,
                            session_key: $scope.sessionKey,
                            video_id: SOCK.video_id
                        }
                    });
                });

                $scope.$on('player_searchusers', function() {
                    var term = broadcaster.message.term;

                    if ($scope.videoInstance.is_authenticated) {
                        if (term.length > 1) {
                            socket.send_json({
                                eventType: eventTypes.searchUsers,
                                channel: SOCK.user_channel,
                                data: {
                                    'term': term,
                                    'selected_users': $scope.inviteeUsernamesOrEmails,
                                    'username': $scope.videoInstance.user.username,
                                    'session_key': $scope.sessionKey,
                                    'video_id': SOCK.video_id
                                }
                            });
                        }
                        else {
                            $scope.searchResults = [];
                            safeApply($scope);
                            broadcaster.prepForBroadcast({ broadcastType: 'user_search_complete', data: $scope.searchResults });
                        }
                    }
                    else {
                        notificationFactory.error('Please log in first!');
                    }
                });

                $scope.$on('player_addinvitee', function() {
                    var broadcastObject = broadcaster.message.invitee;

                    $scope.inviteeUsernamesOrEmails.unshift(broadcastObject.username);
                    $scope.invitees.unshift(broadcastObject);
                    safeApply($scope);
                });

                // --
                // EVENT HANDLERS
                // --

                socket.onopen(function() {
                    socket.send_json({
                        eventType: eventTypes.initVideo,
                        channel: SOCK.video_channel,
                        data: {
                            'session_key': $scope.sessionKey,
                            'video_id': SOCK.video_id
                        }
                    });
                });

                socket.onmessage(function(e) {
                    var jsonData = JSON.parse(e.data);

                    if (jsonData.eventType == eventTypes.initVideo) {
                        $scope.videoInstance = jsonData.data;
                        $scope.timeOrderedThreads = $filter('orderBy')($scope.videoInstance.threads, 'time');
                        safeApply($scope);

                        var loginButtonClicked = localStorageService.get('loggingIn') === 'true';
                        if (loginButtonClicked) {
                            $scope.postNewThread();
                            localStorageService.remove('loggingIn');
                        }

                        if ($rootScope.selectedThreadId !== undefined ) {
                            var thread = getThreadById($rootScope.selectedThreadId);
                            window.setTimeout(function() {
                                $scope.setSelectedThreadAndTime(thread);
                                $scope.player.pause();
                            }, 1500);
                        }
                        else {
                            if ($scope.videoInstance.video.password_required) {
                                $state.transitionTo('player.enterPasswordView');
                                $('.mejs-overlay-button').parent().hide();
                            }
                            else {
                                $state.transitionTo('player.blendedView');
                            }
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

                        var action = jsonData.data.action;
                        if (action.indexOf('follow') !== -1) {
                            var followData = {
                                'username': jsonData.data.thread.user.username,
                                'action': jsonData.data.action
                            };
                            // todo... mark every thread/reply by user as 'followed/unfollowed'
                        }
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
                    else if (jsonData.eventType == eventTypes.startPrivateConvo) {
                        var url = 'http://' + jsonData.data.convo_url;
                        broadcaster.prepForBroadcast({ broadcastType: 'private_convo_started', data: url });
                    }
                    else if (jsonData.eventType == eventTypes.searchUsers) {
                        $scope.searchResults = jsonData.data.users;
                        safeApply($scope);
                        broadcaster.prepForBroadcast({ broadcastType: 'user_search_complete', data: $scope.searchResults });
                    }
                    else if (jsonData.eventType == eventTypes.enterPassword) {
                        if (jsonData.data.success) {
                            $('#password-required-error').addClass('hidden');
                            $('#id_password_required').addClass('ng-invalid');
                            $('.mejs-overlay-button').parent().show();

                            $state.transitionTo('player.blendedView');
                        }
                        else {
                            $('#id_password_required').addClass('error');
                            $('#password-required-error').removeClass('hidden');
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
                    $state.transitionTo('player.initView');
                });
            }
        ]
    );
