import celery
import datetime
import json
import pytumblr

from allauth.socialaccount.models import SocialApp, SocialAccount, SocialToken
from django.contrib.auth.models import User
from framebuzz.apps.api.models import Video, UserVideo
from framebuzz.apps.tumblr.utils import encoded_dict


@celery.task(name='framebuzz.apps.tumblr.tasks.submit_to_tumblr')
def submit_to_tumblr(username, video_id):
    ''' Submits the FrameBuzz video to Tumblr asnycronously,
        after we receive feedback that the video upload is fully complete.
        Additionally adds the video to the user's collection. '''
    # Gather credentials.
    tumblr_app = SocialApp.objects.get(provider='tumblr')
    user = User.objects.get(username__iexact=username)
    act = SocialAccount.objects.get(user=user)
    tumblr_user = SocialToken.objects.get(app=tumblr_app, account=act)
    client = pytumblr.TumblrRestClient(
        tumblr_app.client_id,
        tumblr_app.secret,
        tumblr_user.token,
        tumblr_user.token_secret)
    # Send video data to Tumblr on behalf of the submitting user.
    video = Video.objects.get(video_id=video_id)
    create_kwargs = encoded_dict({'tags': 'framebuzz',
                                  'date': datetime.datetime.now(),
                                  'format': 'html',
                                  'caption': video.description,
                                  'embed': video.tumblr_embed_code()})
    # Parse API response from Tumblr.
    response = client.create_video(blogname=act.uid, **create_kwargs)
    post_id = response.get('id', None)
    if post_id:
        # Successful submission. Set video.submit_to_tumblr = False to avoid
        # any duplicate Tumblr posts.
        video.submit_to_tumblr = False
        video.save()
        # Add new video to collection. Store post link for later.
        uv = UserVideo.objects.get_or_create(user=user, video=video)
        uv.tumblr_link = 'http://%s.tumblr.com/post/%s/' % (act.uid, post_id)
        uv.save()
