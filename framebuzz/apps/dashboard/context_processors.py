from framebuzz.apps.profiles.forms import AddVideoForm, UploadVideoForm
from framebuzz.apps.api.utils import get_pending_uploads


def dashboard(request):
    if request.user.is_authenticated():
        form = AddVideoForm(request=request)
        upload_form = UploadVideoForm(request=request)
        pending_uploads = get_pending_uploads(request.user.username)

        return {
            'form': form,
            'pending_uploads': pending_uploads,
            'upload_form': upload_form,
        }
    else:
        return {}
