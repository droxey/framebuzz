$(function() {
    // Set filepicker.io key and drop panes for uploads.
    filepicker.setKey('AXQRyfZ2cQjWD3yy2flkFz');

    $(document).on('click', '#upload-video div.upload-choices div.dmbox', function() {
        var otherChoices = $('#upload-video div.upload-choices div.dmbox').not($(this));
        otherChoices.removeClass('selected');
        otherChoices.fadeOut('fast', function() {
            $(this).addClass('selected');
        });

        

        var uploadType = $(this).attr('data-uploadtype');
        console.log(uploadType);
    });
});
