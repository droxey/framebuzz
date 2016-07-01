var submitButton = $('#btn-upload-video');
var titleField = $('#id_title');

$(function() {
    var videoUrl = null,
        fbzPlayer = $('iframe.fbzplayer');

    // Set up auto-copy for video embed codes.
    var clipboard = new Clipboard('a.copy-embed', {
        text: function(trigger) {
            var element = $(trigger);
            var textarea = element.next('textarea');
            return textarea.val();
        }
    });

    clipboard.on('success', function(e) {
        $.growl.notice({ message: "Embed tag copied to clipboard." });
    });

    // Handle video pagination.
    $('div.pagination-page').on('click', 'a.page-link', function() {
      var pageContainer = $('div.pagination-page');
      var pageUrl = $(this).attr('href');

      $.get(pageUrl, function(pageHtml) {
        pageContainer.fadeOut('fast', function() {
          pageContainer.html(pageHtml);
          pageContainer.fadeIn('fast');
        });
      });

      return false;
    });

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

    // Async submit selected video to Tumblr.
    $(document).on('click', 'a.post-on-tumblr', function(e) {
        e.preventDefault();

        var url = $(this).attr('href');
        $.get(url, function(responseCode) {
            if (responseCode == '200') {
                $.growl.notice({ message: "Video posted to Tumblr!" });
            }
        });
        return false;
    });

    // When the user chooses to play a video, save the url and then
    // pop up the player in a modal dialog.
    $(document).on('click', 'a.play-video', function() {
        videoUrl = $(this).attr('data-video-url');
    });

    // Request our player template when the modal dialog opens.
    $(document).on('opened', '.remodal', function () {
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
