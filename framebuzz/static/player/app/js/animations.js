'use strict';

angular.module('framebuzz.animations', [])
    .animation('animate-comment-show', function($rootScope) {
        return {
            setup: function(element) {
                element.addClass('animated fadeInDown');
            },
            start: function(element, done, memo) {
                window.setTimeout(function() {
                    element.removeClass('animated fadeInDown');
                }, 1000);
            }
        };
    });