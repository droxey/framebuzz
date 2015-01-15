from django import forms
from django.contrib.auth.models import User

from framebuzz.apps.profiles.forms import UploadVideoForm
from framebuzz.apps.api.models import Video, Task, UserVideo


DEMO_USERNAMES_LIST = ['dani', 'AaronLindsey', 'ketra',]


class UploadVideoAndNotifyForm(UploadVideoForm):
    class Meta:
        model = Video
        fields = ('title', 'description', 'fpfile', 'notify_emails',)


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        exclude = ('slug',)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(TaskForm, self).__init__(*args, **kwargs)

        user_videos = UserVideo.objects.filter(user=self.request.user)
        video_ids = [uv.video.id for uv in user_videos]

        self.fields['video'].queryset = Video.objects.filter(id__in=video_ids).order_by('title')
        self.fields['assigned_to'].queryset = User.objects.filter(username__in=DEMO_USERNAMES_LIST)
        self.fields['created_by'].widget = forms.HiddenInput()
        self.fields['complete'].widget = forms.HiddenInput()

        self.fields['description'].widget = forms.Textarea(attrs={
            'rows': '3',
            'class': 'form-control'
        })
        self.fields['title'].widget = forms.TextInput(attrs={
            'placeholder': 'Enter task title...',
            'class': 'form-control input-sm'
        })

    def clean(self):
        super(TaskForm, self).clean()

        self.cleaned_data['created_by'] = self.request.user

        return self.cleaned_data
