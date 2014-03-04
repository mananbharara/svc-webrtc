var user = 'user' + parseInt(Math.random() * 1000, 10), socket, pc;

document.onreadystatechange = function () {
  if (document.readyState !== 'complete')
    return;

  setupPeerConnectionObject();
  setupSocketConnection();

  document.getElementById('start-button').onclick = function () {
    this.disabled = true;
    call();
  };
};

function setupPeerConnectionObject() {
  pc = new RTCPeerConnection(null);

  pc.onicecandidate = function (evt) {
    socket.send(JSON.stringify({"user": user, "candidate": evt.candidate}));
  };

  pc.onaddstream = function (evt) {
    document.getElementById('remote-video').src = URL.createObjectURL(evt.stream);
  };
}

function setupSocketConnection() {
  socket = new WebSocket(['ws:', '//', location.hostname, ':8000'].join(''));

  socket.onopen = function (e) {
    console.log('Connection established', e);
  };

  socket.onmessage = function (evt) {
    var signal = JSON.parse(evt.data);
    if (signal.user === user)
      return;

    if (signal.offerSDP)
      answer(signal.offerSDP);
    else if (signal.answerSDP) {
      pc.setRemoteDescription(new RTCSessionDescription(signal.answerSDP));
    }
    else if (signal.candidate)
      pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
  };
}

function answer(offerSDP) {
  pc.setRemoteDescription(new RTCSessionDescription(offerSDP));

  pc.createAnswer(function (desc) {
    pc.setLocalDescription(desc);
    socket.send(JSON.stringify({"user": user, "answerSDP": desc}));
  }, function () {
  });
}

function call() {
  navigator.getUserMedia({video: true}, onMediaSuccess, errorLogger);

  function onMediaSuccess(stream) {
    document.getElementById('local-video').src = URL.createObjectURL(stream);
    pc.addStream(stream);

    pc.createOffer(function (desc) {
      pc.setLocalDescription(desc);
      socket.send(JSON.stringify({"user": user, "offerSDP": desc}));
    }, errorLogger);
  }
}

function errorLogger(error) {
  console.log('Something broke with: ', error);
}