from django.core.management.base import NoArgsCommand
from django.contrib.auth.models import User

from actstream import action
from actstream.models import Action
from framebuzz.apps.api.models import UserVideo

class Command(NoArgsCommand):
    help = ("Regenerates avatar thumbnails for the sizes specified in "
            "settings.AUTO_GENERATE_AVATAR_SIZES.")

    def handle_noargs(self, **options):
        comments_no_target = Action.objects.filter(verb='commented on', target_object_id=None)
        for a in comments_no_target:
            a.target_object_id = a.action_object.content_object.id
            a.save()

        print 'INFO: Added target to %s actions!' % str(len(comments_no_target))

        user_videos_with_action = Action.objects.filter(verb='added video to library').values('target_object_id')
        uva_ids = [uva['target_object_id'] for uva in user_videos_with_action]
        user_videos = UserVideo.objects.exclude(id__in=uva_ids)
        
        for uv in user_videos:
            action.send(uv.user,
                verb='added video to library',
                action_object=uv.video,
                target=uv,
                timestamp=uv.added_on)

        print 'INFO: Added action for %s library items!' % str(len(user_videos))