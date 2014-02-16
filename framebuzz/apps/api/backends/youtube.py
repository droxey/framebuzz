import json
import urllib
import iso8601
import requests
import watson

from django.conf import settings
from framebuzz.apps.api.models import Video, Thumbnail


def get_uploaded_videos(auth_token):
  uploaded_videos = list()

  headers = {'Authorization': 'Bearer %s' % auth_token}
  response = requests.get('https://www.googleapis.com/youtube/v3/channels',
              headers=headers,
              params={ 'mine': 'true',
                       'alt': 'json',
                       'part': 'contentDetails',
                       'key': settings.YOUTUBE_API_KEY_SERVER})
  upload_response = response.json()

  uploads = upload_response.get('items', None)
  if uploads:
    for upload in uploads:
      uploads_list_id = upload["contentDetails"]["relatedPlaylists"]["uploads"]
      next_page_token = ""

      while next_page_token is not None:
        playlist_response = requests.get('https://www.googleapis.com/youtube/v3/playlistItems',
                headers=headers,
                params={ 'mine': 'true',
                         'alt': 'json',
                         'part': 'snippet',
                         'playlistId': uploads_list_id,
                         'maxResults': 50,
                         'pageToken': next_page_token,
                         'key': settings.YOUTUBE_API_KEY_SERVER})
        playlist_items = playlist_response.json()

        results = playlist_items.get('items', None)
        if results:
          for playlist_item in results:
            video_id = playlist_item["snippet"]["resourceId"]["videoId"]
            video, created = get_or_create_video(video_id)
            if video and video.added_by is None:
              uploaded_videos.append(video)

          next_page_token = playlist_items.get("tokenPagination", {}).get("nextPageToken")

  return uploaded_videos


def find_video_by_keyword(q, results=12, next_page_token=None):
  videos = list()
  params = {
     'alt': 'json',
     'part': 'id,snippet',
     'q': q,
     'type': 'video',
     'videoEmbeddable': 'true',
     'videoSyndicated': 'true',
     'maxResults': results,
     'order': 'viewCount',
     'key': settings.YOUTUBE_API_KEY_SERVER,
     'fields': 'items(id),nextPageToken,pageInfo,prevPageToken,tokenPagination'
  }

  if next_page_token is not None:
    params['pageToken'] = next_page_token

  response = requests.get('https://www.googleapis.com/youtube/v3/search', params=params)
  query_response = response.json()
  next_page_token = query_response.get("tokenPagination", {}).get("nextPageToken")

  print query_response.get('pageInfo', {})

  for search_result in query_response.get("items", []):
      video_id = search_result["id"]["videoId"]
      video, created = get_or_create_video(video_id)
      videos.append(video)

  return videos, next_page_token


@watson.update_index()
def get_or_create_video(slug):
  try:
    if len(slug) == settings.RANDOMSLUG_LENGTH:
      # fbz slugs are 16.
      video = Video.objects.get(slug=slug)
    else:
      video = Video.objects.get(video_id=slug)
    created = False
    
    return video, created
  except Video.DoesNotExist:
    query_params = dict(id=slug, part='snippet,player,contentDetails', key=settings.YOUTUBE_API_KEY_SERVER)
    query_url = 'https://www.googleapis.com/youtube/v3/videos?%s' % urllib.urlencode(query_params)
    query_response = json.loads(urllib.urlopen(query_url).read())
    results = query_response.get('items', None)

    if results:
      result = results[0]
      snippet = result.get('snippet')
      contentDetails = result.get('contentDetails')
      new_video_id = result.get('id')

      video = Video()
      video.video_id = new_video_id
      video.title = snippet.get('title')
      video.description = snippet.get('description')
      video.youtube_url = 'http://www.youtube.com/watch?v=%s&feature=youtube_gdata_player' % new_video_id
      video.uploaded = iso8601.parse_date(snippet.get('publishedAt'))
      duration = contentDetails.get('duration').lstrip('PT')

      if 'H' in duration:
        if 'M' in duration:
          hours, minutes_seconds = duration.split('H')
          hours = hours.rstrip('H')
          duration = minutes_seconds
        else:
          hours = duration.rstrip('H')
      else:
        hours = 0

      if 'S' in duration:
        duration = duration.rstrip('S')
      else:
        seconds = 0

      if 'M' in duration:
        minutes, seconds = duration.split('M')
        minutes = minutes.rstrip('M')
        if len(seconds) == 0:
          seconds = 0
      else:
        seconds = duration.rstrip('H')
        minutes = 0

      video.duration = (int(hours) * 1400) + (int(minutes) * 60) + int(seconds)
      video.save()
      created = True

      # show thumbnails
      thumbnails = snippet.get('thumbnails', None)
      if thumbnails:
        for thumb_type, thumbnail in thumbnails.items():
          t = Thumbnail()
          t.url = thumbnail.get('url')
          t.video = video
          t.save()
      
      return video, created