import celery

from django.conf import settings
from django.contrib.sites.models import Site

from actstream import action
from templated_email import send_templated_mail
from zencoder import Zencoder

from framebuzz.apps.api.models import Video, UserVideo, Thumbnail
from framebuzz.apps.tumblr.tasks import submit_to_tumblr

MP4 = '%s.mp4'
WEBM = '%s.webm'
DIRECTORY = 's3://fbz-zc/%s/'


@celery.task(name='framebuzz.apps.api.backends.tasks.start_zencoder_job',
             ignore_result=True)
def start_zencoder_job(video_id):
    vid = Video.objects.get(video_id=video_id)
    logger = start_zencoder_job.get_logger()
    logger.info('Uploading %s: %s' % (vid.filename, vid.fp_url))

    directory = vid.fp_url.split('/')[-1]
    base_dir = DIRECTORY % (directory)
    mp4_file = MP4 % (directory)
    webm_file = WEBM % (directory)
    client = Zencoder(settings.ZENCODER_API_KEY)
    dimensions = '700x395'

    response = client.job.create(vid.fp_url,
        outputs=[
            {
                'size': dimensions,
                'base_url': base_dir,
                'filename': mp4_file,
                'public': True,
                'aspect_mode': 'pad'
            },
            {
                'size': dimensions,
                'base_url': base_dir,
                'filename': webm_file,
                'public': True,
                'aspect_mode': 'pad'
            },
            {
                "notifications": [
                    {
                        "url": settings.ZENCODER_WEBHOOK_URL
                    }
                ],
                "thumbnails": [
                    {
                        'number': 5,
                        'size': '700x435',
                        'public': True,
                        'label': 'poster',
                        'base_url': base_dir,
                        'aspect_mode': 'pad'
                    }
                ]
            }
        ]
    )
    vid.job_id = response.body.get('id', 0)
    vid.save()
    if response.code != 201 or vid.job_id == 0:
        logger.info('Error uploading %s: %s' % (vid.filename, vid.fp_url))


@celery.task(name='framebuzz.apps.api.backends.tasks.check_zencoder_progress')
def check_zencoder_progress(job_id):
    client = Zencoder(settings.ZENCODER_API_KEY)

    # Get file details.
    details_response = client.job.details(job_id)
    response_dict = details_response.__dict__

    response_body = response_dict.get('body', None)
    if not response_body:
        return

    job = response_body.get('job', None)
    if not job:
        return

    if job:
        input_file = job.get('input_media_file', None)
        output_files = job.get('output_media_files', list())
        thumbnails = job.get('thumbnails', list())
        mp4_url = None
        webm_url = None

        if not input_file:
            return

        for output in output_files:
            url = output.get('url', '')
            if url.startswith('http://'):
                url = url.replace('http://', 'https://')
            if url.endswith('.mp4'):
                mp4_url = url
            elif url.endswith('.webm'):
                webm_url = url
            else:
                pass

        if webm_url is None and mp4_url is None:
            return

        # Update video attributes.
        duration = input_file.get('duration_in_ms', 0)
        if duration > 0:
            duration = duration / 1000

        video = Video.objects.get(job_id=job_id)
        video.processing = False
        video.duration = duration
        video.webm_url = webm_url
        video.mp4_url = mp4_url
        video.save()

        # Save video poster images.
        for thumb in thumbnails:
            if thumb.get('url', None):
                t = Thumbnail()
                t.url = thumb.get('url')
                t.video = video
                if t.url.startswith('http://'):
                    t.url = t.url.replace('http://', 'https://')
                t.save()

        # Add UserVideo entry.
        user_video = UserVideo()
        user_video.user = video.added_by
        user_video.video = video
        user_video.is_featured = False
        user_video.save()

        action.send(video.added_by,
                    verb='added video to library',
                    action_object=video,
                    target=user_video)

        # Reset Video job id, so we don't receive duplicate uploads.
        video.job_id = None
        video.save()
