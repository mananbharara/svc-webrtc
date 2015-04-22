function MeetingHandler(meetingId) {
  var localStream, me, socket, calls = {}, answers = {}, participants = [];

  setLocalStream();
  setupSocketMessaging();

  $('#call-button').click(function () {
    start();
  });

  function setupPeerConnectionObject(remote, fromCaller) {
    var pc = new RTCPeerConnection(iceServers, optional);

    pc.onicecandidate = function (evt) {
      if (evt.candidate && (evt.candidate.candidate.indexOf('relay') == -1)) {
        if (evt.candidate.candidate.indexOf('typ host') != -1)
          console.log('Local call! :D');
        socket.emit('ice candidate', {fromCaller: fromCaller, from: me, to: remote, "candidate": evt.candidate});
      }
    };

    pc.onaddstream = function (evt) {
      var remoteVideo = $('<video>').attr({
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
    var localVideo = $('#local-video'), callButton = $('#call-button');

    localVideo.attr({muted: 'muted'});
    navigator.getUserMedia({audio: true, video: true}, function (stream) {
      localStream = stream;
      localVideo.attr({src: URL.createObjectURL(localStream)});
      callButton.removeAttr('disabled');
    }, logError);
  }

  function logError(error) {
    console.log('something broke with: ', error);
  }
}

