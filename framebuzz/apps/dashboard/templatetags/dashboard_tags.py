from django.template import Library

from framebuzz.libs.utils import grouped

register = Library()


@register.filter
def group_by(value, arg):
    return grouped(value, arg)
