function MeetingHandler(meetingId) {
  var localStream, me, socket, calls = {}, answers = {}, participants = [];

  setLocalStream();
  setupSocketMessaging();

  $('#call-button').click(function () {
    start();
  });
  $('#share-link').click(function () {
    window.prompt("Use Ctrl+C or Cmd+C to copy. Then press enter.", location.href);
  });

  function setupPeerConnectionObject(remote, fromCaller) {
    var pc = new RTCPeerConnection(iceServers, optional);

    pc.onicecandidate = function (evt) {
      if (evt.candidate && (evt.candidate.candidate.indexOf('relay') == -1)) {
        socket.emit('ice candidate', {fromCaller: fromCaller, from: me, to: remote, "candidate": evt.candidate});
      }
    };

    pc.onaddstream = function (evt) {
      var remoteVideo = $('<video>').attr({
        id: 'video-' + remote,
        autoplay: true,
        src: URL.createObjectURL(evt.stream)
      }).addClass('remote-video');

      $('#video-container').append(remoteVideo);
    };

    return pc;
  }

  function setupSocketMessaging() {
    socket = io.connect(location.origin, {transports: ['websocket']});

    socket.on('connect', function () {
      console.log('Connection established');
      me = socket.io.engine.id;
      socket.emit('join', {meetingId: meetingId});
    });

    socket.on('participants', function (data) {
      updateParticipants(data);
      participants = data;
      console.log('Participants in this meeting: ', participants);
    });

    socket.on('offer', function (offer) {
      answer(offer);
    });

    socket.on('ice candidate', function (iceCandidate) {
      if (iceCandidate.fromCaller)
        answers[iceCandidate.from].addIceCandidate(new RTCIceCandidate(iceCandidate.candidate));
      else
        calls[iceCandidate.from].addIceCandidate(new RTCIceCandidate(iceCandidate.candidate));
    });

    socket.on('answer', function (answer) {
      calls[answer.from].setRemoteDescription(new RTCSessionDescription(answer.answerSDP));
    });
  }

  function start() {
    function call(remoteUser) {
      var pc = calls[remoteUser] = setupPeerConnectionObject(remoteUser, true);

      pc.addStream(localStream);

      pc.createOffer(function (desc) {
        pc.setLocalDescription(desc);
        socket.emit('offer', {"from": me, "to": remoteUser, "offerSDP": desc});
      }, logError);
    }

    participants.forEach(function (remoteUser) {
      if (remoteUser === me || (remoteUser in calls))
        return;

      call(remoteUser);
    });
  }

  function answer(offer) {
    var pc = answers[offer.from] = setupPeerConnectionObject(offer.from, false);

    pc.setRemoteDescription(new RTCSessionDescription(offer.offerSDP));

    pc.createAnswer(function (desc) {
      pc.setLocalDescription(desc);
      socket.emit('answer', {'from': me, 'to': offer.from, "answerSDP": desc});
    }, logError);

    start();
  }

  function setLocalStream() {
    var localVideo = $('#local-video'), callButton = $('#call-button'), shareLink = $('#share-link');

    localVideo.prop('muted', true);
    navigator.getUserMedia({audio: true, video: true}, function (stream) {
      localStream = stream;
      localVideo.attr({src: URL.createObjectURL(localStream)});
      callButton.removeAttr('disabled');
      shareLink.removeAttr('disabled');
    }, logError);
  }

  function updateParticipants(data) {
    participants.forEach(function (participant) {
      if (data.indexOf(participant) === -1) {
        $('#video-' + participant).remove();
      }
    })
  }

  function logError(error) {
    console.log('something broke with: ', error);
  }
}

