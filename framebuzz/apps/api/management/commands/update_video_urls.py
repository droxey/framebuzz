from django.core.management.base import NoArgsCommand

from framebuzz.apps.api.tasks import update_video_urls

class Command(NoArgsCommand):
    help = ("Regenerates the direct YouTube urls.")

    def handle_noargs(self, **options):
        update_video_urls()
