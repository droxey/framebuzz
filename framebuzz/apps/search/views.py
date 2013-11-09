import watson

from django.shortcuts import render_to_response
from django.template import RequestContext
from pure_pagination import Paginator, PageNotAnInteger

from framebuzz.apps.api.models import UserProfile, Video, MPTTComment
from framebuzz.apps.api.backends.youtube import find_video_by_keyword


MINIMUM_TOTAL_RESULTS = 6
RESULTS_PER_PAGE = 6


def search(request):
    query = None
    conversations = None
    users = None
    videos = None

    if request.method == 'GET':
        query = request.GET.get('query', None)

        conversations = watson.search(query, models=(MPTTComment,))
        users = watson.search(query, models=(UserProfile,))
        videos = watson.search(query, models=(Video,))
        
        if len(videos) < RESULTS_PER_PAGE:
            count = MINIMUM_TOTAL_RESULTS - len(videos)
            yt, token = find_video_by_keyword(query, results=count)

            # Update search, since find_video_by_keyword
            # stores a copy in our db.
            videos = watson.search(query, models=(Video,))

    return render_to_response('search/results.html', {
        'query': query,
        'search_criteria': ['videos', 'conversations', 'users'],
        'conversations': conversations,
        'users': users,
        'videos': videos,
    }, context_instance=RequestContext(request))


def search_videos(request):
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
            if len(videos) < MINIMUM_TOTAL_RESULTS:
                # Attempt to meet MINIMUM_TOTAL_RESULTS by querying YouTube.
                if not token:
                    count = MINIMUM_TOTAL_RESULTS - len(videos)
                    yt, token = find_video_by_keyword(query, results=count)
                else:
                    yt, token = find_video_by_keyword(query,
                        results=RESULTS_PER_PAGE, next_page_token=token)

                # Update search, since find_video_by_keyword
                # stores a copy in our db.
                videos = watson.search(query, models=(Video,))

            # Paginate results.
            video_paginator = Paginator(videos, RESULTS_PER_PAGE, request=request)
            search_results = video_paginator.page(page)

    return render_to_response('search/videos.html', {
        'query': query,
        'token': token,
        'search_results': search_results,
    }, context_instance=RequestContext(request))


def search_conversations(request):
    query = None
    search_results = None

    if request.method == 'GET':
        query = request.GET.get('query', None)

        try:
            page = request.GET.get('page', 1)
        except PageNotAnInteger:
            page = 1

        if query:
            conversations = watson.search(query, models=(MPTTComment,))
            total = RESULTS_PER_PAGE - 1
            convo_paginator = Paginator(conversations, total, request=request)
            search_results = convo_paginator.page(page)

    return render_to_response('search/conversations.html', {
        'query': query,
        'search_results': search_results,
    }, context_instance=RequestContext(request))


def search_users(request):
    query = None
    search_results = None

    if request.method == 'GET':
        query = request.GET.get('query', None)

        try:
            page = request.GET.get('page', 1)
        except PageNotAnInteger:
            page = 1

        if query:
            users = watson.search(query, models=(UserProfile,))
            user_paginator = Paginator(users, 6, request=request)
            search_results = user_paginator.page(page)

    return render_to_response('search/users.html', {
        'query': query,
        'search_results': search_results,
    }, context_instance=RequestContext(request))
