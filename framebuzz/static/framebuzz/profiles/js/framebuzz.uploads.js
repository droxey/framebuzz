$(function() {
    var addVideoDiv = $('#add-video');
        selectedTabIndicator = $('ul.nav-tabs li.indicator', addVideoDiv),
        dropPaneDiv = $('#upload-drop-pane'),
        dropResultDiv = $("#drop-result-bar"),
        acceptedExtensions = [
          '3g2','3gp','3gp2','3gpp','3gpp2','aac','ac3','eac3','ec3','f4a','f4b','f4v',
          'flv','highwinds','m4a','m4b','m4r','m4v','mkv','mov','mp3','mp4','oga','ogg',
          'ogv','ogx','ts','webm','wma','wmv'
        ];

    // Add placeholder text for forms.
    $('input, textarea').placeholder();

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
            dropResultDiv.text(JSON.stringify(InkBlobs));
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

      selectedTabIndicator.removeClass('video youtube webcam');
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

      console.log('clicked');

      return false;
    }); 

    /*
    $('#upload-click-here').click(function(e) {
      e.preventDefault();

      var convertToSlug = function(input) {
        return input
            .toLowerCase()
            .replace(/[^\w ]+/g,'')
            .replace(/ +/g,'-')
            ;
      };

      filepicker.pickAndStore(
          {
            extensions: acceptedExtensions,
            services: ['COMPUTER','VIDEO','BOX','DROPBOX','GOOGLE_DRIVE','GMAIL','URL','FTP']
          },
          {
            location: 's3'
          }, function(fpfiles){
            var uploadedFileUrl = fpfiles[0].url;
            var uploadedFilename = fpfiles[0].key;
            var filenameWithoutExt = uploadedFilename.split(".");
            var folderName = convertToSlug(filenameWithoutExt[0]);
          });
      });


   });
*/
});