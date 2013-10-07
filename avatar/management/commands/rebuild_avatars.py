from django.core.management.base import NoArgsCommand
from django.contrib.auth.models import User

from avatar.models import Avatar
from avatar.settings import AUTO_GENERATE_AVATAR_SIZES


class Command(NoArgsCommand):
    help = ("Regenerates avatar thumbnails for the sizes specified in "
            "settings.AUTO_GENERATE_AVATAR_SIZES.")

    def handle_noargs(self, **options):
        avatars = Avatar.objects.all().values('user__id')
        users_avs = [a['user__id'] for a in avatars]
        users_no_avs = User.objects.exclude(id__in=users_avs)

        for user in users_no_avs:
            if user.get_profile():
                user.get_profile().generate_default_avatar()

        for avatar in Avatar.objects.all():
            for size in AUTO_GENERATE_AVATAR_SIZES:
                print("Rebuilding Avatar id=%s at size %s." % (avatar.id, size))
                avatar.create_thumbnail(size)
