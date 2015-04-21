var isChrome = !!navigator.webkitGetUserMedia;

var STUN = {
  url: isChrome ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
};

var TURN = {
  url: 'turn:homeo@turn.bistri.com:80',
  credential: 'homeo'
};

var iceServers = {
  iceServers: [STUN]
};

// DTLS/SRTP is preferred on chrome
// to interop with Firefox
// which supports them by default

var DtlsSrtpKeyAgreement = {
  DtlsSrtpKeyAgreement: true
};

var optional = {
  optional: [DtlsSrtpKeyAgreement]
};