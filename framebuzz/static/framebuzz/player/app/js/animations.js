'use strict';

angular.module('framebuzz.animations', [])
    .animation('animate-comment-show', function($rootScope) {
        return {
            setup: function(element) {
                element.addClass('slideDown');
            },
            start: function(element, done, memo) {
                element.removeClass('slideDown');
            }
        };
    });