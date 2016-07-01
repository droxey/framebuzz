var submitButton = $('#btn-upload-video');
var titleField = $('#id_title');


$(function() {
    // Lazy load video images.
    $('.lazy-load').lazyLoadXT();
    
    // Launches the Tumblr OAuth popup.
    $(document).on('click', 'a.tumblr-login-link', function(e) {
        var url = $(this).attr('href');
        var newWindow = window.open(url,'frameBuzzSSOLoginWindow','toolbar=0,resizable=0,status=0,width=640,height=528');
        if (window.focus) { newWindow.focus(); }
        return false;
    });

    // Disable upload form submit button after first submit event.
    $(document).on('submit', '#upload-video-form', function(e) {
        submitButton.val('Uploading...');
        submitButton.attr('disabled', '');
    });
});


// Callback that gets fired when a video is fully uploaded.
// Wired up in tumblr/forms.py
var fileUploadComplete = function(event) {
    // Enable the submit button once a video is uploaded.
    submitButton.removeAttr('disabled');
    // If video title is still empty after upload, give it a default.
    if (titleField.val().length == 0 && event.fpfile !== undefined) {
        titleField.val(event.fpfile.filename);
    }
};

// Callback that gets fired when a video removed from the uploader.
var deleteButtonClicked = function() {
    titleField.val('');
    submitButton.val('Upload Video');
    submitButton.attr('disabled', '');
};
