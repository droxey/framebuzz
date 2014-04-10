import celery
import datetime

from django.conf import settings
from django.contrib.auth.models import User

from actstream import action
from templated_email import send_templated_mail
from zencoder import Zencoder

from framebuzz.apps.api.models import Video, UserVideo, Thumbnail

MP4_URL = 's3://fbz-zc/%s/%s.mp4'
WEBM_URL = 's3://fbz-zc/%s/%s.webm'


@celery.task(name='framebuzz.apps.api.backends.tasks.start_zencoder_job',
             ignore_result=True)
def start_zencoder_job(video_url, filename):
    logger = start_zencoder_job.get_logger()
    logger.info('Uploading %s: %s' % (filename, video_url))

    client = Zencoder(settings.ZENCODER_API_KEY)
    mp4_url = MP4_URL % (filename, filename)
    webm_url = WEBM_URL % (filename, filename)
    requeue = False

    response = client.job.create(video_url,
        outputs=[
            {
                'credentials': 's3',
                'size': '700x470',
                'url': mp4_url,
                'public': True
            },
            {
                'credentials': 's3',
                'size': '700x470',
                'url': webm_url,
                'public': True
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
                        'size': '700x470',
                        'credentials': 's3',
                        'label': 'poster'
                    }
                ]
            }
        ]
    )

    vid = Video.objects.get(fp_url=video_url)
    vid.job_id = response.body.get('id', 0)
    vid.save()

    if response.code != 201 or vid.job_id == 0:  # 201: CREATED
        # TODO: Implement requeue.
        requeue = True


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

        for output in output_files[:2]:
            url = output.get('url', '')
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

        # Send email that video has been successfully uploaded.
        if video.added_by.email:
            send_templated_mail(template_name='upload-success',
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=[video.added_by.email],
                                context={'username': video.added_by.username,
                                         'video': video})
