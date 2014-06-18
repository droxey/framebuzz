'use strict';


// Declare app level module which depends on filters, and services
angular.module('framebuzz',
    [
        'truncate',
        'fbExceptions',
        'ngCookies',
        'ngSanitize',
        'ui.state',
        'ui.bootstrap',
        'LocalStorageModule',
        'framebuzz.filters',
        'framebuzz.services',
        'framebuzz.directives',
        'framebuzz.animations',
        'framebuzz.controllers'
    ])
    .config(['$routeProvider', '$stateProvider', '$urlRouterProvider', 'localStorageServiceProvider',
        function($routeProvider, $stateProvider, $urlRouterProvider, localStorageServiceProvider) {
            $urlRouterProvider.otherwise('/');

            localStorageServiceProvider.setPrefix('fbz');

            var templateRootPath = SOCK.root_path + 'partials/';

            var player = {
                name: 'player',
                abstract: true,
                controller: 'VideoPlayerCtrl',
                template: '<div data-ui-view></div>'
            };

            var playerInitView = {
                name: 'player.initView',
                parent: player,
                templateUrl: templateRootPath + 'player.html',
                url: '/player'
            };

            var playerPanelView = {
                name: 'player.panelView',
                parent: playerInitView,
                templateUrl: templateRootPath + 'player.panelView.html',
                url: '/panel',
                data: {
                    panelId: 'panel-view'
                }
            };

            var playerShareView = {
                name: 'player.share',
                parent: playerPanelView,
                templateUrl: templateRootPath + 'player.share.html',
                url: '/share',
                data: {
                    panelId: 'share-view',
                    animation: 'share'
                }
            };

            var playerLoginOrSignupView = {
                name: 'player.loginOrSignupView',
                parent: playerPanelView,
                templateUrl: templateRootPath + 'player.loginOrSignup.html',
                url: '/hello',
                data: {
                    panelId: 'share-view',
                    animation: 'share'
                }
            };

            var playerEnterPasswordView = {
                name: 'player.enterPasswordView',
                parent: playerPanelView,
                templateUrl: templateRootPath + 'player.enterPassword.html',
                url: '/password',
                data: {
                    panelId: 'enter-password-wrapper',
                    animation: 'share'
                }
            };

            var playerStartPrivateConvoView = {
                name: 'player.startPrivateConvo',
                parent: playerPanelView,
                templateUrl: templateRootPath + 'player.startPrivateConvo.html',
                url: '/share/private',
                data: {
                    panelId: 'share-view',
                    animation: 'panel'
                }
            };

            var playerBlendedView = {
                name: 'player.blendedView',
                parent: playerPanelView,
                templateUrl: templateRootPath + 'player.blendedView.html',
                url: '/blended',
                data: {
                    panelId: 'blended-view'
                }
            };

            var playerActiveView = {
                name: 'player.activeView',
                parent: playerPanelView,
                templateUrl: templateRootPath + 'player.activeView.html',
                url: '/active',
                data: {
                    panelId: 'active-view'
                }
            };

            var userProfileView = {
                name: 'player.userProfileView',
                parent: playerActiveView,
                templateUrl: templateRootPath + 'player.profile.html',
                url: '/profile/:username',
                data: {
                    panelId: 'profile-view'
                }
            };

            var userCommentsView = {
                name: 'player.userProfileView.commentsView',
                parent: userProfileView,
                templateUrl: templateRootPath + 'player.profile.commentsView.html',
                url: '/comments',
                data: {
                    panelId: 'profile-view'
                }
            };

            var userFavoritesView = {
                name: 'player.userProfileView.favoritesView',
                parent: userProfileView,
                templateUrl: templateRootPath + 'player.profile.favoritesView.html',
                url: '/favorites',
                data: {
                    panelId: 'profile-view'
                }
            };

            var userFollowingView = {
                name: 'player.userProfileView.followingView',
                parent: userProfileView,
                templateUrl: templateRootPath + 'player.profile.followingView.html',
                url: '/following',
                data: {
                    panelId: 'profile-view'
                }
            };

            var userFollowersView = {
                name: 'player.userProfileView.followersView',
                parent: userProfileView,
                templateUrl: templateRootPath + 'player.profile.followersView.html',
                url: '/followers',
                data: {
                    panelId: 'profile-view'
                }
            };

            var playerActiveViewComments = {
                name: 'player.activeView.comments',
                parent: playerActiveView,
                templateUrl: templateRootPath + 'player.activeView.comments.html',
                url: '/comments',
                data: {
                    panelId: 'active-view'
                }
            };

            var playerActiveViewActivity = {
                name: 'player.activeView.activity',
                parent: playerActiveView,
                templateUrl: templateRootPath + 'player.activeView.activity.html',
                url: '/activity',
                data: {
                    panelId: 'active-view'
                }
            };

            var playerActiveViewThread = {
                name: 'player.activeView.thread',
                parent: playerActiveViewComments,
                templateUrl: templateRootPath + 'player.activeView.thread.html',
                url: '/:threadId',
                data: {
                    panelId: 'active-view'
                }
            };

            $stateProvider
                .state(player)
                .state(playerInitView)
                .state(playerPanelView)
                .state(playerShareView)
                .state(playerLoginOrSignupView)
                .state(playerEnterPasswordView)
                .state(playerStartPrivateConvoView)
                .state(playerBlendedView)
                .state(playerActiveView)
                .state(userProfileView)
                .state(userCommentsView)
                .state(userFavoritesView)
                .state(userFollowersView)
                .state(userFollowingView)
                .state(playerActiveViewComments)
                .state(playerActiveViewActivity)
                .state(playerActiveViewThread);
        }
    ]).run(
        [
            '$rootScope',
            '$state',
            '$stateParams',
            '$cookies',
            '$http',
            function($rootScope, $state, $stateParams, $cookies, $http) {
                // attach django's CSRF token to sent data
                $http.defaults.headers.post['X-CSRFToken'] = $cookies['csrftoken'];

                if (document.location.hash.indexOf('comments') != -1) {
                    var threadId = document.location.hash.split("/")[5];
                    $rootScope.selectedThreadId = parseInt(threadId);
                }

                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
                $state.transitionTo('player.panelView');
            }
        ]
    );
