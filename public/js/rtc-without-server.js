var pc1, pc2;

function call(stream) {
  var servers = null;
  pc1 = new RTCPeerConnection(servers);
  pc1.onicecandidate = iceCallback1;

  pc2 = new RTCPeerConnection(servers);
  pc2.onicecandidate = iceCallback2;
  pc2.onaddstream = gotRemoteStream;

  pc1.addStream(stream);

  pc1.createOffer(function (desc) {
    pc1.setLocalDescription(desc);
    console.log("Offer from pc1 \n" + desc.sdp);
    pc2.setRemoteDescription(desc);

    var gotDescriptionPC2 = function (answerDesc) {
      pc2.setLocalDescription(answerDesc);
      console.log("Answer from pc2 \n" + answerDesc.sdp);
      pc1.setRemoteDescription(answerDesc);
    };

    pc2.createAnswer(gotDescriptionPC2, errorLogger);
  }, errorLogger);

  function iceCallback1(event) {
    if (event.candidate) {
      pc2.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  }

  function iceCallback2(event) {
    if (event.candidate) {
      pc1.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  }

  function gotRemoteStream(e) {
    document.getElementById('remote-video').src = URL.createObjectURL(e.stream);
    console.log("Received remote stream");
  }
}

document.onreadystatechange = function (e) {
  if (document.readyState !== 'complete')
    return;

  document.getElementById('start-button').onclick = function () {
    this.disabled = true;
    navigator.getUserMedia({video: true}, function (stream) {
      document.getElementById('local-video').src = URL.createObjectURL(stream);
      call(stream);
    }, errorLogger);
  };
};

function errorLogger(error) {
  console.log('Something broke with: ', error);
}