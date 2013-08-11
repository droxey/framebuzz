from django.contrib import admin
from framebuzz.apps.api.models import MPTTComment, Video, UserProfile, Website, UserWebsite, UserVideo
from django.contrib.sessions.models import Session

class FrameBuzzVideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'video_id', 'duration', 'added_by', 'added_on',)
    list_filter = ('added_by', 'added_on',)

class MPTTCommentAdmin(admin.ModelAdmin):
    list_filter = ('object_pk', 'content_type', 'user', 'is_visible', 'has_hidden_siblings',)
    list_display = ('comment', 'object_pk', 'time', 'parent', 'user', 'is_visible', 'has_hidden_siblings',)

class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_key', 'expire_date',)

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'premium', 'bio', 'time_zone',)
    list_filter = ('premium', 'time_zone',)

class UserWebsiteAdmin(admin.ModelAdmin):
    list_display = ('user', 'website', 'added_on',)

class WebsiteAdmin(admin.ModelAdmin):
    list_display = ('url', 'name', 'moderator_email', 'hide_comment_flag_count', 'youtube_api_key',)

class UserVideoAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'added_on',)


admin.site.register(MPTTComment, MPTTCommentAdmin)
admin.site.register(Video, FrameBuzzVideoAdmin)
admin.site.register(Session, SessionAdmin)
admin.site.register(Website, WebsiteAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(UserWebsite, UserWebsiteAdmin)
admin.site.register(UserVideo, UserVideoAdmin)