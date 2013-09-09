import json


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def errors_to_json(errors):
    """
    Convert a Form error list to JSON::
        >>> f = SomeForm(...)
        >>> errors_to_json(f.errors)
        {'field': ['This field is required']}
    """
    # Force error strings to be un-lazied.
    return json.dumps(
        dict(
            (k, map(unicode, v))
            for (k, v) in errors.iteritems()
        )
    )
