import subprocess
from youtube_dl import parseOpts, YoutubeDL
from framebuzz.apps.api.utils import get_client_ip

def get_url(url, itag, request):
    ip = get_client_ip(request)
    ua = request.META.get('HTTP_USER_AGENT')

    argv = 'youtube-dl -f %s --referer %s --user-agent "%s" %s --cookies=cookies.txt --skip-download --get-url --verbose'\
        % (str(itag), str(ip), str(ua), url)

    output = subprocess.check_output(argv, shell=True)
    return output
    #ydl = YoutubeDL(params=opts)
    #ydl.add_default_info_extractors()
    #info = ydl.extract_info(url)

    #if info.get('entries', None):
    #    first_entry = info['entries'][0]
    #    return first_entry.get('url')
