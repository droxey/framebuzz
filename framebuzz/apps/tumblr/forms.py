import datetime
import django_filepicker

from django import forms
from django.conf import settings
from django.contrib.auth.models import User

from framebuzz.apps.api.models import Video
from framebuzz.apps.api.backends.tasks import start_zencoder_job
from framebuzz.apps.tumblr.tasks import submit_to_tumblr


class TumblrUploadForm(forms.ModelForm):
    ''' This form handles the following video upload workflow:
        1. User selects Video file to upload, and submits the form.
        2. System intercepts file and kicks off saving and processing.
        3. Once processing completes, submit Video to the user's Tumblr. '''
    fpfile = django_filepicker.forms.FPFileField()

    class Meta:
        model = Video
        fields = ('title', 'description', 'fpfile',)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(TumblrUploadForm, self).__init__(*args, **kwargs)
        # Tweak the visual aspects of the form to match our mocks.
        self.fields['title'].widget = forms.TextInput(attrs={
            'placeholder': 'Enter video title...',
            'class': 'form-control'
        })
        self.fields['description'].widget = forms.Textarea(attrs={
            'placeholder': 'Enter a description for the video...',
            'class': 'form-control'
        })
        fp_attrs = self.fields['fpfile'].widget.attrs
        fp_attrs['data-fp-mimetypes'] = ''
        fp_attrs['data-fp-button-class'] = 'btn btn-large btn-info'
        fp_attrs['data-fp-button-text'] = settings.FP_BUTTON_TEXT
        fp_attrs['data-fp-services'] = settings.FP_SERVICES
        fp_attrs['data-fp-extensions'] = settings.FP_EXTENSIONS
        fp_attrs['data-fp-drag-text'] = settings.FP_DRAG_TEXT

    def save(self, commit=True):
        fpfile = self.cleaned_data.get('fpfile', None)
        title = self.cleaned_data.get('title', None)
        description = self.cleaned_data.get('description', None)
        url = self.request.POST['fpfile'] or None
        # Save video details.
        vid = Video()
        vid.title = title
        vid.description = description
        vid.added_by = self.request.user
        vid.processing = True
        vid.uploaded = datetime.datetime.now()
        vid.filename = fpfile.name or None
        vid.fp_url = url
        vid.submit_to_tumblr = True
        vid.save()
        # Slug is generated on first save, so we need to save once more.
        vid.video_id = vid.slug
        vid.save()
        # Send the file to ZenCoder for processing.
        if fpfile:
            start_zencoder_job.apply_async(args=[vid.fp_url, vid.filename])
        return vid
