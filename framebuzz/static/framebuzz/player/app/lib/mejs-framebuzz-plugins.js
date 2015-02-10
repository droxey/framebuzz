(function($){
  $.extend(MediaElementPlayer.prototype, {
    buildtitle: function(player, controls, layers, media) {
      var titleDiv = $('<div class="mejs-title mejs-fade-in"></div>').appendTo(controls);
      var title = $('<h1 class="video-title" />').appendTo(titleDiv);
      if (SOCK.private_session_key) {
          if (SOCK.is_synchronized) {
              title.html('<i class="fa fa-group"></i> ' + SOCK.video_title);
          }
          else {
              title.html('<i class="fa fa-lock"></i> ' + SOCK.video_title);
          }
      }
      else {
        title.text(SOCK.video_title);
      }
    },
    buildoptionsbar: function(player, controls, layers, media) {
      $('<div class="mejs-share mejs-fade-in"></div>').appendTo(controls);
    },
    buildshare: function(player, controls, layers, media) {
      var shareDiv = controls.find('div.mejs-share');

      var button =
        $('<button class="mejs-share-framebuzz-button" type="button" aria-controls="mep_0" title="Share This FrameBuzz" aria-label="Share This FrameBuzz">' +
          '<i class="fa fa-share-alt"></i>Share' +
          '</button>')
        .appendTo(shareDiv);
    },
    buildaddtolibrary: function(player, controls, layers, media) {
      var shareDiv = controls.find('div.mejs-share');

      var button =
        $('<button class="mejs-add-library-button" type="button" aria-controls="mep_0" title="Add Video to My Library" aria-label="Add Video to My Libary">' +
           '<i class="fa fa-plus"></i>Add Video' +
           '</button>')
        .appendTo(shareDiv);
    },
    buildmuteconvo: function(player, controls, layers, media) {
      var shareDiv = controls.find('div.mejs-share');

      var button =
        $('<button class="mejs-mute-convo-button mejs-mute" type="button" aria-controls="mep_0" title="Mute Chat" aria-label="Mute Chat">' +
            '<i class="fa fa-comment"></i>Mute Chat</button>')
        .appendTo(shareDiv);
    },
    buildprivateconvo: function(player, controls, layers, media) {
      var shareDiv = controls.find('div.mejs-share');
      var button =
        $('<button class="mejs-start-private-session" class="rounded"><i class="fa fa-lock"></i> Start Private</button>')
      .appendTo(shareDiv);
    },
    buildprivateviewing: function(player, controls, layers, media) {
        console.log(SOCK.private_viewing_enabled);
        if (SOCK.private_viewing_enabled) {     // Only dashboard-enabled users may utilize the private viewing function.
            console.log('private enabled');

            var shareDiv = controls.find('div.mejs-share');
            var button =
                $('<button class="mejs-start-private-viewing" class="rounded"><i class="fa fa-group"></i> Watch Together</button>')
            .appendTo(shareDiv);
        }
    }
  });
})(jQuery);
