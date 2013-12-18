from django.core.management.base import NoArgsCommand
from django.contrib.auth.models import User

from actstream.actions import follow
from actstream.models import Follow


class Command(NoArgsCommand):
    help = ("Fixes the following setting for users.")

    def handle_noargs(self, **options):
        users = User.objects.exclude(username__iexact='framebuzz')
        fbz_user = User.objects.get(username__iexact='framebuzz')

        now_following_fbz = []
        fbz_now_following = []

        for user in users:
            if not Follow.objects.is_following(user, fbz_user):
                follow(user, fbz_user)
                now_following_fbz.append(user.username)
            if not Follow.objects.is_following(fbz_user, user):
                follow(fbz_user, user)
                fbz_now_following.append(user.username)

        print '%s users now following framebuzz: %s' % (len(now_following_fbz), ', '.join(now_following_fbz))
        print 'framebuzz now following %s users: %s' % (len(fbz_now_following), ', '.join(fbz_now_following))