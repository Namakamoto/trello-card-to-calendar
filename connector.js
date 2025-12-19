window.TrelloPowerUp.initialize({
  'card-buttons': function(t, options) {
    return [{
      icon: 'https://cdn-icons-png.flaticon.com/512/747/747310.png',
      text: 'Calendar Event',
      callback: function(t) {
        return t.popup({
          title: 'Calendar Event',
          url: './index.html',
          height: 200
        });
      }
    }];
  }
});
