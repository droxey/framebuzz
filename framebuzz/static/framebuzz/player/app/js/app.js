'use strict';


// Declare app level module which depends on filters, and services
angular.module('framebuzz', ['ui.state', 'framebuzz.filters', 'framebuzz.services', 'framebuzz.directives', 'framebuzz.animations', 'framebuzz.controllers']).
    config(['$routeProvider', '$stateProvider', '$urlRouterProvider', 
        function($routeProvider, $stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');

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

            var loginView = {
                name: 'player.loginView',
                parent: playerPanelView,
                templateUrl: templateRootPath + 'player.login.html',
                url: '/login',
                data: {
                    panelId: 'login-view'
                }
            };

            var signupView = {
                name: 'player.signupView',
                parent: playerPanelView,
                templateUrl: templateRootPath + 'player.signup.html',
                url: '/signup',
                data: {
                    panelId: 'signup-view'
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

            $stateProvider
                .state(player)
                .state(playerInitView)
                .state(playerPanelView)
                .state(loginView)
                .state(signupView)
                .state(playerBlendedView)
                .state(playerActiveView)
                .state(playerActiveViewComments)
                .state(playerActiveViewActivity);
        }
    ]).run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $state.transitionTo('player.initView');
    }]);
