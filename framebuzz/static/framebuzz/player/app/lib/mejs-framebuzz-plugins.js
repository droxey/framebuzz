(function($){
  MediaElementPlayer.prototype.buildmuteconvo = function(player, controls, layers, media) {
    var button =  
      $('<div class="mejs-button mejs-mute-conversation-button mejs-mute mejs-fade-in">' +
          '<button type="button" aria-controls="mep_0" title="Mute Conversation" aria-label="Mute Conversation">' +
            '<img class="mejs-mute-conversation-icon" src="/static/framebuzz/player/app/img/icon-comment-on.png" alt="Mute Conversation" />' +
          '</button>' +
        '</div>')
      .appendTo(controls)
      .click(function() {
        var buttonImg = button.find('.mejs-mute-conversation-icon');

        if (button.hasClass('mejs-mute')) {
          buttonImg.attr('src', '/static/framebuzz/player/app/img/icon-comment-off.png');
          button.removeClass('mejs-mute').addClass('mejs-unmute');

          media.dispatchEvent('player_muteconvo');
        }
        else {
          buttonImg.attr('src', '/static/framebuzz/player/app/img/icon-comment-on.png');
          button.removeClass('mejs-unmute').addClass('mejs-mute');

          media.dispatchEvent('player_unmuteconvo');
        }
      });
  };

  MediaElementPlayer.prototype.buildshare = function(player, controls, layers, media) {
    var shareDiv = $('<div class="mejs-share mejs-fade-in"></div>').appendTo(controls);

    var button =
      $('<button class="mejs-share-framebuzz-button" type="button" aria-controls="mep_0" title="Share This FrameBuzz" aria-label="Share This FrameBuzz">' +
          '<img src="/static/framebuzz/player/app/img/icon-share.png" alt="Share This FrameBuzz" />' +
        '</button>')
      .appendTo(shareDiv)
      .click(function() {
        media.dispatchEvent('player_share');
      });
  };

  MediaElementPlayer.prototype.buildprivateconvo = function(player, controls, layers, media) {
    var shareDiv = controls.find('div.mejs-share');

    var button =
      $('<button class="mejs-private-convo-button" type="button" aria-controls="mep_0" title="Start a Private Conversation" aria-label="Start a Private Conversation">' +
          '<img src="/static/framebuzz/player/app/img/icon-plus.png" alt="Start a Private Conversation" />' +
        '</button>')
      .appendTo(shareDiv)
      .click(function() {
        media.dispatchEvent('player_privateconvo');
      });
  };
})(jQuery);