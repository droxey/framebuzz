$(function() {
    var background = $('#background');
    background.backstretch("/static/framebuzz/marketing/img/cover.jpg", {
        centeredY: false,
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
