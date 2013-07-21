'use strict';

angular.module('framebuzz.animations', [])
    .animation('animate-comment-show', function($rootScope) {
        return {
            setup: function(element) {
                
            },
            start: function(element, done, memo) {
                if (!$('a.panel-close').is(':visible')) {
                    $('a.panel-close').show();
                }
            }
        };
    });