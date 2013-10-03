from dateutil import tz, parser as date_parser

from django import template
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.template.defaultfilters import stringfilter
from django.utils import timezone
from django.utils.translation import ugettext, ungettext


register = template.Library()


@register.filter
def display_name(user):
    if not isinstance(user, User):
        return False
    return user.get_profile().display_name or user.username
