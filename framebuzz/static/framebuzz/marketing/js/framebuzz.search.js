$(document).ready(function() {
  var searchContainer = $('div.search-results');
  var searchForm = $('#search-form');
  var searchUrl = searchForm.attr('action');
  var searchVideosUrl = searchForm.attr('data-videos-url');
  var searchConversationsUrl = searchForm.attr('data-conversations-url');
  var searchUsersUrl = searchForm.attr('data-users-url');
  var videosQuery = null;
  var conversationsQuery = null;
  var usersQuery = null;


  var startSpinner = function() {
    $('#results-list div.span4 div.pagination-page').spin({
      lines: 10, // The number of lines to draw
      length: 13, // The length of each line
      width: 11, // The line thickness
      radius: 20, // The radius of the inner circle
      corners: 0.75, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 0.7, // Rounds per second
      trail: 37, // Afterglow percentage
      shadow: true, // Whether to render a shadow
      hwaccel: true, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '170', // Top position relative to parent in px
      left: '140' // Left position relative to parent in px
    });
  };

  var getList = function(listName) {
    var selector = '#results-list div.span4 div.pagination-page.' + listName + '-results';
    return $(selector);
  };

  var stopSpinner = function(listName) {
    var element = getList(listName);
    element.spin(false);
  };

  var abortSearch = function() {
      if (videosQuery !== null) { videosQuery.abort(); }
      if (conversationsQuery !== null) { conversationsQuery.abort(); }
      if (usersQuery !== null) { usersQuery.abort(); }
  };

  var initSearch = function(query) {
    var resultsContainer = $('div.search-results > div.wrapper');

    $.get(searchUrl, function(html) {
        resultsContainer.html(html);
        startSpinner();
        startSearch(query);
    });
  };

  var bindPagination = function(listName, url) {
    var pageContainer = getList(listName);

    $('#results-list').on('click', 'a.page-link', function() {
      var pageUrl = $(this).attr('href');
      
      $.get(url + pageUrl, function(pageHtml) {
        pageContainer.fadeOut('slow', function() {
          pageContainer.html(pageHtml);
          pageContainer.fadeIn('slow');
        });
      });

      return false;
    });
  };

  var startSearch = function(query) {
    var searchContentContainer = $('#results-list');

    // Update the 'Searching for...' header.
    $('h1 > strong', searchContentContainer).text(query);

    videoQuery = $.get(searchVideosUrl, {'query': query}, function(results) {
      stopSpinner('videos');

      var container = $('div.videos-results', searchContentContainer);
      container.html(results);
      container.highlight(query);

      bindPagination('videos', searchVideosUrl);
    });

    conversationsQuery = $.get(searchConversationsUrl, {'query': query}, function(results) {
      stopSpinner('conversations');

      var container = $('div.conversations-results', searchContentContainer);
      container.html(results);
      container.highlight(query);

      bindPagination('conversations', searchConversationsUrl);
    });

    usersQuery = $.get(searchUsersUrl, {'query': query}, function(results) {
      stopSpinner('users');

      var container = $('div.users-results', searchContentContainer);
      container.html(results);
      container.highlight(query);

      bindPagination('users', searchUsersUrl);
    });
  };


  searchForm.submit(function(e) {
    e.preventDefault();
  });


  $('input.search-query').keyup(function(e) {
    abortSearch();

    var query = $.trim($(this).val());
    $(this).val(query);
    
    if (query.length == 0) {
      searchContainer.hide('slide', { direction: 'up', easing: 'easeOutQuint', duration: 800, queue: false });
    }
    else {
      if (!searchContainer.is(':visible')) {
        searchContainer.show('slide', { 
          direction: 'up', 
          easing: 'easeInQuint',
          duration: 800, 
          queue: false 
          }, function() {
            initSearch(query);
        });
      }
      else {
        startSearch(query);
      }
    }
  });
});