from django.db.models import Q

from framebuzz.apps.api.models import Video
from framebuzz.apps.profiles.forms import AddVideoForm, UploadVideoForm


def dashboard(request):
    form = AddVideoForm(request=request)
    upload_form = UploadVideoForm(request=request)
    pending_uploads = Video.objects.exclude(
        Q(Q(fp_url=None) | Q(job_id=None))).filter(
            added_by=request.user, processing=True)

    return {
        'form': form,
        'pending_uploads': pending_uploads,
        'upload_form': upload_form,
    }
