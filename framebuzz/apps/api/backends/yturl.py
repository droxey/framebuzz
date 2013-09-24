import youtube_dl
import functools
import httplib
import urllib2
import subprocess
import logging

from framebuzz.apps.api.utils import get_client_ip

logger = logging.getLogger('console')


class BoundHTTPHandler(urllib2.HTTPHandler):

    def __init__(self, source_address=None, debuglevel=0):
        urllib2.HTTPHandler.__init__(self, debuglevel)
        self.http_class = functools.partial(httplib.HTTPConnection,
                                            source_address=source_address)

    def http_open(self, req):
        return self.do_open(self.http_class, req)


class NoneFile(object):
    '''
    A file-like object that does nothing
    '''
    def write(self, msg):
        pass

    def flush(self, *args, **kaargs):
        pass

    def isatty(self):
        return False


class ScreenFile(NoneFile):
    def write(self, msg):
        print msg


class SimpleYDL(youtube_dl.YoutubeDL):
    def __init__(self, ip, params):
        super(SimpleYDL, self).__init__(params)

        handler = BoundHTTPHandler(source_address=(ip, 0))
        opener = urllib2.build_opener(handler, youtube_dl.YoutubeDLHandler())
        urllib2.install_opener(opener)
        youtube_dl.utils.compat_urllib_request.install_opener(opener)

        self._screen_file = ScreenFile()
        self._ies = youtube_dl.gen_extractors()
        for ie in self._ies:
            ie.set_downloader(self)


def get_url(url, itag, request):
    ip = get_client_ip(request)
    ua = request.META.get('HTTP_USER_AGENT')
    print 'IP ADDRESS: %s' % str(ip)
    logger.info('IP ADDRESS: %s', str(ip))

    ydl = SimpleYDL(ip, {'outtmpl': '%(title)s',
                         'referer': ip,
                         'user-agent': str(ua),
                         'format': str(itag)})
    res = ydl.extract_info(url, download=False)

    #Do not return yet playlists
    def clean_res(result):
        r_type = result.get('_type', 'video')
        if r_type == 'video':
            videos = [result]
        elif r_type == 'playlist':
            videos = []
            for entry in result['entries']:
                videos.extend(clean_res(entry))
        elif r_type == 'compat_list':
            videos = []
            for r in result['entries']:
                videos.extend(clean_res(r))
        return videos

    videos = clean_res(res)
    if len(videos) > 0:
        video = videos[0]
        return video.get('url')
