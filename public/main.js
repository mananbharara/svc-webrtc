navigator.getMedia = ( navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

navigator.getMedia({video: true}, function (stream) {
  document.getElementById("video").setAttribute('src', URL.createObjectURL(stream));
});