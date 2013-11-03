$(function() {
    $.vegas({
        src: '/static/framebuzz/marketing/img/background.jpg'
    });
    
    $.vegas('overlay', {
        src:'/static/framebuzz/marketing/vendor/jquery/vegas/overlays/04.png'
    });

    $.get('/accounts/login/', function(html) {
        $('#login-container').html(html);
    });
});