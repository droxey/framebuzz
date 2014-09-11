$(function() {
    // Set filepicker.io key and drop panes for uploads.
    filepicker.setKey('AXQRyfZ2cQjWD3yy2flkFz');

    // Initialize the Quick Upload wizard.
    $("#wizard").steps({
        headerTag: "h4",
        bodyTag: "section",
        transitionEffect: "slideLeft",
        autoFocus: true,
        enableCancelButton: true,
        enableFinishButton: true,
        saveState: true,
        onInit: function (event, currentIndex) {
            // Add bootstrap styles to the pagination controls.
            var actionsUl = $('#wizard div.actions ul');
            var pageButtons = $('li a', actionsUl);

            actionsUl.addClass('clearfix');
            
            $.each(pageButtons, function(k, v) {
                var target = $(v).attr('href'),
                    hash = target.slice(1),
                    buttonClass = 'btn btn-small ';

                switch(target) {
                    case '#cancel':
                        buttonClass = buttonClass + 'btn-danger';
                        break;
                    case '#finish':
                        buttonClass = buttonClass + 'btn-success';
                        break;
                    default:
                        buttonClass = buttonClass + 'btn-theme';
                        break;
                }

                $(v).addClass(buttonClass);
                $(v).parent().addClass(hash);
            });
        }
    });

    $(document).on('click', '#upload-video div.upload-choices div.dmbox', function() {
        var currentChoice = $(this);
        var otherChoices = $('#upload-video div.upload-choices div.dmbox').not(currentChoice);

        otherChoices.removeClass('selected');
        otherChoices.fadeOut('fast', function() {
            currentChoice.addClass('selected');
        });

        var uploadType = $(this).attr('data-uploadtype');
        console.log(uploadType);
    });
});
