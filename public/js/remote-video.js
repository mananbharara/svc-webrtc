function RemoteVideo(remoteId, videoSrc) {
  this.fullscreen = false;
  this.id = remoteId;
  this.src = videoSrc;
  var _this = this;
  var $video = $('#' + this.videoName()), $remoteVideoContainer = $video.parent();

  function applyFullScreenConfig() {
    $video.height($(window).height() + 'px');
    $video.width($(window).width() + 'px');
    $remoteVideoContainer.addClass('full-screen');
    _this.fullscreen = true;
  }

  var timeoutId;
  var resizeFunction = function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      applyFullScreenConfig();
    }, 150);
  };

  this.fullScreenOn = function () {
    var el = document.documentElement, rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
    rfs.call(el);
    applyFullScreenConfig();
    $(window).on('resize', resizeFunction);
  };

  this.fullScreenOff = function () {
    var el = document, rfs = el.cancelFullScreen || el.webkitExitFullscreen || el.mozCancelFullScreen;
    rfs.call(el);
    $video.height('');
    $video.width('');
    $remoteVideoContainer.removeClass('full-screen');
    _this.fullscreen = false;
    $(window).off('resize', resizeFunction);
  };


}

RemoteVideo.prototype.videoName = function () {
  return 'video-' + this.id;
};
