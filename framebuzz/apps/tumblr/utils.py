from django.contrib.auth.models import User
from framebuzz.apps.api.models import UserVideo


def get_user_videos(username):
    ''' Returns list of videos for each user.'''
    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user).order_by('-added_on')
    return [uv.video for uv in user_videos]


def encoded_dict(in_dict):
    ''' Ensures that all data in :in_dict: is encoded into str using UTF-8,
        for use with the urllib and urlencode. '''
    out_dict = {}
    for k, v in in_dict.iteritems():
        if isinstance(v, unicode):
            v = v.encode('utf8')
        elif isinstance(v, str):
            v.decode('utf8')
        out_dict[k] = v
    return out_dict
