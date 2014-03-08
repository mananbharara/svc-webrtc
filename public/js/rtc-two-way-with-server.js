var user = 'user' + parseInt(Math.random() * 1000, 10), socket, pc, localStream;

document.onreadystatechange = function () {
  if (document.readyState !== 'complete')
    return;

  document.getElementById('local-video').muted = 'muted';
  setupPeerConnectionObject();
  setupSocketConnection();

  document.getElementById('start-button').onclick = function () {
    this.disabled = true;
    startLocalStream();
  };

  document.getElementById('call-button').onclick = function () {
    this.disabled = true;
    call();
  };
};

function startLocalStream() {
  navigator.getUserMedia({video: true, audio: true}, onMediaSuccess, errorLogger);

  function onMediaSuccess(stream) {
    localStream = stream;
    document.getElementById('local-video').src = URL.createObjectURL(stream);
    document.getElementById('call-button').disabled = false;
  }
}

function setupPeerConnectionObject() {
  pc = new RTCPeerConnection(null);

  pc.onicecandidate = function (evt) {
    socket.emit('message', {"user": user, "candidate": evt.candidate});
  };

  pc.onaddstream = function (evt) {
    document.getElementById('remote-video').src = URL.createObjectURL(evt.stream);
  };
}

function setupSocketConnection() {
  socket = io.connect(location.origin, {transports: ['websocket']});

  socket.on('connect', function (e) {
    console.log('Connection established', e);
  });

  socket.on('message', function (signal) {
    if (signal.offerSDP)
      answer(signal.offerSDP);
    else if (signal.answerSDP) {
      pc.setRemoteDescription(new RTCSessionDescription(signal.answerSDP));
    }
    else if (signal.candidate)
      pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
  });
}

function answer(offerSDP) {
  pc.addStream(localStream);

  pc.setRemoteDescription(new RTCSessionDescription(offerSDP));

  pc.createAnswer(function (desc) {
    pc.setLocalDescription(desc);
    socket.emit('message', {"user": user, "answerSDP": desc});
  }, errorLogger);
}

function call() {
  pc.addStream(localStream);

  pc.createOffer(function (desc) {
    pc.setLocalDescription(desc);
    socket.emit('message', {"user": user, "offerSDP": desc});
  }, errorLogger);
}

function errorLogger(error) {
  console.log('Something broke with: ', error);
}