import json

from youtube_dl.extractor.youtube import YoutubeIE
from youtube_dl import YoutubeDL


def get_url(url, itag, referrer_ip):
    youtube_dl = YoutubeDL(params={'simulate': True,
                                   'skip_download': True,
                                   'outtmpl': '%(title)s',
                                   'format': str(itag),
                                   'referrer': referrer_ip})
    yt_extractor = YoutubeIE()

    youtube_dl.add_info_extractor(yt_extractor)
    info = youtube_dl.extract_info(url)

    if info.get('entries', None):
        first_entry = info['entries'][0]
        return first_entry.get('url')
