from django import forms
from framebuzz.apps.marketing.models import ContactRequest
from zebra.forms import StripePaymentForm


class ContactRequestForm(forms.ModelForm):
    required_css_class = 'required'

    class Meta:
        model = ContactRequest
        exclude = ('date',)



class FrameBuzzSignupForm(StripePaymentForm):
    business_name = forms.CharField(max_length=250, label='Business Name (optional)')

    def save(self, request):
        print 'save'
        pass

    def signup(self, request, user):
        profile = user.get_profile()
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.save()
