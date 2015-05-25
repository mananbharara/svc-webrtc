function ChatHandler(userContext) {
  var messages = [], ractive;

  $.ajax('templates/chat-template.html').done(loadRactive);

  function loadRactive(template) {
    ractive = new Ractive({
      el: '#chat-container',
      template: template,
      data: {
        name: 'Manan',
        messages: messages
      }
    });

    ractive.on('send', function (e) {
      var keyCode = e.original.keyCode || e.original.which;
      if (keyCode == 13) {
        userContext.socket.emit('message', {"from": userContext.userId, "message": ractive.get('message')});
        ractive.set('message', '');
      }
    });
  }


  userContext.socket.on('message', function (message) {
    console.log(message);
    messages.push(message);
  });
}