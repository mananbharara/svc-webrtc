function ThemeHandler() {
  var ractive;

  $.ajax('templates/theme-buttons.html').done(loadRactive);

  function loadRactive(template) {
    ractive = new Ractive({
      el: '#theme-button-container',
      template: template
    });

    ractive.on('themeDark', function () {
      $('body').css({'background-image': "url('../images/grey_wash_wall.png')"});
    });

    ractive.on('themeWhite', function () {
      $('body').css({'background': 'rgba(237, 237, 237, 0.72)'});
    });
  }
}