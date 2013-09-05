$(document).ready(function() {
  var searchContainer = $('div.search-results');
  var searchForm = $('#search-form');
  var searchUrl = searchForm.attr('action');
  var activeQuery = null;

  var ajaxSearch = function(query) {
    if (activeQuery !== null) { activeQuery.abort(); }

    var searchContentContainer = $('#results-list').length > 0
      ? $('#results-list')
      : $('div.search-results > div.wrapper');

    activeQuery = $.get(searchUrl, {'query': query}, function(html) {
      searchContentContainer.html(html);
      searchContentContainer.highlight(query, { wordsOnly: true });
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