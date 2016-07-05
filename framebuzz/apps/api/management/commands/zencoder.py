import subprocess
from optparse import make_option

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = ("Actively listens for Zencoder updates using the zencoder_fetcher \
            gem.")
    option_list = BaseCommand.option_list + (
        make_option(
            '--url',
            action='store',
            dest='url',
            default=getattr(settings, 'ZENCODER_WEBHOOK_URL', None),
            help='The full URL for the notification webhook. \
                  Example: http://localhost:3333/video/notifications/'),
        make_option(
            '--count',
            action='store',
            dest='count',
            default=1,
            help='The number of objects to return from the callback. \
                  Default and typical usage is 1.'),
        make_option(
            '--key',
            action='store',
            dest='key',
            default=getattr(settings, 'ZENCODER_API_KEY', None),
            help='The API key required for authorization by ZenCoder'))

    def handle(self, **options):
        url = options['url']
        count = int(options['count'])
        key = options['key']
        call = "zencoder_fetcher --url='%s' --count=%s --loop '%s'" \
            % (url, count, key)
        print 'Launching ZenCoder Fetcher:\n\n'
        try:
            subprocess.call(call, shell=True)
        except KeyboardInterrupt:
            pass
