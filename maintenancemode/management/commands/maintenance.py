#!/usr/bin/env python
# coding: utf-8

from django.core.management.base import BaseCommand, CommandError

from maintenancemode.models import MaintenanceMode

class Command(BaseCommand):
    args = '<maintenance_id> (on|off)'
    help = 'Toggle maintenance mode on or off'

    def _list_modes(self):
        self.stderr.write('Available maintenance modes:\n')
        for available in MaintenanceMode.objects.all():
            self.stderr.write(str(available.pk) + '. ' + str(available) + '\n')

    def handle(self, *args, **options):
        if len(args) == 1 and args[0] == 'list':
            self._list_modes()
            return

        if len(args) < 2:
            raise CommandError(
                'invalid arguments\n'
                'maintenance list\n'
                'maintenance %s' % self.args)

        pk = args[0]
        state = args[1]

        try:
            mm = MaintenanceMode.objects.get(pk=pk)
        except MaintenanceMode.DoesNotExist:
            self._list_modes()
            raise CommandError('invalid maintenance id')
        mm.enable_maintenance_mode = (state == 'on')
        mm.save()

