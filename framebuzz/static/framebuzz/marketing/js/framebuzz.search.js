$(document).ready(function() {
  var searchContainer = $('div.search-results');
  var searchForm = $('#search-form');
  var searchUrl = searchForm.attr('action');
  var activeQuery = null;

  var ajaxSearch = function(query) {
    var resultsList = $('#results-list');
    var resultsContainer = $('div.search-results > div.wrapper');
    var searchContentContainer = resultsList.length > 0 ? resultsList : resultsContainer;

    // Update the 'Searching for...' header.
    $('h1 > strong', resultsList).text(query);

    activeQuery = $.get(searchUrl, {'query': query}, function(html) {
      searchContentContainer.html(html);
      searchContentContainer.highlight(query);
    });
  };

  searchForm.submit(function(e) {
    e.preventDefault();
  });

  $('input.search-query').keyup(function(e) {
    var query = $.trim($(this).val());
    $(this).val(query);
    
    if (query.length == 0) {
      searchContainer.hide('slide', { direction: 'up', easing: 'easeOutQuint', duration: 800, queue: false });
    }
    else {
      if (activeQuery !== null) { 
        activeQuery.abort(); 
      }

      if (!searchContainer.is(':visible')) {
        searchContainer.show('slide', { 
          direction: 'up', 
          easing: 'easeInQuint',
          duration: 800, 
          queue: false 
          }, function() {
            ajaxSearch(query);
        });
      }
      else {
        ajaxSearch(query);
      }
    }
  });
});