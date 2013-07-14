import urllib
import urlparse

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.comments.models import CommentFlag
from django.core.urlresolvers import reverse
from django.utils.hashcompat import md5_constructor
from django.utils import dateformat
from django.utils import timezone

from actstream.actions import is_following
from actstream.models import Action

from avatar.util import get_primary_avatar, get_default_avatar_url
from avatar.settings import (AVATAR_GRAVATAR_BACKUP, AVATAR_GRAVATAR_DEFAULT,
                            AVATAR_GRAVATAR_BASE_URL)
from rest_framework import serializers

from framebuzz.apps.api.models import MPTTComment, Video


class VideoSerializer(serializers.ModelSerializer):
    channel = serializers.SerializerMethodField('get_channel')
    time_hms = serializers.SerializerMethodField('get_time_hms')

    class Meta:
        model = Video
        fields = ('id', 'video_id', 'title', 'duration', 'youtube_url',
            'swf_url', 'uploaded', 'channel', 'time_hms',)

    def get_channel(self, obj):
        return '/framebuzz/video/%s' % obj.video_id

    def get_time_hms(self, obj):
        return obj.timeInHMS


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField('get_avatar_url')
    sidebar_url = serializers.SerializerMethodField('get_sidebar_url')
    channel = serializers.SerializerMethodField('get_channel')

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'username', 'email',
            'avatar_url', 'sidebar_url', 'channel',)

    def get_avatar_url(self, obj):
        avatar = get_primary_avatar(obj, size=88)
        if avatar:
            return avatar.avatar_url(88)

        if AVATAR_GRAVATAR_BACKUP:
            params = {'s': str(88)}

            if AVATAR_GRAVATAR_DEFAULT and obj:
                params['d'] = AVATAR_GRAVATAR_DEFAULT

            path = "%s/?%s" % (md5_constructor(obj.email).hexdigest(),
                                   urllib.urlencode(params))
            return urlparse.urljoin(AVATAR_GRAVATAR_BASE_URL, path)

        return get_default_avatar_url()

    def get_sidebar_url(self, obj):
        #return reverse('user-sidebar', kwargs={'username': obj.username})
        return None

    def get_channel(self, obj):
        return 'channels/user/%s' % obj.username


class BaseCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    submit_date = serializers.SerializerMethodField('get_submit_date')
    is_favorite = serializers.SerializerMethodField('get_is_favorite')
    is_flagged = serializers.SerializerMethodField('get_is_flagged')
    is_following = serializers.SerializerMethodField('get_is_following')

    def get_submit_date(self, obj):
        local_date = timezone.localtime(obj.submit_date)
        return dateformat.format(local_date, 'n/j/y h:i A')

    def get_is_favorite(self, obj):
        user = self.context.get('user')

        if user and user.id != obj.user.id:
            is_favorite = Action.objects.actor(user, 
                verb='added to favorites', 
                action_object_object_id=obj.id)
            return len(is_favorite) > 0

        return False

    def get_is_flagged(self, obj):
        user = self.context.get('user')

        if user and user.id != obj.user.id:
            flags = CommentFlag.objects.filter(comment=obj, user=user, 
                flag = CommentFlag.SUGGEST_REMOVAL)
            return len(flags) > 0

        return False

    def get_is_following(self, obj):
        user = self.context.get('user')

        if user and user.id != obj.user.id:
            return is_following(user, obj.user)

        return False


class MPTTCommentReplySerializer(BaseCommentSerializer):
    class Meta:
        model = MPTTComment
        depth = 2
        fields = ('id', 'user', 'comment', 'submit_date',
            'is_favorite', 'is_flagged', 'is_following', 'is_visible',)


class MPTTCommentSerializer(BaseCommentSerializer):
    content_object = VideoSerializer(read_only=True)
    replies = MPTTCommentReplySerializer(source='get_children', read_only=True)
    comment = serializers.WritableField(source='comment')
    parent = serializers.PrimaryKeyRelatedField(source='parent', required=False)
    time_hms = serializers.SerializerMethodField('get_time_hms')

    class Meta:
        model = MPTTComment
        depth = 4
        fields = ('id', 'user', 'comment', 'parent', 'submit_date',
            'content_object', 'replies', 'time_hms', 'time', 'is_favorite',
            'is_flagged', 'is_following', 'is_visible', 'has_hidden_siblings',)

    def get_time_hms(self, obj):
        return obj.timeInHMS