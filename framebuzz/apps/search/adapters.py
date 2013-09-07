import watson

class UserProfileSearchAdapter(watson.SearchAdapter):
    '''
        Weight search results by username, then bio, 
        then location/profession.
    '''
    def get_title(self, obj):
        return obj.user.username

    def get_description(self, obj):
        return obj.bio


class VideoSearchAdapter(watson.SearchAdapter):
    '''
        Weight search results by title, then description.
    '''
    def get_title(self, obj):
        return obj.title

    def get_description(self, obj):
        return obj.description


class CommentSearchAdapter(watson.SearchAdapter):
    '''
        Weight search results by comment text only.
    '''
    def get_title(self, obj):
        return obj.comment

    def get_description(self, obj):
        return obj.comment
