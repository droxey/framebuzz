from actstream import action

from django import forms
from django.db import IntegrityError

from framebuzz.apps.api.models import UserProfile, UserVideo, Video
from framebuzz.apps.api.backends.youtube import get_or_create_video


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('display_name', 'location', 'tagline', 'bio')

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(UserProfileForm, self).__init__(*args, **kwargs)
        self.fields['bio'].widget = forms.Textarea(attrs={'cols':'38', 'rows':'5'})
        self.fields['tagline'].widget = forms.Textarea(attrs={'cols':'38', 'rows':'5'})


class AddVideoForm(forms.ModelForm):
    video_id = forms.CharField(label='Video URL')

    class Meta:
        model = UserVideo
        fields = ('video_id',)
        exclude = ('user', 'video', 'is_featured',)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(AddVideoForm, self).__init__(*args, **kwargs)

    def clean(self):
        video_id = self.cleaned_data.get('video_id', None)

        try:
            if video_id and self.request:
                video, created = get_or_create_video(video_id)
                user_video = UserVideo()
                user_video.user = self.request.user
                user_video.video = video
                user_video.is_featured = False
                user_video.save()

                action.send(self.request.user,
                            verb='added video to library',
                            action_object=video,
                            target=user_video)
        except IntegrityError:
            raise forms.ValidationError(
                'This video is already in your library!')

        return self.cleaned_data


class UploadVideoForm(forms.ModelForm):
    class Meta:
        model = Video
        fields = ('title', 'description', 'webm_url', 'mp4_url',)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(UploadVideoForm, self).__init__(*args, **kwargs)

    def clean(self):
        return self.cleaned_data
