$(function() {
    var background = $('#background'),
        windowHeight = $(window).height();
        nativeHeight = Modernizr.mq('only screen and (max-width: 600px)');

    if(!nativeHeight) { background.css({'height': windowHeight + 'px'}); }

    background.backstretch("/static/framebuzz/marketing/img/cover.jpg", { fade: 10, centeredY: false });

    $(window).on("backstretch.after", function (e, instance, index) {
        instance.$img.css({'top':''});
    });

    $(document).on('click', 'a.anchor', function(e) {
        var hash = $(this).attr('href');
        $.scrollTo(hash, 600, {
            easing:'swing',
            onAfter: function() {
            }
        });
        return false;
    });

    var $stickyHeader = $("#home-floating-search")
    $(window).on("scroll load", function() {
        var fromTop = $(document).scrollTop();
        $stickyHeader.toggleClass("sticky", (fromTop > 25));
    });

});
