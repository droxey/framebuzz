import pytz
from django.conf import settings
from django.utils import timezone

class TimezoneMiddleware(object):
    def process_request(self, request):
        user_timezone = request.session.get('user_timezone', None)

        if not user_timezone:
            if request.user.is_authenticated() and request.user.get_profile():
                # Get timezone from the user's profile.
                profile = request.user.get_profile()
                if profile and profile.time_zone:
                    user_timezone = pytz.timezone(profile.time_zone.zone)
                else:
                    # Fallback to Server Time.
                    user_timezone = pytz.timezone(settings.TIME_ZONE)
            else:
                # Fallback to Server Time.
                user_timezone = pytz.timezone(settings.TIME_ZONE)

            request.session['user_timezone'] = user_timezone

        timezone.activate(user_timezone)