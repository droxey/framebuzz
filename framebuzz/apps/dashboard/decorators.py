from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect


def require_dashboard(view_func):
    def _wrapped_view_func(request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponseRedirect(
                reverse('dashboard-login'))
        if not request.user.get_profile().dashboard_enabled:
            return HttpResponseRedirect(
                reverse('profiles-home', args=[request.user.username, ]))
        return view_func(request, *args, **kwargs)
    return _wrapped_view_func
