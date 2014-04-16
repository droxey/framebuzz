$(function() {
    if (!$('body').hasClass('homepage')) {
        $.vegas({
            src: '/static/framebuzz/marketing/img/background.jpg'
        });

        $.vegas('overlay', {
            src:'/static/framebuzz/marketing/vendor/jquery/vegas/overlays/04.png'
        });
    }
});
