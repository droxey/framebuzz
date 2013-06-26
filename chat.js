var http = require('http');
var server = http.createServer().listen(4000);
var io = require('socket.io').listen(server);
var cookie_reader = require('cookie');
var querystring = require('querystring');
var redis = require('socket.io/node_modules/redis');
var sub = redis.createClient();

// Set max listeners. 0 = unlimited:
server.setMaxListeners(0);
sub.setMaxListeners(0);

//Configure socket.io to store cookie set by Django
io.configure(function(){
    io.set('authorization', function(data, accept){
        if(data.headers.cookie){
            data.cookie = cookie_reader.parse(data.headers.cookie);
            return accept(null, true);
        }
        return accept('error', false);
    });
    io.set('log level', 1);
});

var send_message = function(url, message, cookie) {
    var values = {
        'message': message,
        'sessionid': cookie
    };

    var values_json = JSON.stringify(values);
    var options = {
        host: 'framebuzz.com',
        port: 80,
        path: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': values_json.length
        }
    };

    // Send message to Django server
    var req = http.request(options, function(res){
        res.setEncoding('utf8');

        //Print out error message
        res.on('data', function(message) {
            console.log('Return: ' + message);
        });
    });

    req.write(values_json);
    req.end();
};

io.sockets.on('connection', function (socket) {

    // Grab message from Redis and send to client
    sub.on('message', function(channel, message){
        socket.send(message);
    });

    // Subscribe to the YouTube video 'channel',
    // or the user-specific channel.
    socket.on("subscribe_channel", function(channel) {
        sub.subscribe(channel);
    });

    // Client is sending message through socket.io
    socket.on('post_comment', function (message) {
        var cookie = socket.handshake.cookie['sessionid'];
        send_message('/realtime/post-comment/', message, cookie);
    });

    socket.on('favorite_comment', function(message) {
        var cookie = socket.handshake.cookie['sessionid'];
        send_message('/realtime/favorite-comment/', message, cookie);
    });

    socket.on('flag_comment', function(message) {
        var cookie = socket.handshake.cookie['sessionid'];
        send_message('/realtime/flag-comment/', message, cookie);
    });

    socket.on('toggle_user_follow', function(message) {
        var cookie = socket.handshake.cookie['sessionid'];
        send_message('/realtime/toggle-user-follow/', message, cookie);
    });

    socket.on('update_video_state', function(message) {
        var cookie = socket.handshake.cookie['sessionid'];
        send_message('/realtime/update-video-state/', message, cookie);
    });
});
