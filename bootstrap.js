var express = require('express'), app = express(), server = require('http').createServer(app), io = require('socket.io').listen(server),
  util = require('util'), liveUsers = {};

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT || 8080);

io.configure(function () {
  io.set('transports', ['websocket']);
  io.set('log level', 2);
});

io.sockets.on('connection', function (socket) {
  util.log('New connection:' + socket.id);

  socket.on('disconnect', function () {
    for (var key in liveUsers) {
      if (liveUsers[key] === this.id) {
        delete liveUsers[key];
        break;
      }
    }

    io.sockets.emit('live users', liveUsers);
  });

  socket.on('offer', function (offer) {
    var destinationSocket = liveUsers[offer.to];
    io.sockets.socket(destinationSocket).emit('offer', offer);
  });

  socket.on('answer', function (answer) {
    var destinationSocket = liveUsers[answer.to];
    io.sockets.socket(destinationSocket).emit('answer', answer);
  });

  socket.on('ice candidate', function (iceCandidate) {
    var destinationSocket = liveUsers[iceCandidate.to];
    io.sockets.socket(destinationSocket).emit('ice candidate', iceCandidate);
  });

  socket.on('message', function (message) {
    this.broadcast.emit('message', message);
  });

  socket.on('identity', function (identity) {
    liveUsers[identity.user] = socket.id;
    io.sockets.emit('live users', liveUsers);
  });
});
