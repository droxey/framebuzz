#!/usr/bin/env python
# coding: utf-8

from django.conf import settings

MAINTENANCE_MODE = getattr(settings, 'MAINTENANCE_MODE', False)
MAINTENANCE_IGNORE_URLS = getattr(settings, 'MAINTENANCE_IGNORE_URLS', ())
MAINTENANCE_ALLOW_SU = getattr(settings, 'MAINTENANCE_ALLOW_SU',  False)
