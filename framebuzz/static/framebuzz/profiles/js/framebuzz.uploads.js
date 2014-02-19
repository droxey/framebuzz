$(function() {
    var addVideoDiv = $('#add-video');
        selectedTabIndicator = $('ul.nav-tabs li.indicator', addVideoDiv),
        dropPaneDiv = $('#upload-drop-pane'),
        dropResultDiv = $("#drop-result-bar"),
        uploadBadge = $('#upload-badge'),
        currentCount = parseInt(uploadBadge.attr('data-upload-count')),
        hasError = false,
        baseUrl = 'https://app.zencoder.com/api/v2/jobs/',
        checkJobsInterval = null,
        finishedUploads = [],
        acceptedExtensions = [
          '3g2','3gp','3gp2','3gpp','3gpp2','aac','ac3','eac3','ec3','f4a','f4b','f4v',
          'flv','highwinds','m4a','m4b','m4r','m4v','mkv','mov','mp3','mp4','oga','ogg',
          'ogv','ogx','ts','webm','wma','wmv'
        ];

    var convertToSlug = function(input) {
      return input
          .toLowerCase()
          .replace(/[^\w ]+/g,'')
          .replace(/ +/g,'-')
          ;
    };

    var setHiddenFormFields = function(url, key) {
      var filenameWithoutExt = key.split(".");
      var folderName = convertToSlug(filenameWithoutExt[0]);

      $('#id_fp_url').val(url);
      $('#id_fp_filename').val(folderName);
    };

    var resetForm = function() {
        $('ul.nav-tabs li', addVideoDiv).removeClass('active');
        $('div.tab-content div.tab-pane', addVideoDiv).removeClass('active');
        selectedTabIndicator.hide();

        $('#id_fp_filename').val('');
        $('#id_fp_url').val('');
        $('#id_title').val('');
        $('#id_description').val('');

        $('input, textarea').placeholder();

        dropPaneDiv.html('<div id="upload-drop-pane" class="col-xs-12">Drag and drop your video files here.<br>Or, <a href="#" id="upload-click-here">click here</a> to upload videos from Dropbox, Google Drive, and more!</div>');
    };

    var setBadgeCount = function(newCount) {
      uploadBadge.badger(newCount.toString());
      uploadBadge.attr('data-upload-count', newCount.toString());
    };

    var progress = function(percent, $element) {
        var progressBarWidth = percent * $element.width() / 100;
        $element.find('div').animate({ width: progressBarWidth }, 500).html(percent + "%&nbsp;");
    };

    var renderNewVideoTile = function(job_id) {
      var url = '/video/tile/' + job_id + '/';
      $.get(url, function(html) {
        console.log(html);
      });
    };

    function checkZencoderJobs() {
      // Check status of uploads dynamically if we still have some pending
      // jobs on page refresh.
      if (parseInt(uploadBadge.attr('data-upload-count')) > 0) {
        // Queue the AJAX calls properly.
        var deferreds = [];

        $('#uploads-table tr').not('.complete').each(function(key, value) {
          var url = baseUrl + $(this).attr('data-job-id') + '/progress.json?api_key=e9d23782542efd39f402fc40a7b4edaf';
          var row = $(this);

          deferreds.push(
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                  var progressBar = row.find('div.progress-bar');

                  if (data['state'] == 'processing') {
                    progressBar.attr('data-percentage', data['progress']);
                    progress(data['progress'], progressBar);
                  }
                  else {
                    if (data['state'] == 'finished') {
                      progressBar.attr('data-percentage', '100');
                      progress(100, progressBar);

                      row.addClass('complete');
                      currentCount = currentCount - 1;

                      renderNewVideoTile(row.attr('data-job-id'));
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
          setBadgeCount(currentCount);

          if (currentCount == 0 && checkJobsInterval !== null) {
            clearInterval(checkJobsInterval);
          }
        });
      }
    };

    var startJobCheckInterval = function() {
      if (checkJobsInterval === null) {
        checkZencoderJobs();

        checkJobsInterval = setInterval(checkZencoderJobs, 60000);
      }
    };

    // Check jobs.
    startJobCheckInterval();

    // Add placeholder text for forms.
    $('input, textarea').placeholder();

    // Event callback for bootstrap tabs.
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      if ($(e.target).attr('href') == '#pending-uploads') {
        $('#uploads-table tr').each(function(key, value) {
          var progressBar = $(this).find('div.progress-bar');
          progress(progressBar.attr('data-percentage'), progressBar);
        });
      }
    });

    // Set filepicker.io key and drop panes for uploads.
    filepicker.setKey('AXQRyfZ2cQjWD3yy2flkFz');
    filepicker.makeDropPane(dropPaneDiv[0], {
        multiple: false,
        extensions: acceptedExtensions,
        dragEnter: function() {
            dropPaneDiv.html("Drop to upload.");
        },
        dragLeave: function() {
            dropPaneDiv.html("Drop files here.");
        },
        onSuccess: function(InkBlobs) {
            dropPaneDiv.text("Done, see result below");
            setHiddenFormFields(InkBlobs[0].url, InkBlobs[0].key);
        },
        onError: function(type, message) {
            dropResultDiv.text('('+type+') '+ message);
        },
        onProgress: function(percentage) {
            dropPaneDiv.text("Uploading ("+percentage+"%)");
        }
    });

    // Move the active tab indicator and hide/show active form.
    $('ul.nav-tabs li a', addVideoDiv).click(function() {
      var newClass = $(this).parent().attr('class');
      var oldTabDiv = $($(this).attr('href'));

      selectedTabIndicator.removeClass('video youtube webcam uploads');
      selectedTabIndicator.show();
      selectedTabIndicator.addClass(newClass);
    });

    // Cancel upload button.
    $('a.cancel-upload', addVideoDiv).click(function() {
      selectedTabIndicator.hide();

      $('ul.nav-tabs li', addVideoDiv).removeClass('active');
      $('div.tab-content div.tab-pane', addVideoDiv).removeClass('active');
    });

    // Upload Video submit button.
    $('#upload-file-form', addVideoDiv).submit(function(e) {
      e.preventDefault();

      // Simple validation.
      if ($('#id_fp_filename').val().length == 0) {
        dropPaneDiv.addClass('error');
        hasError = true;
      }
      else {
        dropPaneDiv.removeClass('error');
      }

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
        window.location.reload();
      });

      return false;
    });

    $('#upload-click-here').click(function(e) {
        e.preventDefault();

        filepicker.pickAndStore(
          {
            extensions: acceptedExtensions,
            services: ['COMPUTER','VIDEO','BOX','DROPBOX','GOOGLE_DRIVE','GMAIL','URL','FTP']
          },
          {
            location: 's3'
          }, function(fpfiles) {
            dropPaneDiv.html('<i class="fa fa-film"></i> <strong>' + fpfiles[0].filename + ' added!</strong>');
            setHiddenFormFields(fpfiles[0].url, fpfiles[0].key);
        });
    });
});