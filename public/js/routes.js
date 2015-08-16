Path.map('#/').to(function () {
  $.post('/meetings', function (data) {
    location.hash = '/' + data.meetingNumber;
  });
});

Path.map('#/:meetingId').to(function() {
  appHandler(this.params.meetingId);
});

Path.root('#/');