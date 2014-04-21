$(function() {
    var windowHeight = $(window).height(),
        background = $('#background');


    background.backstretch("/static/framebuzz/marketing/img/cover.jpg");
    background.css({'min-height': windowHeight + 'px'});
    background.find('div.backstretch').css({'min-height': windowHeight + 'px'});
});
