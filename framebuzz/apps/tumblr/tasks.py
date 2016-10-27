import celery
import datetime
import pytumblr

from allauth.socialaccount.models import SocialApp, SocialAccount, SocialToken
from django.contrib.auth.models import User
from django.conf import settings
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
    # Connect to Tumblr API.
    client = pytumblr.TumblrRestClient(
        tumblr_app.client_id,
        tumblr_app.secret,
        tumblr_user.token,
        tumblr_user.token_secret)
    # Send video data to Tumblr on behalf of the submitting user.
    v = Video.objects.get(video_id=video_id)
    caption = settings.TUMBLR_POST_TEXT % (v.title, v.formatted_description)
    create_kwargs = encoded_dict({'date': datetime.datetime.now(),
                                  'format': 'html',
                                  'caption': caption,
                                  'embed': v.embed_code(),
                                  'tags': ['#framebuzz']})
    # Parse API response from Tumblr.
    response = client.create_video(blogname=act.uid, **create_kwargs)
    post_id = response.get('id', None)
    if post_id:
        # Add new video to collection. Store post link for later.
        v.submit_to_tumblr = True
        v.save()
        uv, created = UserVideo.objects.get_or_create(user=user, video=v)
        uv.tumblr_link = 'http://%s.tumblr.com/post/%s/' % (act.uid, post_id)
        uv.save()
