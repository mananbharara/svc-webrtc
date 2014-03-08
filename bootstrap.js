var express = require('express'), app = express(), server = require('http').createServer(app), io = require('socket.io').listen(server),
  util = require('util');

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT || 8080);

io.configure(function () {
  io.set('transports', ['websocket']);
  io.set('log level', 2);
});

io.sockets.on('connection', function (socket) {
  util.log('New connection:' + socket.id);

  socket.on('message', function (message) {
    this.broadcast.emit('message', message);
  });
});
