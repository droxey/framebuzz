from django import forms
from timezone_field import TimeZoneFormField

from framebuzz.apps.api.models import UserProfile, UserWebsite, UserVideo
from framebuzz.apps.api.backends.youtube import get_or_create_video


class UserProfileForm(forms.ModelForm):
    latitude = forms.CharField(widget=forms.HiddenInput(), required=False)
    longitude = forms.CharField(widget=forms.HiddenInput(), required=False)
    bio = forms.CharField(widget=forms.Textarea, required=False)
    birthday = forms.DateField(widget=forms.DateInput(format = '%m/%d/%Y'), input_formats=('%m/%d/%Y',))
    time_zone = TimeZoneFormField(required=False, label='Time Zone')
    website = forms.URLField(required=False, label='Website')
    
    class Meta:
        model = UserProfile
        exclude = ('premium', 'websites', 'user', 'youtube_username', )
    
    def __init__(self, *args, **kwargs ):
        self.request = kwargs.pop('request')
        super(UserProfileForm, self).__init__(*args, **kwargs)
 
    def save(self, commit=True):
        user = self.request.user
        
        profile = user.get_profile()
        profile.bio = self.cleaned_data.get('bio', None)
        profile.time_zone = self.cleaned_data.get('time_zone', None)
        latitude = self.cleaned_data.get('latitude', None)        
        longitude = self.cleaned_data.get('longitude', None)
        
        if latitude and latitude is not None and latitude != '':
            profile.latitude = float(latitude)
        else:
            profile.latitude = 0
            
        if longitude and longitude is not None and longitude != '':
            profile.longitude = float(longitude)
        else:
            profile.longitude = 0
        
        profile.location = self.cleaned_data.get('location', None)
        profile.birthday = self.cleaned_data.get('birthday', None)
        profile.profession = self.cleaned_data.get('profession', None)
        profile.user = user
        profile.save()


class AddVideoForm(forms.ModelForm):
    video_id = forms.CharField(label='Video URL')

    class Meta:
        model = UserVideo
        fields = ('video_id', 'is_featured',)
        exclude = ('user', 'video',)

    def __init__(self, *args, **kwargs ):
        self.request = kwargs.pop('request', None)
        super(AddVideoForm, self).__init__(*args, **kwargs)

        self.fields['is_featured'].label = 'Feature this video on your profile?'

    def save(self, commit=True):
        video_id = self.cleaned_data.get('video_id', None)
        
        if video_id and self.request:
            video, created = get_or_create_video(video_id)
            user_video = UserVideo()
            user_video.user = self.request.user
            user_video.video = video
            user_video.is_featured = self.cleaned_data.get('is_featured', False)
            user_video.save()