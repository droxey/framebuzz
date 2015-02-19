$(function() {
    var uploadType = null,
        uploading = false;

    filepicker.setKey('AXQRyfZ2cQjWD3yy2flkFz');

    var resetForm = function() {
        $('#id_fpname').val('');
        $('#id_fpfile').val('');
        $('#id_title').val('');
        $('#id_description').val('');
        $('#id_video_id').attr('placeholder', 'Paste a YouTube URL to post a video...');
        $('input, textarea').placeholder();
        $('input').removeClass('error');
        $('#upload-video div.upload-choices div.dmbox').removeClass('selected');
        $('#add-video-form').addClass('hidden');
        $('#upload-video-form').addClass('hidden');
    };

    function youtube_parser(url){
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      var match = url.match(regExp);
      if (match&&match[7].length==11){
          return match[7];
      } else{
          $('#id_video_id').addClass('error');
          $('#id_video_id').val('');
          $('#id_video_id').attr('placeholder', "This doesn't seem to be a YouTube URL! Please try again.");
      }
    }

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
            }

            if (newIndex == 0 && currentIndex == 1) {
                // Someone hit the 'Previous button'
                resetForm();
            }

            return canProceed;
        },
        onStepChanged: function(event, currentIndex, priorIndex) {
            // Add placeholder text for forms.
            $('input, textarea').placeholder();

            if (priorIndex == 0 && currentIndex == 1) {
                if (uploadType != 'youtube') {
                    $('#add-video-form').addClass('hidden');
                    $('#upload-video-form').removeClass('hidden');
                }
                else {
                    $('#upload-video-form').addClass('hidden');
                    $('#add-video-form').removeClass('hidden');
                }
            }
        },
        onFinishing: function (event, currentIndex) {
            var isValid = true;
            var dropPaneDiv = $('#upload-drop-pane > div > div');

            if (uploadType != 'youtube') {
                if ($('#id_title').val().length == 0) {
                    $('#id_title').addClass('error');
                    $('#id_title').attr('placeholder', 'Please enter a title for the uploaded video.');

                    isValid = false;
                }
                else {
                    $('#id_title').removeClass('error');
                }

                if ($('#id_fpfile').val().length == 0) {
                    dropPaneDiv.addClass('error');
                    dropPaneDiv.text('Please upload a file!');

                    isValid = false;
                }
                else {
                    dropPaneDiv.removeClass('error');
                }
            }

            return isValid;
        },
        onFinished: function(event, currentIndex) {
            if (uploadType != 'youtube') {
                $('#upload-video-form').trigger('submit');
            }
            else {
                $('#add-video-form').trigger('submit');
            }
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

    // Upload Video submit button.
    $('body').on('submit', '#upload-video-form', function(e) {
      e.preventDefault();

      var url = $(this).attr('action');
      var data = $(this).serialize();

      $.post(url, data, function(response) {
        window.location.reload();
      });

      return false;
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
