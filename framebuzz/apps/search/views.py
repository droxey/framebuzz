import watson

from django.shortcuts import render_to_response
from django.template import RequestContext
from pure_pagination import Paginator, PageNotAnInteger

from framebuzz.apps.api.models import UserProfile, Video, MPTTComment
from framebuzz.apps.api.backends.youtube import find_video_by_keyword


MINIMUM_TOTAL_RESULTS = 30
RESULTS_PER_PAGE = 6


def search(request):
    query = None
    q_filter = None
    conversations = []
    users = []
    videos = []
    search_results = []
    results_count = 0

    if request.method == 'GET':
        query = request.GET.get('query', None)
        q_filter = request.GET.get('filter', None)

        if query:
            if q_filter is None or q_filter == 'videos':
                total = RESULTS_PER_PAGE if q_filter == None else MINIMUM_TOTAL_RESULTS
                yt, token = find_video_by_keyword(query, results=total)

                while token is not None:
                    yt, token = find_video_by_keyword(query, results=total, next_page_token=token)

                # Update search, since find_video_by_keyword
                # stores a copy in our db.
                videos = watson.search(query, models=(Video,))
            
            if q_filter is None or q_filter == 'conversations':
                conversations = watson.search(query, models=(MPTTComment,))
            
            if q_filter is None or q_filter == 'users':
                users = watson.search(query, models=(UserProfile,))

            if q_filter is not None:
                try:
                    page = request.GET.get('page', 1)
                except PageNotAnInteger:
                    page = 1

                if q_filter == 'videos':
                    paginator = Paginator(videos, RESULTS_PER_PAGE, request=request)
                    results_count = len(videos)
                elif q_filter == 'users':
                    paginator = Paginator(users, RESULTS_PER_PAGE, request=request)
                    results_count = len(users)
                else:
                    paginator = Paginator(conversations, RESULTS_PER_PAGE, request=request)
                    results_count = len(conversations)

                search_results = paginator.page(page)

    return render_to_response('search/results.html', {
        'query': query,
        'search_criteria': ['videos', 'conversations', 'users'],
        'conversations': conversations,
        'users': users,
        'videos': videos,
        'filter': q_filter,
        'search_results': search_results,
        'results_count': results_count,
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
