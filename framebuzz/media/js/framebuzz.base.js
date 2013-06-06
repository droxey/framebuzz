$(document).ready(function() {
  // Twitter bootstrap form stuff.
  var pFormWrapper = $('form > p');

  $.each(pFormWrapper, function(key, value) {
    var checkbox = $(value).find(':checkbox');
    if (checkbox.length > 0) {
      $(value).addClass('control-group checkbox-group clearfix');
    }
    else {
      $(value).addClass('control-group');
    }
  });

  // Titlebar click.
  $('#id_framebuzz_search').focus(function() {
    var replacementText = 'Try: hydrate jirate';
    $(this).attr('placeholder', replacementText);
  });

  $('#id_framebuzz_search').focusout(function() {
    var replacementText = 'Search YouTube Videos...';
    $(this).attr('placeholder', replacementText);
  });

  // Pagination.
  $('div.pagination-page').on('click', 'a.page-link', function() {
    var pageContainer = $('div.pagination-page');
    var pageUrl = $(this).attr('href');

    $.get(pageUrl, function(pageHtml) {
      pageContainer.fadeOut('fast', function() {
        pageContainer.html(pageHtml);
        pageContainer.fadeIn('fast');
      });
    });

    return false;
  });

  // Change avatar hover.
  $('a.profile-link').hover(function() {
    $('span.change-avatar').stop().css({'display': 'block'}).fadeIn();
  }, function() {
    $('span.change-avatar').stop().fadeOut();
  });

  // Follow/unfollow user.
  $("#follow_button, #unfollow_button").click(function () {
      $.post($(this).attr("href"), {});
      $(this).parent().find("#follow_button, #unfollow_button").toggle();
      return false
  });
});