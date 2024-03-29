(function($){
  $.extend(MediaElementPlayer.prototype, {
    buildtitle: function(player, controls, layers, media) {
      var titleDiv = $('<div id="video-title" class="mejs-title full-width"></div>').appendTo(controls);
      var title = $('<h1 class="video-title noselect" />').appendTo(titleDiv);
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
      $('<div class="mejs-share clearfix"></div>').appendTo(controls);
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
        $('<button class="mejs-mute-convo-button mejs-mute noselect" type="button" aria-controls="mep_0" title="Mute Conversation" aria-label="Mute Conversation">' +
            '<i class="fa fa-comment"></i>Mute Conversation</button>')
        .appendTo(shareDiv);
    },
    buildprivateconvo: function(player, controls, layers, media) {
      var shareDiv = controls.find('div.mejs-share');
      var button =
        $('<button class="mejs-start-private-session" class="rounded"><i class="fa fa-lock"></i> Start Private</button>')
      .appendTo(shareDiv);
    },
    buildprivateviewing: function(player, controls, layers, media) {
        //if (SOCK.private_viewing_enabled) {     // Only dashboard-enabled users may utilize the private viewing function.
            var shareDiv = controls.find('div.mejs-share');
            var button =
                $('<button class="mejs-start-private-viewing" class="rounded"><i class="fa fa-group"></i> Watch Together</button>')
            .appendTo(shareDiv);
        //}
    },
    buildviewers: function(player, controls, layers, media) {
        var shareDiv = controls.find('div.mejs-share');
        var button =
        $('<button class="mejs-current-viewers" class="rounded"><i class="fa fa-eye"></i> Viewers</button>')
        .appendTo(shareDiv);
    }
  });
})(jQuery);
