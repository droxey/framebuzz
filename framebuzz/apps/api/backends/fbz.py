import celery

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
        video = Video()
        video.video_id = slugify(title)
        video.title = title
        video.description = description
        video.processing = True
        video.job_id = response.body.get('id', 0)
        video.duration = 0  # Unknown until Zencoder is done encoding.
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
            if not input_file:
                return 0

            # Update video attributes.
            video = Video.objects.get(job_id=job_id)
            video.processing = False
            video.duration = input_file.get('duration_in_ms', 0)
            video.save()

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
