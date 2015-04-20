from django import forms
from framebuzz.apps.marketing.models import ContactRequest
from zebra.forms import StripePaymentForm


class ContactRequestForm(forms.ModelForm):
    required_css_class = 'required'

    class Meta:
        model = ContactRequest
        exclude = ('date',)



class FrameBuzzSignupForm(StripePaymentForm):

    def __init__(self, *args, **kwargs):
        super(FrameBuzzSignupForm, self).__init__(*args, **kwargs)

    def save(self, request):
        print 'save'
        pass

    def signup(self, request, user):
        print request.raw_post_data
        print 'signup'
        super(FrameBuzzSignupForm, self).signup(request, user)
        pass
