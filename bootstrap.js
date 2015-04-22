var express = require('express'),
  app = express(),
  server = app.listen(process.env.PORT || 8080),
  io = require('socket.io').listen(server),
  MeetingHandlers = require('./handler/meeting.js'),
  util = require('util'),
  liveUsers = {};

app.use(express.static(__dirname + '/public'));

app.post('/meetings', MeetingHandlers.create);

server.listen(process.env.PORT || 8080);

io.set('transports', ['websocket']);

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
    io.sockets.connected[destinationSocket].emit('offer', offer);
  });

  socket.on('answer', function (answer) {
    var destinationSocket = liveUsers[answer.to];
    io.sockets.connected[destinationSocket].emit('answer', answer);
  });

  socket.on('ice candidate', function (iceCandidate) {
    var destinationSocket = liveUsers[iceCandidate.to];
    io.sockets.connected[destinationSocket].emit('ice candidate', iceCandidate);
  });

  socket.on('message', function (message) {
    this.broadcast.emit('message', message);
  });

  socket.on('identity', function (identity) {
    liveUsers[identity.user] = socket.id;
    io.emit('live users', liveUsers);
  });
});
