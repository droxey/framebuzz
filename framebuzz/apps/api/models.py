from datetime import datetime, date

from django.conf import settings
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.comments.models import Comment, CommentFlag
from django.db import models
from django.db.models.signals import post_save
from django.utils.translation import ugettext as _
from django.utils.html import urlize
from django.utils.safestring import mark_safe

from templated_email import send_templated_mail
from timezone_field import TimeZoneField
from mptt.models import MPTTModel, TreeForeignKey


COMMENT_VISIBILITY_TIME_RANGE = 1
TIMELINE_BLOCKS = 29
SIGNIFICANCE_FACTOR = 20.0


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
    websites = models.ManyToManyField('UserWebsite', blank=True, null=True)
    premium = models.BooleanField(default=False)
    bio = models.CharField(max_length=255, blank=True, null=True)
    time_zone = TimeZoneField(blank=True, null=True)
    youtube_username = models.CharField(max_length=255, blank=True, null=True, editable=False)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    birthday = models.DateField(null=True, blank=True)    
    profession = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def get_absolute_url(self):
        return reverse('profiles-home', args=[str(self.user.username)])

    def get_default_website(self):
        try:
            user_website = self.websites.all()[0]
            return user_website.website
        except:
            return None

    def age(self):
        if self.birthday:
            today = date.today()
            try: 
                bday = self.birthday.replace(year=today.year)
            except ValueError: # raised when birth date is February 29 and the current year is not a leap year
                bday = self.birthday.replace(year=today.year, day=self.birthday.day-1)
            if bday > today:
                return today.year - self.birthday.year - 1
            else:
                return today.year - self.birthday.year
        return None

    def profile_details(self):
        _age = self.age()

        if len(self.profession) is not None:
            if _age is not None:
                return '%s, %s' % (str(_age), self.profession)
            else:
                return self.profession
        else:
            if _age is not None:
                return str(_age)

        return ''    

    def __unicode__(self):
        return "%s's Profile" % self.user


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile, created = UserProfile.objects.get_or_create(user=instance)
        comment_flag_ct = ContentType.objects.get_for_model(CommentFlag)
        comment_flag_permissions = Permission.objects.filter(content_type=comment_flag_ct)

        for perm in comment_flag_permissions:
            profile.user.user_permissions.add(perm.id)

        if instance.email:
            send_templated_mail(template_name='welcome-newuser', 
                from_email=settings.DEFAULT_FROM_EMAIL, 
                recipient_list=[instance.email], 
                context={ 'user': instance })

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
        return reverse('video-embed', kwargs={'video_id': str(self.video_id)})

    def get_share_url(self):
        return reverse('video-share', kwargs={'video_id': str(self.video_id)})

    def default_thumbnail(self):
        try:
            return self.thumbnail_set.all()[0]
        except:
            pass

    def large_thumbnail(self):
        try:
            return self.thumbnail_set.all()[1]
        except:
            pass

    def embed_code(self):
        full_url = 'http://frame.bz%s' % self.get_absolute_url()
        return mark_safe('<iframe src="%s" scrolling="no" frameBorder="0" height="440" width="640"></iframe>' % full_url)

    def heatmap(self):
        rank_per_block = list()
        
        if self.id:
            comments = MPTTComment.objects.filter(object_pk=self.id).order_by('time')
            seconds_per_block = float(self.duration) / float(TIMELINE_BLOCKS)
            

            rank_1 = (float(comments.count()) + SIGNIFICANCE_FACTOR) / 3.0
            rank_2 = rank_1 - (rank_1 / 7.0)
            rank_3 = rank_2 - (rank_1 / 7.0)
            rank_4 = rank_3 - (rank_1 / 7.0)
            rank_5 = rank_4 - (rank_1 / 7.0)
            rank_6 = rank_5 - (rank_1 / 7.0)
            rank_7 = rank_6 - (rank_1 / 7.0)

            for block in range(0, TIMELINE_BLOCKS):
                start = float(block) * seconds_per_block
                end = start + seconds_per_block
                comments_in_block = comments.filter(time__gte=start, time__lt=end)
                finalCount = comments_in_block.count()

                if finalCount == 0:
                    class_name = 'rank-8'
                elif finalCount > rank_1:
                    class_name = 'rank-1'
                else:
                    if rank_2 > finalCount >= rank_3:
                        class_name = 'rank-2'
                    elif rank_3 > finalCount >= rank_4:
                        class_name = 'rank-3'
                    elif rank_4 > finalCount >= rank_5:
                        class_name = 'rank-4'
                    elif rank_5 > finalCount >= rank_6:
                        class_name = 'rank-5'
                    elif rank_6 > finalCount >= rank_7:
                        class_name = 'rank-6'
                    else:
                        class_name = 'rank-7'

                rank_per_block.append({'block': block, 'className': class_name})
        return rank_per_block   

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


class UserVideo(models.Model):
    video = models.ForeignKey(Video)
    user = models.ForeignKey(User)
    added_on = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField('Featured?', default=False)

    class Meta:
        verbose_name = 'User Video'
        verbose_name_plural = 'User Videos'
        ordering = ['-is_featured', '-added_on']
        unique_together = ['video', 'user']

    def __unicode__(self):
        return "'%s' in %s's video library" % (self.video.title, self.user.username)


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
    hidden_by_id = models.IntegerField(blank=True, null=True)

    @property
    def timeInHMS(self):
        seconds = int(self.time)
        hours = seconds / 3600
        seconds -= 3600*hours
        minutes = seconds / 60
        seconds -= 60*minutes
        if hours == 0:
            return "%02d:%02d" % (minutes, seconds)
        return "%01d:%02d:%02d" % (hours, minutes, seconds)

    @property
    def formatted_comment(self):
        return mark_safe(
            urlize(self.comment, trim_url_limit=None, nofollow=True)
                .replace('<a ', '<a target="_blank" '))

    def get_thread_siblings(self):
        if not self.parent:
            start = int(self.time)
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
        return "%s at %s" % (self.comment, self.timeInHMS)

    def get_absolute_url(self):
        video = Video.objects.get(id=self.object_pk)
        url_id = self.id if self.parent is None else self.parent.id
        return '%s#/player/panel/active/comments/%s' % (reverse('video-embed', kwargs={'video_id': str(video.video_id)}), str(url_id))

    def get_share_url(self):
        video = Video.objects.get(id=self.object_pk)
        url_id = self.id if self.parent is None else self.parent.id
        return '%s#/player/panel/active/comments/%s' % (reverse('video-share', kwargs={'video_id': str(video.video_id)}), str(url_id))

    def save(self, *args, **kwargs):
        first_comment = None

        if not self.submit_date:
            self.submit_date = datetime.now()

        if not self.parent and self.has_hidden_siblings == False:
            comments_in_range = self.get_thread_siblings()
            
            if self.pk:
                comments_in_range = comments_in_range.exclude(id__in=[self.id,])

            visible_comments = comments_in_range.filter(is_visible=True)
            if len(visible_comments) > 0:
                first_comment = visible_comments[0]
                first_comment.has_hidden_siblings = True

                self.has_hidden_siblings = False
                self.is_visible = False
                self.hidden_by_id = first_comment.id
            else:
                self.is_visible = True
                self.has_hidden_siblings = False

        super(MPTTComment, self).save(*args, **kwargs)

        if first_comment:
            first_comment.save()

class UserWebsite(models.Model):
    website = models.ForeignKey(Website)
    user = models.ForeignKey(User)
    added_on = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Website'
        verbose_name_plural = 'User Websites'
        ordering = ['-added_on']
        
    def __unicode__(self):
        return "%s (%s)" % (self.website.name, self.website.url)
    