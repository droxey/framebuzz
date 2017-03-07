import os

bind = "127.0.0.1:9000"
workers = (os.sysconf("SC_NPROCESSORS_ONLN") * 2) + 1
proc_name = "framebuzz"


def when_ready(server):
    from django.core.management import call_command
    call_command('validate')
