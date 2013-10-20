#!/usr/bin/env python
# coding: utf-8

from django.contrib import admin

from .models import IgnoredUrls, MaintenanceMode

class MaintenanceModeAdmin(admin.ModelAdmin):
    list_display = \
        ('__unicode__', 'enable_maintenance_mode', 'allow_superuser')
admin.site.register(MaintenanceMode, MaintenanceModeAdmin)


class IgnoredUrlsAdmin(admin.ModelAdmin):
    list_display = ('url',)
admin.site.register(IgnoredUrls, IgnoredUrlsAdmin)
