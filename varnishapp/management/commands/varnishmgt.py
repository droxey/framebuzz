from pprint import pprint

from django.core.management.base import BaseCommand

from ...manager import manager


class Command(BaseCommand):
    def handle(self, *args, **options):
        if args:
            pprint(manager.run(*args))
        else:
            print manager.help()
