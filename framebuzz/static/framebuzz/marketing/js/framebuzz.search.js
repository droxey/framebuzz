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


  var getList = function(listName) {
    var selector = '#results-list div.span4 div.pagination-page.' + listName + '-results';
    return $(selector);
  };


  var abortSearch = function() {
      if (videosQuery !== null) { videosQuery.abort(); }
      if (conversationsQuery !== null) { conversationsQuery.abort(); }
      if (usersQuery !== null) { usersQuery.abort(); }
  };


  var bindPagination = function(listName, url, query) {
    var pageContainer = getList(listName);

    $("img.lazy").lazyload({ 
        effect: "fadeIn",
        event: 'scroll trigger-lazy-load'
    });

    pageContainer.on('click', 'a.page-link', function() {
      var pageUrl = $(this).attr('href');

      $.get(url + pageUrl, function(pageHtml) {
        pageContainer.fadeOut('slow', function() {
          pageContainer.html(pageHtml);
          pageContainer.fadeIn('slow', function() {
            $('img.lazy', pageContainer).trigger('trigger-lazy-load');
            pageContainer.highlight(query);
          });
        });
      });

      return false;
    });
  };


  var bindClose = function() {
    $('#results-list').on('click', 'button.close', function() {
      closeSearch();
    });

    $('div.marketing-content').click(function() {
      closeSearch();
    });
  };


  var initSearch = function(query) {
    var resultsContainer = $('div.search-results > div.wrapper');

    $.get(searchUrl, function(html) {
        resultsContainer.html(html);
        bindClose();
        startSearch(query);
    });
  };


  var closeSearch = function() {
    abortSearch();

    searchContainer.hide('slide', { direction: 'up', easing: 'easeOutQuint', duration: 800, queue: false }, function() {
      $('#results-list').remove();
      $('input.search-query').val('');
    });
  };
  

  var startSearch = function(query) {
    abortSearch();

    // Update the 'Searching for...' header.
    $('#results-list h1 > strong').text(query);

    videoQuery = $.get(searchVideosUrl, {'query': query}, function(results) {
      var container = getList('videos');
      container.html(results);
      container.highlight(query);

      bindPagination('videos', searchVideosUrl, query);
    });

    conversationsQuery = $.get(searchConversationsUrl, {'query': query}, function(results) {
      var container = getList('conversations');
      container.html(results);
      container.highlight(query);

      bindPagination('conversations', searchConversationsUrl, query);
    });

    usersQuery = $.get(searchUsersUrl, {'query': query}, function(results) {
      var container = getList('users');
      container.html(results);
      container.highlight(query);

      bindPagination('users', searchUsersUrl, query);
    });
  };


  searchForm.submit(function(e) {
    e.preventDefault();

    var query = $.trim($('input.search-query').val());
    $(this).val(query);
    
    if (query.length == 0) {
      closeSearch();
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

    return false;
  });
});