function NavHandler(userContext) {
  var ractive;

  $.ajax('templates/nav-template.html').done(loadRactive);

  function loadRactive(template) {
    ractive = new Ractive({
      el: '#nav',
      template: template,
      data: {
        userContext: userContext
      }
    });

    ractive.observe('userContext.userId', function (newVal) {
      localStorage.setItem('username', newVal);
    });

    ractive.on('setOnEnter', function (e) {
      var keyCode = e.original.keyCode || e.original.which;
      if (keyCode == 13) {
        $(e.original.currentTarget).blur();
      }
    });

    ractive.on('navout', function() {
      $('nav').toggleClass('expanded')
    });
  }

  var updateParticipants = function (participants) {
    ractive.set('userContext.participants', participants);
  };

  return {updateParticipants: updateParticipants};
}