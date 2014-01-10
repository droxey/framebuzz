$(document).ready(function() {
  if ($('body').hasClass('home')) {
    $('.bxslider').bxSlider({
      captions: true,
      pager: false,
      minSlides: 3,
      maxSlides: 3,
      slideMargin: 0,
      mode: 'vertical',
      onSliderLoad: function() {
        $('#thumbs ul li').click(function() {
          var videoUrl = $(this).find('img').attr('data-video-url'),
              playerContainer = $('#fbz-player-container'),
              newFrame = $('<iframe src="" scrolling="no" frameBorder="0" height="445" width="700" class="absolute-center pull-right"></iframe>');

          $('iframe', playerContainer).fadeOut(100, function() {
            playerContainer.html('');
            newFrame.attr('src', videoUrl);
            playerContainer.append(newFrame);
          });
        });
      }
    });
  }
  else {
    $('.slider > ul').bxSlider({
      auto: true,
      controls: false,
      speed: 500,
      autoHover: true,
      pause: 10000,
      easing: 'easeInOutSine'
    });
  }
});