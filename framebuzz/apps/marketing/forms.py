from django import forms
from framebuzz.apps.marketing.models import ContactRequest


class ContactRequestForm(forms.ModelForm):
    class Meta:
        model = ContactRequest
        exclude = ('date',)
