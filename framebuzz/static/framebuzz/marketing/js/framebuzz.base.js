$(function() {
    var isHome = $('body').hasClass('homepage');
    var isDash = $('body').hasClass('dashboard-login');

    if (!isHome && !isDash) {
        $.vegas({
            src: '/static/framebuzz/marketing/img/background.jpg'
        });

        $.vegas('overlay', {
            src:'/static/framebuzz/marketing/vendor/jquery/vegas/overlays/04.png'
        });
    }

    if (isDash) {
        $('#main').css('background-color', 'white');
        $('body').css('background-color', 'white');
        $('div.box').css('border', '1px solid #ccc');
        $('#logo').remove();
        $('#copyright').remove();
        $('#footer').remove();
    }
});
