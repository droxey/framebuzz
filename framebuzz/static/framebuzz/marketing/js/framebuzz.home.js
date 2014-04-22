$(function() {
    var windowHeight = 500, //$(window).height(),
        background = $('#background');


    background.backstretch("/static/framebuzz/marketing/img/cover.jpg", {
        centeredY: false,
    });
    //background.css({'height': (windowHeight + 50) + 'px'});
    //background.find('div.backstretch').css({'min-height': windowHeight + 'px'});
});
