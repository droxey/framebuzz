$(function() {
    var isHome = $('body').hasClass('homepage');
    if (!isHome) {
        $.vegas({
            src: '/static/framebuzz/marketing/img/background.jpg'
        });

        $.vegas('overlay', {
            src:'/static/framebuzz/marketing/vendor/jquery/vegas/overlays/04.png'
        });
    }
});
