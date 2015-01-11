import caching.base

from django.contrib.auth.models import User
from django.conf import settings
from django.db import models

from framebuzz.apps.api.models import Video

from randomslugfield import RandomSlugField


class Task(caching.base.CachingMixin, models.Model):
    slug = RandomSlugField(length=settings.RANDOMSLUG_LENGTH)
    title = models.CharField(max_length=500)
    description = models.TextField(null=True, blank=True)
    complete = models.BooleanField(default=False)
    created_on = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, related_name='task_created_by')
    due_on = models.DateTimeField(blank=True, null=True)
    assigned_to = models.ForeignKey(User, blank=True, null=True, related_name='task_assigned_to')
    video = models.ForeignKey(Video, blank=True, null=True)

    class Meta:
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
