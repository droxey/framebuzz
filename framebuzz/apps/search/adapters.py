import watson

class UserProfileSearchAdapter(watson.SearchAdapter):
    '''
        Weight search results by username, then bio, 
        then location/profession.
    '''
    def get_title(self, obj):
        return obj.display_name or obj.user.username

    def get_description(self, obj):
        return obj.bio or obj.tagline or ''


class VideoSearchAdapter(watson.SearchAdapter):
    '''
        Weight search results by title, then description.
    '''
    def get_title(self, obj):
        return obj.title or ''

    def get_description(self, obj):
        return obj.description or ''


class CommentSearchAdapter(watson.SearchAdapter):
    '''
        Weight search results by comment text only.
    '''
    def get_title(self, obj):
        return obj.comment

    def get_description(self, obj):
        return obj.comment
