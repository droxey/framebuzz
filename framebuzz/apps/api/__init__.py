from framebuzz.apps.api.models import MPTTComment

TIMELINE_BLOCKS = 29
SIGNIFICANCE_FACTOR = 20.0
EVENT_TYPE_KEY = 'eventType'
CHANNEL_KEY = 'channel'
DATA_KEY = 'data'

def get_model():
    return MPTTComment