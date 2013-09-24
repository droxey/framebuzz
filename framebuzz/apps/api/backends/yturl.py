import youtube_dl
import logging
import socket
from framebuzz.apps.api.utils import get_client_ip

logger = logging.getLogger('console')

import functools
import httplib
import urllib2
import gzip
import io
import zlib

try:
    import urllib.request as compat_urllib_request
except ImportError: # Python 2
    import urllib2 as compat_urllib_request

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


class UserIPYoutubeDLHandler(youtube_dl.utils.compat_urllib_request.HTTPHandler):
    """Handler for HTTP requests and responses.

    This class, when installed with an OpenerDirector, automatically adds
    the standard headers to every HTTP request and handles gzipped and
    deflated responses from web servers. If compression is to be avoided in
    a particular request, the original request in the program code only has
    to include the HTTP header "Youtubedl-No-Compression", which will be
    removed before making the real request.

    Part of this code was copied from:

    http://techknack.net/python-urllib2-handlers/

    Andrew Rowls, the author of that code, agreed to release it to the
    public domain.
    """

    def __init__(self, source_address=None, debuglevel=0):
        print 'using this'
        urllib2.HTTPHandler.__init__(self, debuglevel)
        self.http_class = functools.partial(httplib.HTTPConnection,
                                            source_address=source_address)

    def http_open(self, req):
        print 'OPENING: %s' % req
        return self.do_open(self.http_class, req)

    def to_screen(self, msg):
        print msg

    @staticmethod
    def deflate(data):
        try:
            return zlib.decompress(data, -zlib.MAX_WBITS)
        except zlib.error:
            return zlib.decompress(data)

    @staticmethod
    def addinfourl_wrapper(stream, headers, url, code):
        if hasattr(compat_urllib_request.addinfourl, 'getcode'):
            return compat_urllib_request.addinfourl(stream, headers, url, code)
        ret = compat_urllib_request.addinfourl(stream, headers, url)
        ret.code = code
        return ret

    def http_request(self, req):
        for h,v in youtube_dl.utils.std_headers.items():
            if h in req.headers:
                del req.headers[h]
            req.add_header(h, v)
        if 'Youtubedl-no-compression' in req.headers:
            if 'Accept-encoding' in req.headers:
                del req.headers['Accept-encoding']
            del req.headers['Youtubedl-no-compression']
        if 'Youtubedl-user-agent' in req.headers:
            if 'User-agent' in req.headers:
                del req.headers['User-agent']
            req.headers['User-agent'] = req.headers['Youtubedl-user-agent']
            req.headers['X-GData-Device'] = ''
            del req.headers['Youtubedl-user-agent']
        return req

    def http_response(self, req, resp):
        old_resp = resp
        # gzip
        if resp.headers.get('Content-encoding', '') == 'gzip':
            content = resp.read()
            gz = gzip.GzipFile(fileobj=io.BytesIO(content), mode='rb')
            try:
                uncompressed = io.BytesIO(gz.read())
            except IOError as original_ioerror:
                # There may be junk add the end of the file
                # See http://stackoverflow.com/q/4928560/35070 for details
                for i in range(1, 1024):
                    try:
                        gz = gzip.GzipFile(fileobj=io.BytesIO(content[:-i]), mode='rb')
                        uncompressed = io.BytesIO(gz.read())
                    except IOError:
                        continue
                    break
                else:
                    raise original_ioerror
            resp = self.addinfourl_wrapper(uncompressed, old_resp.headers, old_resp.url, old_resp.code)
            resp.msg = old_resp.msg
        # deflate
        if resp.headers.get('Content-encoding', '') == 'deflate':
            gz = io.BytesIO(self.deflate(resp.read()))
            resp = self.addinfourl_wrapper(gz, old_resp.headers, old_resp.url, old_resp.code)
            resp.msg = old_resp.msg
        return resp

    https_request = http_request
    https_response = http_response


class SimpleYDL(youtube_dl.YoutubeDL):
    def __init__(self, ip, params):
        super(SimpleYDL, self).__init__(params)

        if params.get('bindip', None):
            ip = params['bindip']
            handler = UserIPYoutubeDLHandler(source_address=ip)
            opener = urllib2.build_opener(handler)
            youtube_dl.utils.compat_urllib_request.install_opener(opener)

            self.fd = UserIPYoutubeDLHandler(source_address=ip)
            self.fd.params = params

        self._screen_file = ScreenFile()
        self._ies = youtube_dl.gen_extractors()

        for ie in self._ies:
            ie.set_downloader(self.fd)


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
