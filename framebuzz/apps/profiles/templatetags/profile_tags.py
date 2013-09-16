from django import template
from django.contrib.auth.models import User

register = template.Library()


@register.filter
def display_name(user):
    if not isinstance(user, User):
        return False
    return user.get_profile().display_name or user.username