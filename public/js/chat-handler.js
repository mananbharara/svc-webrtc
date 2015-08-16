function ChatHandler() {
  var ractive;

  $.ajax('templates/chat-template.html').done(loadRactive);

  function loadRactive(template) {
    ractive = new Ractive({
      el: '#chat-container',
      template: template,
      data: {
        name: app.get('user.username'),
        messages: [],
        minimized: true
      }
    });

    ractive.on('send', function (e) {
      var keyCode = e.original.keyCode || e.original.which;
      if (keyCode == 13) {
        app.get('socket').emit('message', {"from": app.get('user'), "message": ractive.get('message')});
        ractive.set('message', '');
      }
    });

    ractive.on('minimize', function () {
      ractive.set('minimized', !ractive.get('minimized'));
    });
  }


  app.get('socket').on('message', function (message) {
    console.log(message);
    ractive.get('messages').push(message);

    var $meetingContainer = $('#message-container');
    $meetingContainer.scrollTop($meetingContainer[0].scrollHeight);
  });
}