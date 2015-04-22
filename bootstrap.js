var express = require('express'),
  app = express(),
  server = app.listen(process.env.PORT || 8080),
  io = require('socket.io').listen(server),
  MeetingHandlers = require('./handler/meeting.js'),
  util = require('util');

app.use(express.static(__dirname + '/public'));

app.post('/meetings', MeetingHandlers.create);

server.listen(process.env.PORT || 8080);

io.set('transports', ['websocket']);

io.sockets.on('connection', function (socket) {
  util.log('New connection:' + socket.id);

  socket.on('offer', function (offer) {
    sendToSocket(offer.to, {'offer': offer});
  });

  socket.on('answer', function (answer) {
    sendToSocket(answer.to, {'answer': answer});
  });

  socket.on('ice candidate', function (iceCandidate) {
    sendToSocket(iceCandidate.to, {'ice candidate': iceCandidate});
  });

  socket.on('join', function (identity) {
    socket.join(identity.meetingId, function () {
      io.to(identity.meetingId).emit('participants', Object.keys(io.sockets.adapter.rooms[identity.meetingId]));
    });
  });

  function sendToSocket(socketId, message) {
    var socket = io.sockets.connected[socketId];
    if (!socket) {
      util.log('Socket doesn\'t exist: ', socketId);
      return;
    }
    socket.emit(Object.keys(message)[0], message[Object.keys(message)[0]]);
  }
});

