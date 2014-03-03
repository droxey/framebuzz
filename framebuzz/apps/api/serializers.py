from django.contrib.auth.models import User, AnonymousUser
from django.contrib.comments.models import CommentFlag
from django.utils import dateformat
from django.utils import timezone
from django.utils.html import urlize

from actstream.actions import is_following
from actstream.models import Action
from avatar.util import get_primary_avatar, get_default_avatar_url
from rest_framework import serializers

from framebuzz.apps.api.models import MPTTComment, Video, UserVideo


class VideoSerializer(serializers.ModelSerializer):
    channel = serializers.SerializerMethodField('get_channel')
    time_hms = serializers.SerializerMethodField('get_time_hms')
    embed_code = serializers.SerializerMethodField('get_embed_code')
    embed_url = serializers.SerializerMethodField('get_embed_url')
    share_url = serializers.SerializerMethodField('get_share_url')

    class Meta:
        model = Video
        fields = ('id', 'video_id', 'title', 'duration',
                  'time_hms', 'embed_code', 'embed_url', 'share_url',
                  'mp4_url', 'webm_url', 'slug',)

    def get_channel(self, obj):
        return '/framebuzz/video/%s' % obj.slug

    def get_time_hms(self, obj):
        return obj.timeInHMS

    def get_embed_code(self, obj):
        return str(obj.embed_code())

    def get_embed_url(self, obj):
        return '%s?close=true' % obj.get_absolute_url()

    def get_share_url(self, obj):
        return obj.get_share_url()


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField('get_avatar_url')
    profile_url = serializers.SerializerMethodField('get_profile_url')
    video_in_library = serializers.SerializerMethodField('get_video_in_library')
    display_name = serializers.SerializerMethodField('display_name')

    class Meta:
        model = User
        fields = ('id', 'username', 'avatar_url',
                  'video_in_library', 'profile_url',)

    def get_profile_url(self, obj):
        return obj.get_profile().get_absolute_url()

    def get_avatar_url(self, obj):
        avatar = get_primary_avatar(obj, size=66)
        if avatar:
            return avatar.avatar_url(66)
        return get_default_avatar_url()

    def get_video_in_library(self, obj):
        if self.context is not None:
            video = self.context.get('video', None)
            if video:
                user_video = UserVideo.objects.filter(user=obj, video=video)
                return len(user_video) == 1
            return False

    def get_display_name(self, obj):
        return obj.get_profile().display_name or user.username


class BaseCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    submit_date = serializers.SerializerMethodField('get_submit_date')
    is_favorite = serializers.SerializerMethodField('get_is_favorite')
    is_flagged = serializers.SerializerMethodField('get_is_flagged')
    is_following = serializers.SerializerMethodField('get_is_following')
    is_visible = serializers.SerializerMethodField('get_is_visible')
    comment = serializers.SerializerMethodField('get_comment')

    def get_submit_date(self, obj):
        if obj.submit_date:
            local_date = timezone.localtime(obj.submit_date)
            return dateformat.format(local_date, 'n/j/y h:i A')

    def get_is_favorite(self, obj):
        user = self.context.get('user', None)

        if user and user.id != obj.user.id and not isinstance(user, AnonymousUser):
            is_favorite = Action.objects.actor(user,
                                               verb='added to favorites',
                                               action_object_object_id=obj.id)
            return len(is_favorite) > 0

        return False

    def get_is_flagged(self, obj):
        user = self.context.get('user', None)

        if user and user.id != obj.user.id and not isinstance(user, AnonymousUser):
            flags = CommentFlag.objects.filter(comment=obj, user=user,
                                               flag=CommentFlag.SUGGEST_REMOVAL)
            return len(flags) > 0

        return False

    def get_is_following(self, obj):
        user = self.context.get('user')

        if user and user.id != obj.user.id and not isinstance(user, AnonymousUser):
            return is_following(user, obj.user)

        return False

    def get_comment(self, obj):
        return urlize(obj.comment, trim_url_limit=None, nofollow=True) \
            .replace('<a ', '<a target="_blank" ')

    def get_is_visible(self, obj):
        user = self.context.get('user', None)
        if user and user.id == obj.user.id and not isinstance(user, AnonymousUser):
            return True
        return obj.is_visible


class MPTTCommentReplySerializer(BaseCommentSerializer):
    parent_id = serializers.SerializerMethodField('get_parent_id')

    class Meta:
        model = MPTTComment
        depth = 2
        fields = ('id', 'user', 'comment', 'submit_date',
                  'is_favorite', 'is_flagged', 'is_following',
                  'is_visible', 'parent_id',)

    def get_parent_id(self, obj):
        return obj.parent.id


class MPTTCommentSerializer(BaseCommentSerializer):
    replies = MPTTCommentReplySerializer(source='get_children', read_only=True)
    parent = serializers.PrimaryKeyRelatedField(source='parent', required=False)
    time_hms = serializers.SerializerMethodField('get_time_hms')
    has_replies = serializers.SerializerMethodField('get_has_replies')
    thread_url = serializers.SerializerMethodField('get_thread_url')

    class Meta:
        model = MPTTComment
        depth = 4
        fields = ('id', 'user', 'comment', 'parent', 'submit_date',
                  'hidden_by_id', 'replies', 'time_hms', 'time', 'is_favorite',
                  'has_replies', 'thread_url', 'is_flagged', 'is_following',
                  'is_visible', 'has_hidden_siblings',)

    def get_time_hms(self, obj):
        return obj.timeInHMS

    def get_has_replies(self, obj):
        return len(obj.get_children()) > 0

    def get_thread_url(self, obj):
        return obj.get_absolute_url()
