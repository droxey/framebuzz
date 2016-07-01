var submitButton = $('#btn-upload-video');
var titleField = $('#id_title');


$(function() {
    var videoUrl = null,
        fbzPlayer = $('iframe.fbzplayer');

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

    // When the user chooses to play a video, save the url and then
    // pop up the player in a modal dialog.
    $(document).on('click', 'a.play-video', function() {
        videoUrl = $(this).attr('data-video-url');
        console.log(videoUrl);
    });

    // Request our player template when the modal dialog opens.
    $(document).on('opened', '.remodal', function () {
        console.log(videoUrl);
        console.log(fbzPlayer);
        fbzPlayer.attr('src', videoUrl);
    });

    // Tear down the player template when the modal dialog closes.
    $(document).on('closing', '.remodal', function (e) {
        fbzPlayer.removeAttr('src');
        videoUrl = null;
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
