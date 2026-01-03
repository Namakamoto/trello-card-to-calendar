var express = require('express');

var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('.'));

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
