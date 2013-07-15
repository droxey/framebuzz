from django import forms
from django.contrib.comments.forms import CommentForm
from framebuzz.apps.api.models import MPTTComment


class MPTTCommentForm(CommentForm):
    parent = forms.ModelChoiceField(queryset=MPTTComment.objects.all(), required=False, widget=forms.HiddenInput)
    time = forms.CharField(max_length=10, required=False, widget=forms.HiddenInput())

    def __init__(self, *args, **kwargs):
        super(MPTTCommentForm, self).__init__(*args, **kwargs)
        self.fields["email"].required = False
        self.fields["url"].required = False
        self.fields["name"].required = False
        self.fields["timestamp"].required = False
        self.fields["security_hash"].required = False

    def get_comment_model(self):
        # Use our custom comment model instead of the built-in one.
        return MPTTComment

    def get_comment_create_data(self):
        # Use the data of the superclass, and add in the parent field field
        data = super(MPTTCommentForm, self).get_comment_create_data()
        data['parent'] = self.cleaned_data['parent']
        data['time'] = float(self.cleaned_data['time'])
        return data

    def clean_timestamp(self):
        pass

    def clean_security_hash(self):
        pass