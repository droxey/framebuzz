'use strict';


// Declare app level module which depends on filters, and services
angular.module('framebuzz', ['ui.state', 'framebuzz.filters', 'framebuzz.services', 'framebuzz.directives', 'framebuzz.animations', 'framebuzz.controllers']).
    config(['$routeProvider', '$stateProvider', '$urlRouterProvider', 
        function($routeProvider, $stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');

            var templateRootPath = SOCK.root_path + 'partials/';

            var player = { 
                name: 'player',
                url: '/',
                templateUrl: templateRootPath + 'player.html',
                controller: 'VideoPlayerCtrl'
            };

            var playerBlendedView = { 
                name: 'player.blendedView',
                parent: player,
                templateUrl: templateRootPath + 'player.blendedView.html',
                url: 'blended'
                
            };

            $stateProvider
                .state(player)
                .state(playerBlendedView);
        }
    ]).run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $state.transitionTo('player');
    }]);
