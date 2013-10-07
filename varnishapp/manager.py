from atexit import register
from varnish import VarnishManager

from .settings import MANAGEMENT_ADDRS, SECRET, THREADED


class DjangoVarnishManager(VarnishManager):
    """
    A subclass that sends the secret on every run.
    """
    def run(self, *commands, **kwargs):
        kwargs.setdefault('secret', SECRET)
        kwargs.setdefault('threaded', THREADED)
        return super(DjangoVarnishManager, self).run(*commands, **kwargs)

    def close(self):
        self.run('close', threaded=THREADED)
        self.servers = ()


manager = DjangoVarnishManager(MANAGEMENT_ADDRS)
register(manager.close)
