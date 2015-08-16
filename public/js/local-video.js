function LocalVideo() {
  var $window = $(window), localVideo = $('#local-video');

  localVideo.prop('muted', true);
  navigator.getUserMedia({audio: true, video: true}, function (stream) {
    app.set('localStream', stream);
    localVideo.attr({src: URL.createObjectURL(stream)});

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

    app.set('gotLocalStream', true);
  }, app.get('genericErrorHandler'));
}