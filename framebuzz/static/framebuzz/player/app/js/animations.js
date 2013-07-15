'use strict';

angular.module('framebuzz.animations', [])
    .animation('animate-comment-show', function($rootScope) {
        return {
            setup: function(element) {
                $(element).css('display', 'none');
            },
            start: function(element, done, memo) {
                var $this = $(element);
                    var position = $this.css('position');
                    $this.show();
                    $this.css({ position: 'absolute', visibility: 'hidden' });

                    var height = $this.height();
                    $this.css({ position: position, visibility: 'visible', overflow: 'hidden', height: 0 });
                    $this.animate({ height: height }, { duration: 500, easing: 'Power1.easeIn'});
            }
        };
    });