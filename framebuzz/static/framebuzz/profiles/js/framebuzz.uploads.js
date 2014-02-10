$(function() {
    //Put your Filepicker.io API key here:
    filepicker.setKey('AXQRyfZ2cQjWD3yy2flkFz');
    //Zencoder API key
    //var zenKey = 'e990db716cb4d5b55a9ca91ceaba6c00'; // full access
    var zenKey = '75e13910e393a6ccafc1a3272f3a6a48'; //integration mode
    $('#upload-link').click(function(e) {
      e.preventDefault();

      var acceptedExtensions = [
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
            var s3Url = "s3://framebuzz-zencoder/" + folderName + "/" + folderName;

            // HTML5 video.
            var request = {
              "input": uploadedFileUrl,
              "outputs": [
                {
                  "credentials": "s3",
                  "rrs": true,
                  "url": s3Url + ".mp4",
                  "size": "640x480",
                  "public": true
                },
                {
                  "credentials": "s3",
                  "rrs": true,
                  "url": s3Url + ".webm",
                  "size": "640x480",
                  "public": true
                }
              ]
            };

           // Use $.ajax instead of $.post so we can specify custom headers.
           $.ajax({
              url: 'https://app.zencoder.com/api/v2/jobs',
              type: 'POST',
              data: JSON.stringify(request),
              headers: { "Zencoder-Api-Key": zenKey },
              dataType: 'json',
              success: function(data) {
                $('body').append('Job created! <a href="https://app.zencoder.com/jobs/'+ data.id +'">View Job</a>')
              },
              error: function(data) {
                 console.log(data);
              }
           });
      });
   });
});