import datetime
import django_filepicker

from actstream import action

from django import forms
from django.contrib.auth.models import User
from django.db import IntegrityError

from framebuzz.apps.api.models import UserProfile, UserVideo, Video
from framebuzz.apps.api.backends.youtube import get_or_create_video
from framebuzz.apps.api.backends.tasks import start_zencoder_job


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('display_name', 'location', 'tagline', 'bio')

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(UserProfileForm, self).__init__(*args, **kwargs)
        self.fields['bio'].widget = forms.Textarea(attrs={
            'cols': '38',
            'rows': '5'
        })
        self.fields['tagline'].widget = forms.Textarea(attrs={
            'cols': '38',
            'rows': '5'
        })


class AddVideoForm(forms.ModelForm):
    video_id = forms.CharField(label='Video URL')

    class Meta:
        model = UserVideo
        fields = ('video_id',)
        exclude = ('user', 'video', 'is_featured',)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(AddVideoForm, self).__init__(*args, **kwargs)

    def clean(self):
        video_id = self.cleaned_data.get('video_id', None)

        try:
            if video_id and self.request:
                video, created = get_or_create_video(video_id)
                user_video = UserVideo()
                user_video.user = self.request.user
                user_video.video = video
                user_video.is_featured = False
                user_video.save()

                action.send(self.request.user,
                            verb='added video to library',
                            action_object=video,
                            target=user_video)
        except IntegrityError:
            raise forms.ValidationError(
                'This video is already in your library!')

        return self.cleaned_data


class UploadVideoForm(forms.ModelForm):
    fpfile = django_filepicker.forms.FPUrlField()
    fpname = forms.CharField(max_length=500)

    class Meta:
        model = Video
        fields = ('title', 'description', 'fpfile',)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(UploadVideoForm, self).__init__(*args, **kwargs)
        self.fields['title'].widget = forms.TextInput(attrs={
            'placeholder': 'Enter video title...'
        })
        self.fields['description'].widget = forms.Textarea(attrs={
            'placeholder': 'Enter a description for the video...'
        })

        self.fields['fpfile'].widget.attrs['data-fp-mimetypes'] = ''
        self.fields['fpfile'].widget.attrs['data-fp-button-text'] = \
            '<i class="fa fa-cloud-upload"></i><br>Select File...'
        self.fields['fpfile'].widget.attrs['data-fp-button-class'] = \
            'btn btn-large btn-success'
        self.fields['fpfile'].widget.attrs['data-fp-services'] = \
            'COMPUTER,VIDEO,BOX,DROPBOX,GOOGLE_DRIVE,URL,FTP'
        self.fields['fpfile'].widget.attrs['data-fp-extensions'] = \
            '3g2,3gp,3gp2,3gpp,3gpp2,ac3,eac3,ec3,f4a,f4b,f4v,flv,highwinds,' \
            'm4a,m4b,m4r,m4v,mkv,mov,mp4,oga,ogv,ogx,ts,webm,wma,wmv,mpg,avi'
        self.fields['fpfile'].widget.attrs['data-fp-drag-text'] = \
            'Drag and drop your video files here.<br>Or, click ' \
            '<strong>Select File...</strong>' \
            ' to upload videos from Dropbox, Google Drive, and more!'

    def save(self, commit=True):
        fpfile = self.cleaned_data.get('fpfile', None)
        title = self.cleaned_data.get('title', None)
        description = self.cleaned_data.get('description', None)

        user = User.objects.get(username__iexact=self.request.user.username)

        vid = Video()
        vid.title = title
        vid.description = description
        vid.added_by = user
        vid.processing = True
        vid.uploaded = datetime.datetime.now()
        vid.filename = fpfile.name or None
        vid.fpfile = self.request.POST['fpfile']
        vid.save()

        if fpfile:  # Send it to ZenCoder!
            start_zencoder_job.apply_async(args=[
                self.request.user.username,
                vid.title,
                vid.description,
                vid.file_url,
                vid.filename
            ])
