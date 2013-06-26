import datetime, pytz, redis

from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site
from django.utils import timezone

from rest_framework import generics, permissions, renderers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

from actstream import action
from actstream.models import Action, Follow, actor_stream, followers, following
from actstream.actions import follow, unfollow
from pure_pagination import Paginator, EmptyPage, PageNotAnInteger
from templated_email import send_templated_mail

from framebuzz.apps.api.models import MPTTComment, Video
from framebuzz.apps.api.serializers import MPTTCommentSerializer, CommentActionSerializer
from framebuzz.apps.api.utils import get_client_ip


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'comments': reverse('mpttcomments-list', request=request, format=format),
    })


class CommentActionList(generics.ListCreateAPIView):
    serializer_class = CommentActionSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        '''
            Filters the list based on the provided username,
            or the provided comment id.
        '''
        username = self.kwargs.get('username', None)
        comment_id = self.kwargs.get('comment_id', None)

        if username:
            user = User.objects.get(username__iexact = username)
            return Action.objects.filter(actor_object_id = user.id)

        if comment_id:
            return Action.objects.filter(target_object_id = comment_id)

        return Action.objects.all()


class MPTTCommentList(generics.ListCreateAPIView):
    serializer_class = MPTTCommentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        '''
            Filters the list based on the provided video_id.
        '''
        video_id = self.kwargs.get('video_id', None)
        if video_id:
            video = Video.objects.get(video_id=video_id)
            return MPTTComment.objects.filter(object_pk=video.id, parent=None)

        return MPTTComment.objects.all()

    def pre_save(self, obj):
        '''
            Save details about the comment that aren't required
            by API consumers to provide, but required in the model.
        '''
        video_id = self.kwargs.get('video_id', None)

        if video_id:
            obj.user = self.request.user
            obj.content_type = ContentType.objects.get(app_label='api', model='video')
            obj.content_object = Video.objects.get(video_id__exact=video_id)
            obj.ip_address = get_client_ip(self.request)
            obj.site = Site.objects.get(name__iexact='FrameBuzz')

            utc = pytz.UTC
            utc_submit_date = datetime.datetime.now(utc)
            obj.submit_date = utc_submit_date.replace(tzinfo=pytz.UTC)

    def post_save(self, obj, created=False):
        '''
            Sends a signal to django-activity-stream that the user
            posted a comment. Also publishes the comment to subscribers.
        '''
        r = redis.StrictRedis(host='localhost', port=6379, db=0)

        if obj.parent == None:
            action.send(user, verb='commented on', action_object=obj.content_object)
        else:
            action.send(user, verb='replied to comment', action_object=obj.parent, target=obj.content_object)

            # Send a email notification to the thread's owner that someone has replied to their comment.
            if obj.parent.user.username != user.username:
                if obj.parent.user.email:
                    send_templated_mail(
                        template_name='reply-notification',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[obj.parent.user.email],
                        context={
                            'comment':obj,
                            'site': obj.site
                        })

                # Publish to Redis notifications channel.
                user_channel = 'channels/user/%s' % obj.parent.user.username
                #reply_serializer = MPTTCommentReplySerializer(comment)
                #reply_serialized = JSONRenderer().render(reply_serializer.data)
                #reply_response = action_response('new_comment_reply', json.loads(reply_serialized), user_channel)
                #r.publish(user_channel, reply_response)

        # Publish to Redis video channel.
        #channel = 'channels/video/%s' % video.video_id
        #response = action_response('reload_video_content', data, channel)
        #r.publish(channel, response)

def view_content(request):
    pass