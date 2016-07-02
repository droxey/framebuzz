from django.contrib import admin
from framebuzz.apps.api.models import MPTTComment, Video, \
    UserProfile, UserVideo, Thumbnail, PrivateSession, SessionInvitation, Task
from django.contrib.sessions.models import Session


class FrameBuzzVideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'duration', 'added_by',
                    'added_on', 'public', 'job_id',)
    list_filter = ('added_by', 'added_on', 'public',)
    search_fields = ['title', 'slug', ]


class MPTTCommentAdmin(admin.ModelAdmin):
    list_filter = ('object_pk', 'content_type',
                   'user', 'is_visible', 'has_hidden_siblings',)
    list_display = ('comment', 'object_pk', 'time',
                    'parent', 'user', 'is_visible', 'has_hidden_siblings',)


class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_key', 'expire_date',)


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio', 'time_zone', 'dashboard_enabled',)
    list_filter = ('time_zone', 'dashboard_enabled',)


class UserVideoAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'added_on',)


class ThumbnailAdmin(admin.ModelAdmin):
    list_display = ('video', 'url',)
    list_filter = ('video',)


class PrivateSessionAdmin(admin.ModelAdmin):
    list_display = ('owner', 'video', 'slug',)
    list_filter = ('owner', 'video',)


class SessionInvitationAdmin(admin.ModelAdmin):
    list_display = ('session', 'invitee', 'email',
                    'accepted', 'invited_on', 'accepted_on',)
    list_filter = ('session', 'invitee', 'email', 'accepted',)


class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'created_by', 'assigned_to',)
    list_filter = ('video', 'created_by', 'assigned_to',)


admin.site.register(MPTTComment, MPTTCommentAdmin)
admin.site.register(Video, FrameBuzzVideoAdmin)
admin.site.register(Session, SessionAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(UserVideo, UserVideoAdmin)
admin.site.register(Thumbnail, ThumbnailAdmin)
admin.site.register(PrivateSession, PrivateSessionAdmin)
admin.site.register(SessionInvitation, SessionInvitationAdmin)
admin.site.register(Task, TaskAdmin)
