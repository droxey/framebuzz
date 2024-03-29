import re

from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.conf import settings


class MobileDetectionMiddleware(object):
    user_agents_test_match = (
        "w3c ", "acs-", "alav", "alca", "amoi", "audi",
        "avan", "benq", "bird", "blac", "blaz", "brew",
        "cell", "cldc", "cmd-", "dang", "doco", "eric",
        "hipt", "inno", "ipaq", "java", "jigs", "kddi",
        "keji", "leno", "lg-c", "lg-d", "lg-g", "lge-",
        "maui", "maxo", "midp", "mits", "mmef", "mobi",
        "mot-", "moto", "mwbp", "nec-", "newt", "noki",
        "xda",  "palm", "pana", "pant", "phil", "play",
        "port", "prox", "qwap", "sage", "sams", "sany",
        "sch-", "sec-", "send", "seri", "sgh-", "shar",
        "sie-", "siem", "smal", "smar", "sony", "sph-",
        "symb", "t-mo", "teli", "tim-", "tosh", "tsm-",
        "upg1", "upsi", "vk-v", "voda", "wap-", "wapa",
        "wapi", "wapp", "wapr", "webc", "winw", "xda-",)
    user_agents_test_search = u"(?:%s)" % u'|'.join((
        'up.browser', 'up.link', 'mmp', 'symbian', 'smartphone', 'midp',
        'wap', 'phone', 'windows ce', 'pda', 'mobile', 'mini', 'palm',
        'netfront', 'opera mobi',
    ))
    user_agents_exception_search = u"(?:%s)" % u'|'.join((
        'ipad',
    ))
    http_accept_regex = re.compile(
        "application/vnd\.wap\.xhtml\+xml", re.IGNORECASE)

    def __init__(self):
        user_agents_test_match = r'^(?:%s)' % '|'.join(
            self.user_agents_test_match)
        self.user_agents_test_match_regex = re.compile(
            user_agents_test_match, re.IGNORECASE)
        self.user_agents_test_search_regex = re.compile(
            self.user_agents_test_search, re.IGNORECASE)
        self.user_agents_exception_search_regex = re.compile(
            self.user_agents_exception_search, re.IGNORECASE)

    def process_request(self, request):
        is_mobile = False

        if not settings.MEDIA_URL in request.path \
        and not settings.STATIC_URL in request.path \
        and not 'mobile' in request.path \
        and not 'contact' in request.path \
        and not request.path == '/':
            if request.META.has_key('HTTP_USER_AGENT'):
                user_agent = request.META['HTTP_USER_AGENT']

                # Test common mobile values.
                if self.user_agents_test_search_regex.search(user_agent) \
                    and not self.user_agents_exception_search_regex.search(user_agent):
                    is_mobile = True
                else:
                    # Nokia like test for WAP browsers.
                    # http://www.developershome.com/wap/xhtmlmp/xhtml_mp_tutorial.asp?page=mimeTypesFileExtension

                    if 'HTTP_ACCEPT' in request.META:
                        http_accept = request.META['HTTP_ACCEPT']
                        if self.http_accept_regex.search(http_accept):
                            is_mobile = True

                if not is_mobile:
                    # Now we test the user_agent from a big list.
                    if self.user_agents_test_match_regex.match(user_agent):
                        is_mobile = True
        request.META['IS_MOBILE'] = is_mobile
        return None
