from sockjs.tornado import SockJSConnection

class PlayerConnection(SockJSConnection):
    def on_open(self, request):
         pass
    def on_message(self, message):
         pass
    def on_close(self):
         pass