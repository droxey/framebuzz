import urllib2

from django.template.defaultfilters import slugify
from django.core.files.base import ContentFile
from django.contrib.auth.models import User

from avatar.models import Avatar


def name_from_url(url):
    """
    >>> name_from_url('http://google.com/dir/file.ext')
    u'file.ext'
    >>> name_from_url('http://google.com/dir/')
    u'dir'
    >>> name_from_url('http://google.com/dir')
    u'dir'
    >>> name_from_url('http://google.com/dir/..')
    u'dir'
    >>> name_from_url('http://google.com/dir/../')
    u'dir'
    >>> name_from_url('http://google.com')
    u'google.com'
    >>> name_from_url('http://google.com/dir/subdir/file..ext')
    u'file.ext'
    """
    try:
        from urllib.parse import urlparse
    except ImportError:
        from urlparse import urlparse
    p = urlparse(url)
    for base in (p.path.split('/')[-1],
                 p.path,
                 p.netloc):
        name = ".".join(filter(lambda s: s,
                               map(slugify, base.split("."))))
        if name:
            return name


def copy_avatar(request, user, account):
    url = account.get_avatar_url()
    if url:
        ava = Avatar(user=user)
        ava.primary = True
        try:
            content = urllib2.urlopen(url).read()
            name = name_from_url(url)
            ava.avatar.save(name, ContentFile(content))
        except IOError:
            # Let's not make a big deal out of this...
            pass
