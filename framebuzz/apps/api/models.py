import math
from datetime import datetime

from django.core.urlresolvers import reverse
from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.comments.models import Comment, CommentFlag
from django.db import models
from django.db.models.signals import post_save
from django.utils.translation import ugettext as _
from django.utils.html import urlize
from django.utils.safestring import mark_safe

from timezone_field import TimeZoneField

from mptt.models import MPTTModel, TreeForeignKey


COMMENT_VISIBILITY_TIME_RANGE = 0.5


class Website(models.Model):
    url = models.URLField('Website URL')
    name = models.CharField('Website Name', max_length=255)
    moderator_email = models.EmailField('Moderator Email Address')
    hide_comment_flag_count = models.IntegerField('Hide Comment When Total Flag Count', default=5)
    youtube_api_key = models.CharField('YouTube API Key', max_length=40, blank=True, null=True)

    def __unicode__(self):
        return "%s (%s)" % (self.name, self.url)


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    website = models.ForeignKey(Website, blank=True, null=True)
    premium = models.BooleanField(default=False)
    bio = models.CharField(max_length=255, blank=True, null=True)
    time_zone = TimeZoneField(blank=True, null=True)
    youtube_username = models.CharField(max_length=255, blank=True, null=True, editable=False)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        unique_together = ['user', 'website']

    def get_absolute_url(self):
        #return reverse('user-profile', args=[str(self.user.username)])
        return None

    def __unicode__(self):
        return "%s's profile" % self.user


def create_user_profile(sender, instance, created, **kwargs):
    if created:
       profile, created = UserProfile.objects.get_or_create(user=instance)
       comment_flag_ct = ContentType.objects.get_for_model(CommentFlag)
       comment_flag_permissions = Permission.objects.filter(content_type=comment_flag_ct)

       for perm in comment_flag_permissions:
           profile.user.user_permissions.add(perm.id)

post_save.connect(create_user_profile, sender=User)


class Video(models.Model):
    video_id = models.CharField(max_length=255, unique=True, null=True, help_text=_("The Youtube id of the video"))
    title = models.CharField(max_length=200, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    youtube_url = models.URLField(max_length=255, null=True, blank=True)
    swf_url = models.URLField(max_length=255, null=True, blank=True)
    uploaded = models.DateTimeField()
    duration = models.BigIntegerField()
    added_by = models.ForeignKey(User, blank=True, null=True)
    added_on = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'FrameBuzz Video'
        verbose_name_plural = 'FrameBuzz Videos'
        ordering = ['-added_on', 'title']

    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('embed-video', kwargs={'video_id': str(self.video_id)})

    def default_thumbnail(self):
        try:
            return self.thumbnail_set.all()[0]
        except:
            pass

    @property
    def timeInHMS(self):
        seconds = int(self.duration)
        hours = seconds / 3600
        seconds -= 3600*hours
        minutes = seconds / 60
        seconds -= 60*minutes
        if hours == 0:
            return "%02d:%02d" % (minutes, seconds)
        return "%02d:%02d:%02d" % (hours, minutes, seconds)


class Thumbnail(models.Model):
    video = models.ForeignKey(Video, null=True)
    url = models.URLField(max_length=255)

    class Meta:
        verbose_name = 'Video Thumbnail'
        verbose_name_plural = 'Video Thumbnails'

    def __unicode__(self):
        return self.url

    def get_absolute_url(self):
        return self.url


class MPTTComment(MPTTModel, Comment):
    """
        Threaded comments - Adds support for the parent comment
        store and MPTT traversal.
    """
    # A link to comment that is being replied, if one exists.
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')

    # Time is required for parent comments, and optional for sub-comments.
    time = models.FloatField(default=0.000)

    is_visible = models.BooleanField(default=True)
    has_hidden_siblings = models.BooleanField(default=False)

    @property
    def timeInHMS(self):
        seconds = int(self.time)
        hours = seconds / 3600
        seconds -= 3600*hours
        minutes = seconds / 60
        seconds -= 60*minutes
        if hours == 0:
            return "%01d:%02d" % (minutes, seconds)
        return "%01d:%02d:%02d" % (hours, minutes, seconds)

    @property
    def formatted_comment(self):
        return mark_safe(
            urlize(self.comment, trim_url_limit=None, nofollow=True)
                .replace('<a ', '<a target="_blank" '))

    def get_thread_siblings(self):
        if not self.parent:
            start = math.floor(self.time)
            time_fraction = self.time % 1

            if time_fraction > .5:
                start = start + 1
                end = start - COMMENT_VISIBILITY_TIME_RANGE
            else:
                end = start + COMMENT_VISIBILITY_TIME_RANGE
            
            comments_in_range = MPTTComment.objects.filter(object_pk=self.object_pk,
                                                parent=None, 
                                                time__gte=start, 
                                                time__lte=end,
                                                is_removed=False).order_by('time')
            return comments_in_range
        return None

    class MPTTMeta:
        # comments on one level will be ordered by date of creation
        order_insertion_by=['submit_date']

    class Meta:
        ordering=['tree_id','lft']
        verbose_name='Video Comment'
        verbose_name_plural='Video Comments'

    def __unicode__(self):
        return "%s at %s" % (self.comment, str(self.time))

    def save(self, *args, **kwargs):
        if not self.submit_date:
            self.submit_date = datetime.now()

        if not self.parent:
            comments_in_range = self.get_thread_siblings()
            
            if self.pk:
                comments_in_range = comments_in_range.exclude(id__in=[self.id,])

            visible_comments = comments_in_range.filter(is_visible=True)

            print comments_in_range

            if len(visible_comments) > 0:
                first_comment = visible_comments[0]
                visibility = (first_comment.time > self.time)

                if visibility:
                    self.has_hidden_siblings = True
                    self.is_visible = True

                    first_comment.is_visible = False
                    first_comment.save()
                else:
                    self.is_visible = False
                    self.has_hidden_siblings = False
            else:
                self.is_visible = True
                self.has_hidden_siblings = len(comments_in_range) >= 1

        super(MPTTComment, self).save(*args, **kwargs)