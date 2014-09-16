$(function() {
    var uploadType = null;

    function youtube_parser(url){
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      var match = url.match(regExp);
      if (match&&match[7].length==11){
          return match[7];
      } else{
          $('#id_video_id').val('');
          $('#id_video_id').attr('placeholder', "This doesn't seem to be a YouTube URL! Please try again.");
      }
    }
    // Construct the file picker for Computer and Cloud Uploads.
    var initFilePicker = function() {
        filepicker.setKey('AXQRyfZ2cQjWD3yy2flkFz');
        // var services = uploadType == 'cloud' 
        //     ? ['BOX', 'DROPBOX', 'GOOGLE_DRIVE', 'URL', 'FTP'] :
        //     'COMPUTER';

        // // Start loading the filepicker.io iframe.
        // filepicker.pickAndStore({
        //     container: 'filepicker-iframe',
        //     extensions: ['.3g2', '.3gp', '.3gp2', '.3gpp', '.3gpp2', '.ac3', '.eac3', '.ec3', '.f4a', '.f4b', '.f4v', '.flv', '.highwinds',
        //                  '.m4a', '.m4b', '.m4r', '.m4v', '.mov', '.mp4', '.oga', '.ogv', '.ogx', '.ts', '.webm', '.wma', '.mpg', '.avi'],
        //     folders: false,
        //     services: services
        // }, {}, function(InkBlobs){
        //     // TODO: Fill In form fields and progress to the
        //     // form where details are confirmed.
        //    console.log(InkBlobs);
        // });

        // if (uploadType == 'dragdrop') {
        //     $('#filepicker-iframe').addClass('dragdrop');
        // }
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
                        $('#add-video-form').addClass('hidden');
                        $('#upload-video-form').removeClass('hidden');

                        initFilePicker();
                    }
                    else {
                        $('#upload-video-form').addClass('hidden');
                        $('#add-video-form').removeClass('hidden');
                    }
                }
            }

            if (currentIndex == 1) {
                if (uploadType != 'youtube') {
                    // TODO: validate uploaded files
                }
                else {
                    // TODO: Validate youtube url
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

    // Youtube Video textbox blur event.
    $('body').on('blur', '#id_video_id', function() {
        var url = $(this).val();

        if (url.length > 0) {
            video_id = youtube_parser(url);
        }
    });

    // Youtube Video submit button.
    $('body').on('submit', '#add-video-form', function(e) {
        video_id = youtube_parser($('#id_video_id').val());

        if (video_id !== null) {
            var postUrl = $(this).attr('action');
            var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

            $.post(postUrl, {
                'video_id': video_id, 
                'is_featured': 'false',
                'csrfmiddlewaretoken': csrfToken
            }, function(data, textStatus, jqXHR) {
                window.location.reload();
            });
        }

        return false;
    });
});
