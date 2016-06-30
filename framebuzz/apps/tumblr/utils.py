from django.contrib.auth.models import User
from framebuzz.apps.api.models import UserVideo


def get_user_videos(username):
    ''' Returns list of videos for each user.'''
    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user).order_by('-added_on')
    return [uv.video for uv in user_videos]
