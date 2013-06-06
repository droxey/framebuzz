from django.contrib import admin
from framebuzz.apps.api.models import MPTTComment, Video, UserProfile, Website
from django.contrib.sessions.models import Session

class FrameBuzzVideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'video_id', 'duration', 'added_by', 'added_on',)
    list_filter = ('added_by', 'added_on',)

class MPTTCommentAdmin(admin.ModelAdmin):
    list_filter = ('object_pk', 'content_type',)
    list_display = ('comment', 'object_pk', 'time', 'parent',)

class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_key', 'expire_date',)

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'website', 'premium', 'bio', 'time_zone',)
    list_filter = ('premium', 'time_zone',)

class WebsiteAdmin(admin.ModelAdmin):
    list_display = ('url', 'name', 'moderator_email', 'hide_comment_flag_count', 'youtube_api_key',)


admin.site.register(MPTTComment, MPTTCommentAdmin)
admin.site.register(Video, FrameBuzzVideoAdmin)
admin.site.register(Session, SessionAdmin)
admin.site.register(Website, WebsiteAdmin)
admin.site.register(UserProfile, UserProfileAdmin)