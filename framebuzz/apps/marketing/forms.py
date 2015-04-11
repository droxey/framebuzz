from django import forms
from framebuzz.apps.marketing.models import ContactRequest


class ContactRequestForm(forms.ModelForm):
    required_css_class = 'required'

    class Meta:
        model = ContactRequest
        exclude = ('date',)
