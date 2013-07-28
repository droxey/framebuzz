'use strict';

angular.module('framebuzz.animations', [])
    .animation('animate-comment-show', function($rootScope) {
        return {
            setup: function(element) {
                
            },
            start: function(element, done, memo) {
                element.addClass('slideDown');
                window.setTimeout(function() { element.removeClass('slideDown'); }, 750);
            }
        };
    });