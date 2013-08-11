from django import forms
from django.db import models
from timezone_field import TimeZoneFormField
from django.contrib.auth.models import User
from framebuzz.apps.api.models import Website, UserProfile, UserWebsite
from allauth.account.forms import SignupForm, LoginForm
from allauth.account.utils import *

# Dashboard Registration Form
class DashboardSignupForm(SignupForm):
    website_name = forms.CharField(max_length=255,widget=forms.TextInput(attrs={'placeholder': 'Website name'}))
    website_url = forms.URLField('URL', required=True, widget=forms.TextInput(attrs={'placeholder': 'Website address'}))
    objects = SignupForm()
            
    class Meta:
        fields = ('username', 'email', 'password1', 'password2', 'website_name', 'website_url')
    
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request')
        super(DashboardSignupForm, self).__init__(*args, **kwargs)
        
    def save(self, commit=True):
        new_user = super(DashboardSignupForm, self).save(request=self.request)
        
        new_website = Website()
        new_website.url = self.cleaned_data['website_url']
        new_website.name = self.cleaned_data['website_name']
        new_website.user = new_user
        new_website.moderator_email = new_user.email
        new_website.save()
        
        new_user_website = UserWebsite()
        new_user_website.user = new_user
        new_user_website.website = new_website
        new_user_website.save()
        
        # Save Userprofile-Website
        profile = new_user.get_profile()
        profile.websites.add(new_user_website)
        profile.save()
        

# Dashboard Profile Form
class UserProfileForm(forms.ModelForm):
    latitude = forms.CharField(widget=forms.HiddenInput(), required=False)
    longitude = forms.CharField(widget=forms.HiddenInput(), required=False)
    bio = forms.CharField(widget=forms.Textarea, required=False)
    birthday = forms.DateField(widget=forms.DateInput(format = '%m/%d/%Y'), input_formats=('%m/%d/%Y',))

    
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
        
        if latitude:
            profile.latitude = float(latitude)
        else:
            profile.latitude = 0
            
        if longitude:
            profile.longitude = float(longitude)
        else:
            profile.longitude = 0
        
        profile.location = self.cleaned_data.get('location', None)
        profile.birthday = self.cleaned_data.get('birthday', None)
        profile.profession = self.cleaned_data.get('profession', None)
        profile.user = user
        print profile
        profile.save()
    


# Website Form
class WebsiteForm(forms.ModelForm):
    class Meta:
        model = Website

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request')
        super(WebsiteForm, self).__init__(*args, **kwargs)
        
    def save(self, commit=True):
        user = self.request.user
        
        # Save Website
        new_website = Website()
        new_website.url = self.cleaned_data.get('url', None)
        new_website.name = self.cleaned_data.get('name', None)
        new_website.moderator_email = self.cleaned_data.get('moderator_email', None)
        new_website.youtube_api_key = self.cleaned_data.get('youtube_api_key', None)
        new_website.user = user
        new_website.save()

        # Save User-Website
        new_user_website = UserWebsite()
        new_user_website.user = user
        new_user_website.website = new_website
        new_user_website.save()
        
        # Save Userprofile-Website
        profile = user.get_profile()
        profile.websites.add(new_user_website)
        profile.save()
