from framebuzz.apps.api.models import Video
from framebuzz.apps.api.serializers import VideoSerializer
from rest_framework import generics


class VideoList(generics.ListAPIView):
    serializer_class = VideoSerializer

    def get_queryset(self):
        """
        This view should return a list of all the videos for
        the user as determined by the username portion of the URL.
        """
        username = self.kwargs['username']
        return Video.objects.filter(
            added_by__username__iexact=username)
