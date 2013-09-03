import watson

from django.shortcuts import render_to_response


def search(request, template='search/request.html'):
    search_results = None

    if request.method == 'GET':
        query = requet.GET.get('q', None)
        if query:
            search_results = watson.search(query)
            template = 'search/results.html'

    return render_to_response(template,
    {
        'search_results': search_results,
    },
    context_instance=RequestContext(request))