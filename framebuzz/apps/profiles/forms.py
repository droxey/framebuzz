from actstream import action

from django import forms
from django.db import IntegrityError

from framebuzz.apps.api.models import UserProfile, UserVideo
from framebuzz.apps.api.backends.youtube import get_or_create_video


class UserProfileForm(forms.ModelForm):
    pk = forms.IntegerField(required=True)
    name = forms.CharField(max_length=15, required=True)
    value = forms.CharField(max_length=500, required=True)

    class Meta:
        model = UserProfile
        fields = ('value', 'name', 'pk',)

    def save(self, commit=True):
        pk = self.cleaned_data['pk']
        name = self.cleaned_data['name']
        value = self.cleaned_data['value']
        profile = UserProfile.objects.get(pk=pk)

        if name == 'bio':
            profile.bio = value

        if name == 'tagline':
            profile.tagline = value

        if name == 'display_name':
            profile.display_name = value

        if name == 'location':
            profile.location = value

        profile.save()
        return profile


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
