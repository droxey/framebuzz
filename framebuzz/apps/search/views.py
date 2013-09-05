import watson

from collections import OrderedDict
from django.shortcuts import render_to_response
from django.template import RequestContext
from pure_pagination import Paginator, PageNotAnInteger

from framebuzz.apps.api.models import UserProfile, Video, MPTTComment
from framebuzz.apps.api.backends.youtube import find_video_by_keyword

MINIMUM_TOTAL_RESULTS = 30
SEARCH_RESULTS_PER_PAGE = 6


def search(request):
    query = None
    search_results = None

    if request.method == 'GET':
        query = request.GET.get('query', None)
        token = request.GET.get('token', None)

        try:
            page = request.GET.get('page', 1)
        except PageNotAnInteger:
            page = 1

        if query:
            videos = watson.search(query, models=(Video,))
            conversations = watson.search(query, models=(MPTTComment,))
            users = watson.search(query, models=(UserProfile,))

            if len(videos) < MINIMUM_TOTAL_RESULTS:
            	# Attempt to meet MINIMUM_TOTAL_RESULTS by querying YouTube.
            	if not token:
            		fetch_results_count = MINIMUM_TOTAL_RESULTS - len(videos)
            		youtube_videos, token = find_video_by_keyword(query, results=fetch_results_count)
            	else:
            		youtube_videos, token = find_video_by_keyword(query, results=SEARCH_RESULTS_PER_PAGE, next_page_token=token)

            	# Update search, since find_video_by_keyword stores a copy in our db.
            	videos = watson.search(query, models=(Video,))

            # Paginate results.
            video_paginator = Paginator(videos, 6, request=request)
            convo_paginator = Paginator(conversations, 6, request=request)
            user_paginator = Paginator(users, 6, request=request)

            # Add paginated results to an OrderedDict to simplify templates.
            search_results = OrderedDict()
            search_results['videos'] = video_paginator.page(page)
            search_results['conversations'] = convo_paginator.page(page)
            search_results['users'] = user_paginator.page(page)

    return render_to_response('search/results.html',
    {
        'query': query,
        'token': token,
        'search_results': search_results,
    },
    context_instance=RequestContext(request))