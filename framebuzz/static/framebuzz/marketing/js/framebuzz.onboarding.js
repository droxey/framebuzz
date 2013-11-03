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
            $('.mejs-overlay-button').remove();

            $('.mejs-video').css({ height: '306px', width: '610px' });
            $('video').css({ height: '306px', width: '610px' });

            $('#btn-start').click(function() {
                $('div.step1').hide('fast', function() {
                    media.play();
                });
            });

            media.addEventListener('playing', function(e) {
                $('div.step2').show('fast', function() {

                });
            });
        }
    });
});