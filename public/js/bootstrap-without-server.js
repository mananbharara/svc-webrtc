var pc1, pc2;

var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio': true,
  'OfferToReceiveVideo': true }};

function call(stream) {
  var servers = null;
  pc1 = new webkitRTCPeerConnection(servers);
  pc1.onicecandidate = iceCallback1;

  pc2 = new webkitRTCPeerConnection(servers);
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

    pc2.createAnswer(gotDescriptionPC2);
  });

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
  if (document.readyState === 'complete') {
    var button = document.getElementById('startButton');
    button.onclick = function () {
      this.disabled = true;
      navigator.webkitGetUserMedia({video: true}, function (stream) {
        document.getElementById('local-video').src = URL.createObjectURL(stream);
        call(stream);
      });
    };
  }
};

