import json
import urllib2
import lxml.html as lh

from actstream.models import Action
from django.conf import settings
from django.db.models import Q

from framebuzz.apps.api.models import Video


def queryset_iterator(queryset, chunksize=1000):
    import gc
    pk = 0
    last_pk = queryset.order_by('-pk')[0].pk
    queryset = queryset.order_by('pk')
    if queryset.count() < 1:
        pass
    while pk < last_pk:
        for row in queryset.filter(pk__gt=pk)[:chunksize]:
            pk = row.pk
            yield row
        gc.collect()


def get_client_ip(request):
    if settings.DEBUG:
        return '75.13.90.154'
    else:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


def errors_to_json(errors):
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
                count_response = response_json[0].get('share_count', 0)
                count = int(count_response)
        elif service == 'twitter':
            buf = response.read()
            response_json = json.loads(buf)
            count_response = response_json.get('count', 0)
            count = int(count_response)
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

    path_split = [str(s) for s in path.split('/')]
    if len(path_split) > 3:
        video_id = path_split[-2]
        video = Video.objects.get(slug=video_id)
        email_shares = Action.objects.filter(verb='shared',
                                             action_object_object_id=video.id)
        final = final + len(email_shares)
    return final


def get_pending_uploads(username):
    pending_uploads = Video.objects.exclude(
        Q(Q(fp_url=None) & Q(job_id=None))).filter(
            added_by__username=username,
            processing=True)
    return pending_uploads
