'use strict';

/* Services */

SockJS.prototype.send_json = function(data) {
  this.send(JSON.stringify(data));
};

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('framebuzz.services', [])
    .value('version', '0.1')
    .service('socket', function($rootScope) {
        var createSocket = function () {
            var reconnect = true;
            var socket = new SockJS('http://' + SOCK.host + ':' + SOCK.port + '/' + SOCK.channel, '', {
                'debug': true
            });
 
            socket.onopen = function() {
                console.log(SockJS);
                if (socket.readyState !== SockJS.OPEN) {
                  throw "Connection NOT open.";
                }

                var args = arguments;
                $rootScope.$apply(function() {
                    self.socket_handlers.onopen.apply(socket, args);
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
 
        var methods = { 
            onopen: function (callback) {
                self.socket_handlers.onopen = callback;
            }, 
            onmessage: function (callback) {
                self.socket_handlers.onmessage = callback;
            },
            onclose: function (callback) {
                self.socket_handlers.onclose = callback;
            }
        };

        var socket = createSocket();
        return methods;
    });