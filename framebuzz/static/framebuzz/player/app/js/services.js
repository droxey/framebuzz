'use strict';

/* Services */

angular.module('framebuzz.services', [])
    .value('version', '0.1')
    .service('socket', function($rootScope) {
        var createSocket = function () {
            var reconnect = true;
            var socket = new SockJS('http://' + SOCK.host + ':' + SOCK.port + '/' + SOCK.channel, '', {
                'debug': true
            });

            socket.onopen = function() {
                if (socket.readyState !== SockJS.OPEN) {
                  console.log("Connection NOT open.");
                }

                var args = arguments;
                $rootScope.$apply(function() {
                    self.socket_handlers.onopen.apply(socket, args);
                });
            };

            socket.onsent = function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    self.socket_handlers.onsent.apply(socket, args);
                });
            };

            socket.onmessage = function(data) {
                var args = arguments;
                $rootScope.$apply(function() {
                    self.socket_handlers.onmessage.apply(socket, args);
                });
            };

            socket.onclose = function() {
                if (reconnect) { createSocket(); }

                var args = arguments;
                $rootScope.$apply(function() {
                    self.socket_handlers.onclose.apply(socket, args);
                });
            };
 
            return socket;
        };
 
        self.socket_handlers = {};
        var socket = createSocket();
 
        var methods = { 
            onopen: function(callback) {
                self.socket_handlers.onopen = callback;
            }, 
            onmessage: function(callback) {
                self.socket_handlers.onmessage = callback;
            },
            send_json: function(data) {
                socket.send(JSON.stringify(data));
                self.socket_handlers.onsent();
            },
            onsent: function(callback) {
                self.socket_handlers.onsent = callback;
            },
            onclose: function(callback) {
                self.socket_handlers.onclose = callback;
            }
        };

        return methods;
    }).service('timeUpdate', function($rootScope) {
        var broadcaster = {};

        broadcaster.message = '';

        broadcaster.prepForBroadcast = function(msg) {
            this.message = msg;
            this.broadcastItem();
        };

        broadcaster.broadcastItem = function() {
            $rootScope.$broadcast('timeUpdate');
        };

        return broadcaster;
    })
    .factory('safeApply', function($rootScope) {
        return function($scope, fn) {
            var phase = $scope.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if (fn) {
                    $scope.$eval(fn);
                }
            } else {
                if (fn) {
                    $scope.$apply(fn);
                } else {
                    $scope.$apply();
                }
            }
        }
    });