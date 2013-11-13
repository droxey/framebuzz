$(function() {
    $.vegas({
        src: '/static/framebuzz/marketing/img/background.jpg'
    });
    
    $.vegas('overlay', {
        src:'/static/framebuzz/marketing/vendor/jquery/vegas/overlays/04.png'
    });

    $('a.nav-link.avatar img.lazy').lazyload();
});