$(function() {
    var background = $('#background'),
        windowHeight = $(window).height();

    background.css({'height': (windowHeight - 50) + 'px'});
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
});
