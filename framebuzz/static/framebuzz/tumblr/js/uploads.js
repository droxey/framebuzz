$(function() {
	$(document).on('click', 'a#btn-login', function(e) {
		var target = $('#uploader');
		$.smoothScroll({ scrollElement: null, scrollTarget: target });
	    return false;
	});

    $(document).on('click', 'a#tumblr-login-link', function(e) {
        var url = $(this).attr('href');
        var newWindow = window.open(url,'frameBuzzSSOLoginWindow','toolbar=0,resizable=0,status=0,width=640,height=528');
        if (window.focus) { newWindow.focus(); }
        return false;
    });
});
