/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var CALENDAR_ICON = 'https://cdn-icons-png.flaticon.com/512/747/747310.png';

TrelloPowerUp.initialize({
	'card-buttons': function(t, options) {
		return [{
			icon: CALENDAR_ICON,
			text: 'Download ICS',
      callback: function(t) {
        return t.popup({
          title: "Calendar Event",
          url: 'estimate.html',
        });
      }
		}];
	},
});
