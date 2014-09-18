from django import forms
from framebuzz.apps.profiles.forms import UploadVideoForm
from framebuzz.apps.api.models import Video


class UploadVideoAndNotifyForm(UploadVideoForm):
    class Meta:
        model = Video
        fields = ('title', 'description', 'fpfile', 'notify_emails',)
