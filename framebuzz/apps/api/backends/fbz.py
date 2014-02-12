import celery
import datetime

from django.conf import settings
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify

from actstream import action
from templated_email import send_templated_mail
from zencoder import Zencoder

from framebuzz.apps.api.models import Video, UserVideo


@celery.task(ignore_result=True)
def start_zencoder_job(username, title, description, video_url, filename):
    client = Zencoder(settings.ZENCODER_API_KEY)
    mp4_url = 's3://framebuzz-zencoder/videos/%s/%s.mp4' % (filename, filename)
    webm_url = 's3://framebuzz-zencoder/videos/%s/%s.webm' % (filename, filename)

    response = client.job.create(video_url, outputs=[
        {
            'credentials': 's3',
            'rrs': 'true',
            'size': '640x480',
            'public': 'true',
            'url': mp4_url
        },
        {
            'credentials': 's3',
            'rrs': 'true',
            'size': '640x480',
            'public': 'true',
            'url': webm_url
        }
    ])

    if response.code == 201:  # Created
        added_by = User.objects.get(username__iexact=username)

        video = Video()
        video.added_by = added_by
        video.video_id = slugify(title)
        video.title = title
        video.description = description
        video.processing = True
        video.job_id = response.body.get('id', 0)
        video.duration = 0  # Unknown until Zencoder is done encoding.
        video.uploaded = datetime.datetime.now()

        video.save()
    pass


@celery.task(ignore_result=True)
def check_zencoder_progress(username, job_id):
    client = Zencoder(settings.ZENCODER_API_KEY)
    response = client.job.progress(job_id)

    if response.get('state', '') == 'finished':
        # Get file details.
        details_response = client.job.details(job_id)

        job = details_response.get('job', None)
        if not job:
            return 0

        if job:
            input_file = job.get('input_media_file', None)
            output_files = job.get('output_media_files', list())
            mp4_url = None
            webm_url = None

            if not input_file:
                return 0

            if len(output_files) == 2:
                for output in output_files:
                    url = output.get('url', '')
                    if url.endswith('.mp4'):
                        mp4_url = url
                    elif url.endswith('.webm'):
                        webm_url = url
                    else:
                        pass

                if webm_url is None and mp4_url is None:
                    return 0

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

            # Save video poster image.
            added_by = User.objects.get(username__iexact=username)

            # Add UserVideo entry.
            user_video = UserVideo()
            user_video.user = added_by
            user_video.video = video
            user_video.is_featured = False
            user_video.save()

            action.send(added_by,
                        verb='added video to library',
                        action_object=video,
                        target=user_video)

            # Send email that video has been successfully uploaded.
            if added_by.email:
                send_templated_mail(template_name='upload-success',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[added_by.email],
                    context={'username': added_by.username, 'video': video})

            return 100
    else:
        return response.get('progress', 0)
