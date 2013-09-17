import json
import urllib2
import lxml.html as lh

from django.conf import settings


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def errors_to_json(errors):
    """
    Convert a Form error list to JSON::
        >>> f = SomeForm(...)
        >>> errors_to_json(f.errors)
        {'field': ['This field is required']}
    """
    # Force error strings to be un-lazied.
    return json.dumps(
        dict(
            (k, map(unicode, v))
            for (k, v) in errors.iteritems()
        )
    )


def get_share_count(service, url):
    count = 0
    url = settings.SHARE_COUNT_URLS[service] % url
    response = urllib2.urlopen(url)

    try:
        if service == 'google':
            doc = lh.parse(response)
            count_string = doc.xpath("//div[@id='aggregateCount']/text()")
            parsed = str(count_string).lstrip("['").rstrip("']")
            count = int(parsed)
        elif service == 'facebook':
            buf = response.read()
            response_json = json.loads(buf)
            if len(response_json) > 0:
                count = response_json[0].get('share_count', 0)
        elif service == 'twitter':
            buf = response.read()
            response_json = json.loads(buf)
            count = response_json.get('count', 0)
        else:
            pass
    except:
        pass

    return count


def get_total_shares(path):
    final = 0
    domains = ['http://framebuzz.com', 'http://frame.bz']
    for domain in domains:
        for service, share_url in settings.SHARE_COUNT_URLS.items():
            full_url = '%s%s' % (domain, path)
            count = get_share_count(service, full_url)
            final = final + int(count)
    return final
