'use strict';

angular.module('framebuzz.animations', [])
    .animation('animate-comment-show', function($rootScope) {
        return {
            setup: function(element) {
                
            },
            start: function(element, done, memo) {
                $(element).show();
                //var position = $(element).css('position');
                //$(element).css({ position: 'absolute', visibility: 'hidden' }).show();

                //console.log($(element).height());
                //$this.css({ position: position, visibility: 'visible', overflow: 'hidden', height: 0 });
            }
        };
    });