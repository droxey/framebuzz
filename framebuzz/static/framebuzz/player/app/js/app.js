'use strict';


// Declare app level module which depends on filters, and services
angular.module('framebuzz', ['framebuzz.filters', 'framebuzz.services', 'framebuzz.directives', 'framebuzz.animations', 'framebuzz.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'VideoPlayerCtrl'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'VideoPlayerCtrl'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
