$(document).ready(function() {
    $('video').mediaelementplayer({
        features: [],
        alwaysShowControls: false,
        enableKeyboard: false,
        enablePluginSmoothing: true,
        autosizeProgress: false,
        defaultVideoWidth: 610,
        defaultVideoHeight: 306,
        success: function(media) {
            $('.mejs-controls').remove();
            $('.mejs-video').css({ height: '306px', width: '610px' });
            $('video').css({ height: '306px', width: '610px' });
            $('.mejs-overlay-button').append('<button type="button" class="btn btn-lg btn-info">Get Started</button>');
        }
    });
});