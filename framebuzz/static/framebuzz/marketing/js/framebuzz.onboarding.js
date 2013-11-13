$(document).ready(function() {
    $('video').mediaelementplayer({
        features: [],
        alwaysShowControls: false,
        enableKeyboard: false,
        enablePluginSmoothing: true,
        autosizeProgress: false,
        defaultVideoWidth: 610,
        defaultVideoHeight: 306,
        enablePseudoStreaming: true,
        pluginPath: '/static/framebuzz/player/app/swf/',
        flashName: 'flashmediaelement.swf',
        silverlightName: 'silverlightmediaelement.xap',
        pseudoStreamingStartQueryParam: '',
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
                var step2 = $('div.step2');

                step2.show('fast', function() {
                    $('#prompt-form').submit(function(ev) {
                        ev.preventDefault();

                        var text = $('input[type="text"]', $(this)).val();
                        if (text.length > 0) {
                            step2.hide('fast', function() {
                                var step3 = $('div.step3');

                                step3.show('fast', function() {
                                    $('#comment-text').text(text);

                                    $('#btn-signup').click(function() {
                                        $('div.bubble-confirm', step3).hide('fast', function() {
                                            var step4 = $('div.step4');
                                            step4.show('fast', function() {

                                            });
                                        });
                                    });
                                });
                            });
                        }
                        else {
                            // TODO: Validation.
                        }

                        return false;
                    });
                });
            });
        }
    });
});