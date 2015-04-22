Path.map('#/').to(function () {
  $.post('/meetings', function (data) {
    location.hash = '/' + data.meetingNumber;
  });
});

Path.map('#/:meetingId').to(function() {
  MeetingHandler(this.params.meetingId);
});

Path.root('#/');