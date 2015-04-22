Path.map('#/').to(function () {
  $.post('/meetings', function (data) {
    location.hash = '/' + data.meetingNumber;
  });
});

Path.map('#/:meetingNumber').to(function() {
  MeetingHandler();
});

Path.root('#/');