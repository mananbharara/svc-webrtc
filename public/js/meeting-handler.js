function MeetingHandler(meetingId) {
  var localStream, calls = {}, answers = {}, participants = [], userContext = {userId: undefined, socket: undefined};

  setLocalStream();
  setupSocketMessaging();
  ChatHandler(userContext);
  ThemeHandler();

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
        userContext.socket.emit('ice candidate', {
          fromCaller: fromCaller,
          from: userContext.userId,
          to: remote,
          "candidate": evt.candidate
        });
      }
    };

    pc.onaddstream = function (evt) {
      var videoSrc = URL.createObjectURL(evt.stream);


      var fullScreen = false;

      function videoName() {
        return 'video-' + remote;
      }

      var remoteVideo = $('<video>').attr({
        id: videoName(),
        autoplay: true,
        src: videoSrc,
        'class': 'remote-video'
      });

      var $remoteVideoContainer = $('<div class="remote-video-container">' +
      '<button id=full-screen' + videoName() + '></button>' +
      '</div>').append(remoteVideo);

      $('#video-container').append($remoteVideoContainer);

      var $fullScreenButton = $('#full-screen' + videoName());
      var $video = $('#' + videoName());

      function applyFullScreenConfig() {
        $video.height($(window).height() + 'px');
        $video.width($(window).width() + 'px');
        $remoteVideoContainer.addClass('full-screen');
        fullScreen = true;
      }

      var timeoutId;
      var resizeFunction = function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
          applyFullScreenConfig();
        }, 150);
      };

      function fullScreenOn() {
        var el = document.documentElement, rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
        rfs.call(el);
        applyFullScreenConfig();
        $(window).on('resize', resizeFunction);
      }

      function fullScreenOff() {
        var el = document, rfs = el.cancelFullScreen || el.webkitExitFullscreen || el.mozCancelFullScreen;
        rfs.call(el);
        $video.height('');
        $video.width('');
        $remoteVideoContainer.removeClass('full-screen');
        fullScreen = false;
        $(window).off('resize', resizeFunction);
      }

      $fullScreenButton.click(function () {
        fullScreen ? fullScreenOff() : fullScreenOn();
      });
    };

    return pc;
  }

  function setupSocketMessaging() {
    userContext.socket = socket = io.connect(location.origin, {transports: ['websocket']});

    socket.on('connect', function () {
      console.log('Connection established');
      userContext.userId = socket.io.engine.id;
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
        userContext.socket.emit('offer', {"from": userContext.userId, "to": remoteUser, "offerSDP": desc});
      }, logError);
    }

    participants.forEach(function (remoteUser) {
      if (remoteUser === userContext.userId || (remoteUser in calls))
        return;

      call(remoteUser);
    });
  }

  function answer(offer) {
    var pc = answers[offer.from] = setupPeerConnectionObject(offer.from, false);

    pc.setRemoteDescription(new RTCSessionDescription(offer.offerSDP));

    pc.createAnswer(function (desc) {
      pc.setLocalDescription(desc);
      userContext.socket.emit('answer', {'from': userContext.userId, 'to': offer.from, "answerSDP": desc});
    }, logError);

    start();
  }

  function setLocalStream() {
    var $window = $(window);
    var localVideo = $('#local-video'), callButton = $('#call-button'), shareLink = $('#share-link');

    localVideo.prop('muted', true);
    navigator.getUserMedia({audio: true, video: true}, function (stream) {
      localStream = stream;
      localVideo.attr({src: URL.createObjectURL(localStream)});

      localVideo.on('mousedown', mouseDown);
      $window.on('mouseup', mouseUp);

      var offset = {};
      function mouseDown(e) {
        var absoluteOffset = localVideo.offset();
        offset.x = e.clientX - absoluteOffset.left;
        offset.y = e.clientY - absoluteOffset.top;
        $window.on('mousemove', videoMove);
        e.preventDefault();
      }

      function mouseUp() {
        $window.off('mousemove', videoMove);
      }

      function videoMove(e) {
        localVideo.css({top: (e.clientY - offset.y) + 'px', left: (e.clientX - offset.x) + 'px'});
      }

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

