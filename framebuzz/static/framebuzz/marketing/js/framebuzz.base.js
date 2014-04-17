$(function() {
    var isHome = $('body').hasClass('homepage');
    var imgUrl = isHome ? '/static/framebuzz/marketing/img/cover.jpg'
                        : '/static/framebuzz/marketing/img/background.jpg';

    $.vegas({
        src: imgUrl
    });

    if (!isHome) {
        $.vegas('overlay', {
            src:'/static/framebuzz/marketing/vendor/jquery/vegas/overlays/04.png'
        });
    }
});
