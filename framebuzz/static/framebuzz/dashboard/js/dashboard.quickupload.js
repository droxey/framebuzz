$(function() {
    var uploadType = null;

    // Construct the file picker for Computer and Cloud Uploads.
    var initFilePicker = function() {
        filepicker.setKey('AXQRyfZ2cQjWD3yy2flkFz');
        var services = uploadType == 'cloud' 
            ? ['BOX', 'DROPBOX', 'GOOGLE_DRIVE', 'URL', 'FTP'] :
            'COMPUTER';

        // Start loading the filepicker.io iframe.
        filepicker.pickAndStore({
            container: 'filepicker-iframe',
            extensions: ['.3g2', '.3gp', '.3gp2', '.3gpp', '.3gpp2', '.ac3', '.eac3', '.ec3', '.f4a', '.f4b', '.f4v', '.flv', '.highwinds',
                         '.m4a', '.m4b', '.m4r', '.m4v', '.mov', '.mp4', '.oga', '.ogv', '.ogx', '.ts', '.webm', '.wma', '.mpg', '.avi'],
            folders: false,
            services: services
        }, {}, function(InkBlobs){
            // TODO: Fill In form fields and progress to the
            // form where details are confirmed.
           console.log(InkBlobs);
        });

        if (uploadType == 'dragdrop') {
            $('#filepicker-iframe').addClass('dragdrop');
        }
    };

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
        },
        onStepChanging: function (event, currentIndex, newIndex) {
            var canProceed = true;
            if (currentIndex == 0) { 
                if (uploadType == null) {
                    canProceed = false;
                }
                else {
                    if (uploadType != 'youtube') {
                        initFilePicker();
                    }
                    else {
                        $('#filepicker-iframe').addClass('hidden');
                        $('#add-video-form').removeClass('hidden');
                    }
                }
            }

            if (currentIndex == 1) {
                if (uploadType != 'youtube') {
                    // TODO: validate uploaded files
                }
                else {
                    // TODO: validate youtube url
                }
            }

            return canProceed;
        },
        onStepChanged: function(event, currentIndex, priorIndex) {
            // Add placeholder text for forms.
            $('input, textarea').placeholder();
        }
    });

    // Step 1 - Select an Upload Type.
    $(document).on('click', '#upload-video div.upload-choices div.dmbox', function() {
        var currentChoice = $(this);
        var otherChoices = $('#upload-video div.upload-choices div.dmbox').not(currentChoice);
        uploadType = currentChoice.attr('data-uploadtype');

        otherChoices.removeClass('selected');
        currentChoice.addClass('selected');
    });
});
