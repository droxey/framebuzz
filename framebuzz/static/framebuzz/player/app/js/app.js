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
            }

            var playerPanelView = {
                name: 'player.panelView',
                parent: playerInitView,
                templateUrl: templateRootPath + 'player.panelView.html',
                url: '/panel'
            }

            var playerActiveView = { 
                name: 'player.activeView',
                parent: playerPanelView,
                templateUrl: templateRootPath + 'player.activeView.html',
                url: '/active'   
            };

            $stateProvider
                .state(player)
                .state(playerInitView)
                .state(playerPanelView)
                .state(playerActiveView);
        }
    ]).run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $state.transitionTo('player.initView');
    }]);
