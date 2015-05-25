var express = require('express'),
  app = express(),
  server = app.listen(process.env.PORT || 8080),
  io = require('socket.io').listen(server),
  MeetingHandlers = require('./handler/meeting.js'),
  util = require('util');

if (process.env.PRODUCTION) {
  app.get('*', function (req, res, next) {
    if (req.headers['x-forwarded-proto'] != 'https')
      res.redirect('https://' + req.get('host') + req.originalUrl);
    else
      next();
  });
}

app.use(express.static(__dirname + '/public'));

app.post('/meetings', MeetingHandlers.create);

server.listen(process.env.PORT || 8080);

io.set('transports', ['websocket']);

io.sockets.on('connection', function (socket) {
  util.log('New connection:' + socket.id);

  socket.on('disconnect', function () {
    var participants = io.sockets.adapter.rooms[socket.meetingId];
    if (participants)
      io.to(socket.meetingId).emit('participants', Object.keys(participants));
  });

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
      socket.meetingId = identity.meetingId;
      io.to(identity.meetingId).emit('participants', Object.keys(io.sockets.adapter.rooms[identity.meetingId]));
    });
  });

  socket.on('message', function (data) {
    io.to(socket.meetingId).emit('message', data);
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

