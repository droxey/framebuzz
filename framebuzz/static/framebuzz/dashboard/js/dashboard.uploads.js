$(function() {
    var addVideoDiv = $('#upload-video');
        dropPaneDiv = $('#upload-drop-pane > div > div'),
        dropResultDiv = $("#drop-result-bar"),
        uploadBadge = $('#badge_uploads'),
        currentCount = parseInt(uploadBadge.attr('data-upload-count')),
        hasError = false,
        baseUrl = 'https://app.zencoder.com/api/v2/jobs/',
        checkJobsInterval = null,
        finishedUploads = []
        video_id = null;

    var resetForm = function() {
        $('ul.nav-tabs li', addVideoDiv).removeClass('active');
        $('div.tab-content div.tab-pane', addVideoDiv).removeClass('active');

        $('#id_fpname').val('');
        $('#id_fpfile').val('');
        $('#id_title').val('');
        $('#id_description').val('');

        $('input, textarea').placeholder();

        dropPaneDiv.html('<div id="upload-drop-pane" class="col-xs-12">Drag and drop your video files here.<br>Or, <a href="#" id="upload-click-here">click here</a> to upload videos from Dropbox, Google Drive, and more!</div>');
    };

    var progress = function(percent, $element) {
        $element.attr('data-percentage', percent);
        $element.animate({ width: percent + '%' }, 500);

        $element.parent().parent().find('.percent-text').text(percent + '%');

        console.log( $element.find('.percent-text'));
    };

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

    function checkZencoderJobs() {
      // Check status of uploads dynamically if we still have some pending
      // jobs on page refresh.
      if (parseInt(uploadBadge.attr('data-count')) > 0) {
        // Queue the AJAX calls properly.
        var deferreds = [];

        $('ul.uploads-list li').not('.complete').each(function(key, value) {
          //var url = baseUrl + $(this).attr('data-job-id') + '/progress.json?api_key=e9d23782542efd39f402fc40a7b4edaf';
           //test: 
          var url = baseUrl + $(this).attr('data-job-id') + '/progress.json?api_key=75e13910e393a6ccafc1a3272f3a6a48';
          var row = $(this);

          deferreds.push(
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                  var progressBar = row.find('div.progress-bar');
                  var percent = Math.round(parseFloat(data['progress'], 0));

                  if (data['state'] == 'processing') {
                    progress(percent, progressBar); 
                  }
                  else {
                    if (data['state'] == 'finished') {
                      progress(100, progressBar);

                      row.addClass('complete');
                      currentCount = currentCount - 1;

                      row.find('a.video-link').addClass('finished');
                      row.find('i.fa-film').addClass('i.fa-play-circle');
                      row.find('i.fa-film').removeClass('i.fa-film');
                    }
                  }
                },
                error: function(data) {

                }
            })
          );
        });

        // All AJAX calls complete.
        $.when.apply($, deferreds).done(function() {
          $('#badge_upload').text(currentCount);

          if (currentCount == 0 && checkJobsInterval !== null) {
            clearInterval(checkJobsInterval);
          }
        });
      }
    };

    var startJobCheckInterval = function() {
      if (checkJobsInterval === null) {
        checkZencoderJobs();

        checkJobsInterval = setInterval(checkZencoderJobs, 30000);
      }
    };

    // Set filepicker.io key and drop panes for uploads.
    filepicker.setKey('AXQRyfZ2cQjWD3yy2flkFz');

    // Check jobs.
    startJobCheckInterval();

    // Add placeholder text for forms.
    $('input, textarea').placeholder();

    // Update badges.
    $.each($('.badge'), function(k, v) {
      var count = parseInt($(v).text());
      if (count > 0) {
        $(v).addClass('on');
      }
      else {
        $(v).removeClass('on');
      }
    }); 

    // Click tab event.
    $(document).on('click', '#add-video-tabs a[data-toggle="tab"]', function (e) {
      e.preventDefault();

      var newClass = $(this).parent().attr('class'),
          oldTabDiv = $($(this).attr('href')),
          tab = $($(this).attr('href')),
          isActive = tab.hasClass('active');

      $('div.tab-pane', addVideoDiv).removeClass('active');
      $('#add-video-tabs li', addVideoDiv).removeClass('active');
      $('div.tab-pane', addVideoDiv).hide();

      tab.slideDown('fast');
      $(this).parent().addClass('active');
    });

    // Show tab event.
    $(document).on('shown.bs.tab', '#add-video-tabs a[data-toggle="tab"]', function (e) {
      if ($(e.target).attr('href') == '#pending-uploads') {
        $('#uploads-table tr').each(function(key, value) {
          // Update progress bar when the Uploads tab is selected.
          var progressBar = $(this).find('div.progress-bar');
          progress(progressBar.attr('data-percentage'), progressBar);
        });
      }
    });

    $(document).on('click', '#pending-uploads a.video-link', function(e) {
      var link = $(this);
      if (!link.hasClass('finished')) {
        return false;
      }
    });

    // Cancel upload button.
    $('a.cancel-upload', addVideoDiv).click(function() {
      $('ul.nav-tabs li', addVideoDiv).removeClass('active');
      $('div.tab-content div.tab-pane', addVideoDiv).removeClass('active');

      resetForm();

      var tabToHide = $($(this).attr('data-hide-tab'));
      tabToHide.slideUp('fast');
    });

    // Upload Video submit button.
    $('#upload-file-form', addVideoDiv).submit(function(e) {
      e.preventDefault();

      // Simple validation.
      if ($('#id_title').val().length == 0) {
        $('#id_title').addClass('error');
        $('#id_title').attr('placeholder', 'Please enter a title for the uploaded video.');
        hasError = true;
      }
      else {
        $('#id_title').removeClass('error');
      }

      if (hasError) {
        return false;
      }

      var url = $(this).attr('action');
      var data = $(this).serialize();

      $.post(url, data, function(response) {
        $('ul.uploads-list li').remove();
        $('ul.uploads-list').append(response);

        var currentCount = parseInt(uploadBadge.text());
        if (currentCount == 0) {
          uploadBadge.addClass('on');
          uploadBadge.text(1);
        }
        else {
          uploadBadge.text(currentCount + 1);
        }

        resetForm();
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
              console.log(data);
                $.gritter.add({
                    // (string | mandatory) the heading of the notification
                    title: 'Video Added!',
                    // (string | mandatory) the text inside the notification
                    text: 'The video you posted is now available.',
                    // (string | optional) the image to display on the left
                    image: 'assets/img/ui-sam.jpg',
                    // (bool | optional) if you want it to fade out on its own or just sit there
                    sticky: true,
                    // (int | optional) the time you want it to be alive for before fading out
                    time: '',
                    // (string | optional) the class name you want to apply to that specific message
                    class_name: 'my-sticky-class'
                });
            });
        }

        return false;
    });
});
