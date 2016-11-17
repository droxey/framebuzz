'use strict';

/* Services */

angular.module('framebuzz.services', [])
    .value('version', '0.1')
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
        };
    })
    .service('broadcaster', function($rootScope) {
        var broadcaster = {};
        broadcaster.message = '';

        broadcaster.prepForBroadcast = function(msg) {
            this.message = msg;
            this.broadcastItem();
        };

        broadcaster.broadcastItem = function() {
            $rootScope.$broadcast(this.message.broadcastType);
        };

        return broadcaster;
    })
    .service('socket', ['$rootScope', 'broadcaster', '$log', function($rootScope, broadcaster, $log) {
        $rootScope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        var createSocket = function () {
            var reconnect = true,
                connected = false,
                connectFailedMessage = 'Unable to establish player connection.',
                socket = null,
                debug = SOCK.debug,
                scheme = debug ? 'http://' : 'https://',
                port = SOCK.port,
                url = debug ? scheme + SOCK.host + ':' + port + '/' + SOCK.channel :
                      scheme + SOCK.host + '/' + SOCK.channel;

            socket = new SockJS(url, '', {
                'debug': debug
            });

            socket.onopen = function() {
                connected = socket.readyState !== SockJS.OPEN;

                if (!connected) {
                  $log.error(connectFailedMessage);
                }

                var args = arguments;
                $rootScope.safeApply(function() {
                    self.socket_handlers.onopen.apply(socket, args);
                });
            };

            socket.onsent = function() {
                var args = arguments;
                $rootScope.safeApply(function() {
                    self.socket_handlers.onsent.apply(socket, args);
                });
            };

            socket.onmessage = function(data) {
                var args = arguments;
                $rootScope.safeApply(function() {
                    self.socket_handlers.onmessage.apply(socket, args);
                });
            };

            socket.onclose = function() {
                if (!connected) {
                    $log.error(connectFailedMessage);
                    alert(connectFailedMessage);
                }
                var args = arguments;
                $rootScope.safeApply(function() {
                    self.socket_handlers.onclose.apply(socket, args);
                });
            };

            socket.onerror = function(error) {
                var args = arguments;

                $log.error(error);

                $rootScope.safeApply(function() {
                    self.socket_handlers.onerror.apply(socket, args);
                });
            };

            return socket;
        };

        self.socket_handlers = {};
        var socket = createSocket();

        $rootScope.$on('reconnect', function() {
            socket.close();
        });

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
            },
            onerror: function(callback) {
                self.socket_handlers.onerror = callback;
            },
            close: function() {
                socket.close();
            }
        };

        return methods;
    }])
    .service('Facebook', function($q, $rootScope) {
        // resolving or rejecting a promise from a third-party
        // API such as Facebook must be
        // performed within $apply so that watchers get
        // notified of the change
        var resolve = function(errval, retval, deferred) {
            $rootScope.$apply(function() {
                if (errval) {
                    deferred.reject(errval);
                } else {
                    retval.connected = true;
                    deferred.resolve(retval);
                }
            });
        };

        return {
            getUser: function(FB) {
                var deferred = $q.defer();
                FB.getLoginStatus(function(response) {
                    if (response.status == 'connected') {
                        FB.api('/me', function(response) {
                            resolve(null, response, deferred);
                        });
                    }
                    else if (response.status == 'not_authorized') {
                        FB.login(function(response) {
                            if (response.authResponse) {
                                FB.api('/me', function(response) {
                                    resolve(null, response, deferred);
                                });
                            }
                            else {
                                resolve(response.error, null, deferred);
                            }
                        });
                    }
                });

                promise = deferred.promise;
                promise.connected = false;
                return promise;
            }
        };
    })

    .factory('notificationFactory', function () {
        toastr.options = {
          "debug": false,
          "positionClass": "toast-top-full-width",
          "onclick": null,
          "fadeIn": 300,
          "fadeOut": 300,
          "timeOut": 4100,
          "extendedTimeOut": 300
        };

        return {
            success: function(text) {
                toastr.success(text);
            },
            error: function(text) {
                toastr.error(text);
            },
            info: function(text) {
                toastr.info(text);
            }
        };
    });
