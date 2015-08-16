function NavHandler() {
  var ractive;

  $.ajax('templates/nav-template.html').done(loadRactive);

  function loadRactive(template) {
    ractive = new Ractive({
      el: '#nav',
      template: template,
      data: {
        username: localStorage.getItem('username')
      }
    });

    ractive.observe('username', function (newVal) {
      localStorage.setItem('username', newVal);
      app.set('user.username', newVal);
    });

    ractive.on('setOnEnter', function (e) {
      var keyCode = e.original.keyCode || e.original.which;
      if (keyCode == 13) {
        $(e.original.currentTarget).blur();
      }
    });

    ractive.on('navout', function () {
      $('nav').toggleClass('expanded')
    });

    app.observe('participants', function (newVal) {
      ractive.set('participants', newVal);
    })
  }
}