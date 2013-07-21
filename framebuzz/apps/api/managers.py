from django.db.models import Q

from actstream.managers import ActionManager, stream


class FrameBuzzActionManager(ActionManager):

    @stream
    def video_state_stream(self, obj):
        return obj.action_object_actions.filter(Q(verb='started watching video') | Q(verb='paused video') | Q(verb='exited video'))

    @stream
    def favorite_comments_stream(self, obj):
        return obj.actor_actions.filter(verb='added to favorites')
