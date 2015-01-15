import math
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


@register.filter
def short_number(x):
    if x == '': return '0'
    if x == 0: return '0'
    if x == None: return '0'
    magnitude = int(math.log10(abs(x)))
    if magnitude < 3:
        return x
    if magnitude > 13:
        format_str = '%i t'
        denominator_mag = 12
    else:
        float_fmt = '%2.1f' if magnitude % 3 == 1 else '%1.2f'
        illion = (magnitude + 1) // 3
        format_str = float_fmt + ['', 'k', 'm', 'b', 't'][illion]
        denominator_mag = illion * 3
    return (format_str % (x * 1.0 / (10 ** denominator_mag))).lstrip('0')
