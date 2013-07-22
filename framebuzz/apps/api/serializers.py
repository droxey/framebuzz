import urllib
import urlparse

from django.contrib.auth.models import User, AnonymousUser
from django.contrib.comments.models import CommentFlag
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
        fields = ('id', 'video_id', 'title', 'duration', 'swf_url', 'time_hms',)

    def get_channel(self, obj):
        return '/framebuzz/video/%s' % obj.video_id

    def get_time_hms(self, obj):
        return obj.timeInHMS


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField('get_avatar_url')

    class Meta:
        model = User
        fields = ('id', 'username', 'avatar_url',)

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


class BaseCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    submit_date = serializers.SerializerMethodField('get_submit_date')
    is_favorite = serializers.SerializerMethodField('get_is_favorite')
    is_flagged = serializers.SerializerMethodField('get_is_flagged')
    is_following = serializers.SerializerMethodField('get_is_following')

    def get_submit_date(self, obj):
        if obj.submit_date:
            local_date = timezone.localtime(obj.submit_date)
            return dateformat.format(local_date, 'n/j/y h:i A')

    def get_is_favorite(self, obj):
        user = self.context.get('user')

        if user and user.id != obj.user.id and not isinstance(user, AnonymousUser):
            is_favorite = Action.objects.actor(user, 
                verb='added to favorites', 
                action_object_object_id=obj.id)
            return len(is_favorite) > 0

        return False

    def get_is_flagged(self, obj):
        user = self.context.get('user')

        if user and user.id != obj.user.id and not isinstance(user, AnonymousUser):
            flags = CommentFlag.objects.filter(comment=obj, user=user, 
                flag = CommentFlag.SUGGEST_REMOVAL)
            return len(flags) > 0

        return False

    def get_is_following(self, obj):
        user = self.context.get('user')

        if user and user.id != obj.user.id and not isinstance(user, AnonymousUser):
            return is_following(user, obj.user)

        return False


class MPTTCommentReplySerializer(BaseCommentSerializer):
    parent_id = serializers.SerializerMethodField('get_parent_id')

    class Meta:
        model = MPTTComment
        depth = 2
        fields = ('id', 'user', 'comment', 'submit_date',
            'is_favorite', 'is_flagged', 'is_following', 'is_visible', 'parent_id',)

    def get_parent_id(self, obj):
        return obj.parent.id


class MPTTCommentSerializer(BaseCommentSerializer):
    replies = MPTTCommentReplySerializer(source='get_children', read_only=True)
    comment = serializers.WritableField(source='comment')
    parent = serializers.PrimaryKeyRelatedField(source='parent', required=False)
    time_hms = serializers.SerializerMethodField('get_time_hms')

    class Meta:
        model = MPTTComment
        depth = 4
        fields = ('id', 'user', 'comment', 'parent', 'submit_date',
                  'replies', 'time_hms', 'time', 'is_favorite',
                  'is_flagged', 'is_following', 'is_visible', 'has_hidden_siblings',)

    def get_time_hms(self, obj):
        return obj.timeInHMS

class ActionSerializer(serializers.ModelSerializer):
    pass