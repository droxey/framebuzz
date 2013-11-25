from django.contrib import admin
from framebuzz.apps.api.models import MPTTComment, Video, UserProfile, UserVideo
from django.contrib.sessions.models import Session


class FrameBuzzVideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'video_id', 'duration', 'added_by', 'added_on',)
    list_filter = ('added_by', 'added_on',)
    search_fields = ['title', ]


class MPTTCommentAdmin(admin.ModelAdmin):
    list_filter = ('object_pk', 'content_type',
                   'user', 'is_visible', 'has_hidden_siblings',)
    list_display = ('comment', 'object_pk', 'time',
                    'parent', 'user', 'is_visible', 'has_hidden_siblings',)


class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_key', 'expire_date',)


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio', 'time_zone',)
    list_filter = ('time_zone',)


class UserVideoAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'added_on',)


admin.site.register(MPTTComment, MPTTCommentAdmin)
admin.site.register(Video, FrameBuzzVideoAdmin)
admin.site.register(Session, SessionAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(UserVideo, UserVideoAdmin)
