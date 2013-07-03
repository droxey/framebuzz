def enum(*sequential, **named):
    """
    Usage: 
        Numbers = enum('ZERO', 'ONE', 'TWO')
    """
    enums = dict(zip(sequential, range(len(sequential))), **named)
    reverse = dict((value, key) for key, value in enums.iteritems())
    enums['reverse_mapping'] = reverse
    return type('Enum', (), enums)