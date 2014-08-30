(function($){
  $.extend(MediaElementPlayer.prototype, {
    buildtitle: function(player, controls, layers, media) {
      var titleDiv = $('<div class="mejs-title mejs-fade-in"></div>').appendTo(controls);
      var title = $('<h1 class="video-title" />').appendTo(titleDiv);
      title.text(SOCK.video_title);
    },
    buildshare: function(player, controls, layers, media) {
      var shareDiv = $('<div class="mejs-share mejs-fade-in"></div>').appendTo(controls);

      var button =
        $('<button class="mejs-share-framebuzz-button" type="button" aria-controls="mep_0" title="Share This FrameBuzz" aria-label="Share This FrameBuzz">' +
          '<i class="fa fa-share-alt"></i>Share' +
          '</button>')
        .appendTo(shareDiv);
    },
    buildaddtolibrary: function(player, controls, layers, media) {
      var shareDiv = controls.find('div.mejs-share');

      var button =
        $('<button class="mejs-add-library-button" type="button" aria-controls="mep_0" title="Add to My Library" aria-label="Add to My Libary">' +
           '<i class="fa fa-plus"></i>Add to Library' +
           '</button>')
        .appendTo(shareDiv);
    },
    buildmuteconvo: function(player, controls, layers, media) {
      var shareDiv = controls.find('div.mejs-share');

      var button =  
        $('<button class="mejs-mute-convo-button mejs-mute" type="button" aria-controls="mep_0" title="Mute Conversation" aria-label="Mute Conversation">' +
            '<i class="fa fa-comment"></i>Mute Conversation</button>')
        .appendTo(shareDiv);
    },
    buildprivateconvo: function(player, controls, layers, media) {
      var shareDiv = controls.find('div.mejs-share');
      var button = 
        $('<button class="mejs-start-private-session" class="rounded"><i class="fa fa-lock"></i> Start Private</button>')
      .appendTo(shareDiv);
    }
  });
})(jQuery);