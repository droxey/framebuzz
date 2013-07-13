(function($){
  MediaElementPlayer.prototype.buildmuteconvo = function(player, controls, layers, media) {
    console.log('called!');
    var button = $('<div class="mejs-button mejs-mute-conversation-button mejs-mute">' +
                    '<button type="button" aria-controls="mep_0" title="Mute Conversation" aria-label="Mute Conversation">' +
                      '<img class="mejs-mute-conversation-icon" src="/static/framebuzz/player/app/img/icon-comment-on.png" alt="Mute Conversation" />' +
                    '</button>' +
                  '</div>');
    button.appendTo(controls);

    console.log(controls);

    var buttonImg = button.find('.mejs-mute-conversation-icon');

    console.log(buttonImg);

    button.click(function() {
      if (button.hasClass('mejs-mute')) {
        buttonImg.attr('src', '/static/framebuzz/player/app/img/icon-comment-on.png');
        buttonImg.parent().parent().removeClass('mejs-mute').addClass('mejs-unmute');
      }
      else {
        buttonImg.attr('src', '/static/framebuzz/player/app/img/icon-comment-off.png');
        buttonImg.parent().parent().removeClass('mejs-unmute').addClass('mejs-mute');
      }
    });
  };
})(jQuery);