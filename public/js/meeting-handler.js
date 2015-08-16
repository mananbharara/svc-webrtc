function MeetingHandler(meetingId, app) {
  var user = app.get('user'), meetingId = app.get('meetingId'), connections = {};

  new LocalVideo();
  setupSocketMessaging();
  ChatHandler();
  ThemeHandler();
  NavHandler();

  app.on('start', start);
  app.on('share', share);

  app.observe('participants', function (newVal) {
    var remotes = app.get('remotes');

    app.set('remotes', remotes.filter(function (remote) {
      return newVal.indexOf(remote.id) !== -1;
    }));
  });

  function setupPeerConnectionObject(remoteId, fromCaller) {
    var pc = new RTCPeerConnection(iceServers, optional);

    pc.onicecandidate = function (evt) {
      if (evt.candidate && (evt.candidate.candidate.indexOf('relay') == -1)) {
        socket().emit('ice candidate', {
          fromCaller: fromCaller,
          from: app.get('user'),
          to: remoteId,
          'candidate': evt.candidate
        });
      }
    };

    pc.onaddstream = function (evt) {
      app.get('remotes').push(new RemoteVideo(remoteId, URL.createObjectURL(evt.stream)));
    };

    return pc;
  }

  function setupSocketMessaging() {
    var socket = io.connect(location.origin, {transports: ['websocket']});
    app.set('socket', socket);

    socket.on('connect', function () {
      console.log('Connection established');
      app.set('user', {userId: socket.io.engine.id, username: localStorage.getItem('username') || socket.io.engine.id});

      socket.emit('join', {meetingId: meetingId});
    });

    socket.on('participants', function (data) {
      app.set('participants', data);

      console.log('Participants in this meeting: ', app.get('participants'));
    });

    socket.on('offer', function (offer) {
      answer(offer);
    });

    socket.on('ice candidate', function (iceCandidate) {
      var otherUserId = iceCandidate.from.userId;

      connections[otherUserId].addIceCandidate(new RTCIceCandidate(iceCandidate.candidate));
    });

    socket.on('answer', function (answer) {
      connections[answer.from.userId].setRemoteDescription(new RTCSessionDescription(answer.answerSDP));
    });
  }

  function start() {
    function call(remoteUser) {
      var pc = connections[remoteUser] = setupPeerConnectionObject(remoteUser, true);

      pc.addStream(app.get('localStream'));

      pc.createOffer(function (desc) {
        pc.setLocalDescription(desc);
        socket().emit('offer', {"from": app.get('user'), "to": remoteUser, "offerSDP": desc});
      }, logError);
    }

    app.get('participants').forEach(function (remoteUser) {
      if (remoteUser === app.get('user.userId') || (remoteUser in connections))
        return;

      call(remoteUser);
    });
  }

  function answer(offer) {
    var callerId = offer.from.userId;
    var pc = connections[callerId] = setupPeerConnectionObject(callerId, false);

    pc.addStream(app.get('localStream'));

    pc.setRemoteDescription(new RTCSessionDescription(offer.offerSDP));

    pc.createAnswer(function (desc) {
      pc.setLocalDescription(desc);
      socket().emit('answer', {'from': app.get('user'), 'to': callerId, "answerSDP": desc});
    }, logError);

    start();
  }

  function share() {
    window.prompt("Use Ctrl+C or Cmd+C to copy. Then press enter.", location.href);
  }

  function socket() {
    return app.get('socket');
  }

  function logError(error) {
    console.log('something broke with: ', error);
  }
}

