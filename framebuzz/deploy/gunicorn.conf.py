import os

bind = "127.0.0.1:%(gunicorn_port)s"
workers = (os.sysconf("SC_NPROCESSORS_ONLN") * 2) + 1
proc_name = "%(proj_name)s"

def when_ready(server):
    from django.core.management import call_command
    call_command('validate')