from framebuzz.apps.profiles.forms import UploadVideoForm


class UploadVideoAndNotifyForm(UploadVideoForm):
    class Meta:
        fields = ('title', 'description', 'fpfile', 'notify_emails',)
