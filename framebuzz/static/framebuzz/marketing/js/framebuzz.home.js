$(document).ready(function() {
    var taglines = [
        'Story + Community = <strong>Meaningful Conversations</strong>',
        'Don’t Just Share a Video. <strong>Share the Experience of Watching It</strong>.',
        'Community-Curated <strong>Online Conversations</strong>',
        'Taking Social Media to the <strong>Next Level of Conversation</strong>',
        'Go Beyond Video Comments – Get Into a <strong>Meaningful Conversation</strong>'
    ];

    var currentTaglineIndex = Math.floor(Math.random() * taglines.length);
    var taglineSpan = $('#tagline > span');
    taglineSpan.html(taglines[currentTaglineIndex]);
    
    setInterval(function() { 
        taglineSpan.fadeOut('fast', function() {
            currentTaglineIndex = (currentTaglineIndex == 4) ? 0 : (currentTaglineIndex + 1); 
            taglineSpan.html(taglines[currentTaglineIndex]);
            taglineSpan.fadeIn('fast');
        });    
    }, 10000);

    $('.slider > ul').bxSlider({
      auto: true,
      controls: false,
      speed: 500,
      autoHover: true,
      pause: 5000,
      easing: 'easeInOutSine'
    });
});