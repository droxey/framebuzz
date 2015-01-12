from django import forms
from framebuzz.apps.profiles.forms import UploadVideoForm
from framebuzz.apps.api.models import Video, Task


class UploadVideoAndNotifyForm(UploadVideoForm):
    class Meta:
        model = Video
        fields = ('title', 'description', 'fpfile', 'notify_emails',)


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        exclude = ('slug',)
