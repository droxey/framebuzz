from django import forms
from django.db import models
from framebuzz.apps.api.models import Website
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
