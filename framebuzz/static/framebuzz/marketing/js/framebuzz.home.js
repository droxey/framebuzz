$(function() {
    $(document).on('click', 'a.read-more', function(e) {
        var hash = $(this).attr('href');
        $.scrollTo(hash, 600, {
            easing:'swing',
            onAfter: function() {
            }
        });
        return false;
    });

    var $stickyHeader = $("#home-floating-search");
    if (!$('body').hasClass('show-header')) {
        $(window).on("scroll load", function() {
            var fromTop = $(document).scrollTop();
            $stickyHeader.toggleClass("sticky", (fromTop > 25));
        });
    }
});
