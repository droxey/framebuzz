from django import forms
from timezone_field import TimeZoneFormField
from framebuzz.apps.api.models import UserProfile, UserWebsite


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
 
    def save(self, commit=True ):
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