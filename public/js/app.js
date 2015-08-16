var app;
function appHandler(meetingId) {
  $.ajax('templates/app.html').done(loadRactive);

  function loadRactive(template) {
    app = new Ractive({
      el: '.content',
      template: template,
      data: {
        user: {},
        participants: [],
        remotes: [],
        meetingId: meetingId
      }
    });

    app.set('genericErrorHandler', function logError(error) {
      console.log('something broke with: ', error);
    });

    MeetingHandler(meetingId, app);
  }
}