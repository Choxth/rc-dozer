var express = require('express');
var app = express();
var server = require('http').Server(app);
var os = require('os');
var path = require('path');

var port = 8000;

server.listen(port, function () {
  // console.log(`http://${os.hostname()}.local:${port}`);
});

app.use(express.static(path.join(__dirname, '/public')));

var bodyParser = require('body-parser');
   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({extended: true}));



var physics = require('./public/physics');
var car = new physics.Body(0, 0, 0, 10);

require('./public/i2cInterface').configure(car);
require ('./routes/hello').configure(app);
require ('./routes/streamer').configure(app);
require ('./routes/motorController').configure(app);
//require ('./routes/servoController').configure(app);
require ('./routes/bodyMonitor').configure(app, car);


// app.get('/stream', (request, response) => {
  // response.redirect(camera.url);
// });
