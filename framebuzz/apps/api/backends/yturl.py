import youtube_dl
import logging
import socket
from framebuzz.apps.api.utils import get_client_ip

logger = logging.getLogger('console')

import urllib2, httplib, socket


class BindableHTTPConnection(httplib.HTTPConnection):
    def connect(self):
        """Connect to the host and port specified in __init__."""
        self.sock = socket.socket()
        self.sock.bind((self.source_ip, 0))
        if isinstance(self.timeout, float):
            self.sock.settimeout(self.timeout)
        self.sock.connect((self.host, self.port))


def BindableHTTPConnectionFactory(source_ip):
    def _get(host, port=None, strict=None, timeout=0):
        bhc = BindableHTTPConnection(host, port=port, strict=strict, timeout=timeout)
        bhc.source_ip = source_ip
        return bhc
    return _get


class BindableHTTPHandler(youtube_dl.utils.compat_urllib_request.HTTPHandler):
    def __init__(self, ip):
        self.ip = ip

    def http_open(self, req):
        return self.do_open(BindableHTTPConnectionFactory(self.ip), req)


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

        if params.get('bindip', None):
            ip = params['bindip']
            opener = urllib2.build_opener(BindableHTTPHandler(ip))
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
                         'format': str(itag),
                         'bindip': ip})
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
