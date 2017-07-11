"use strict";

var av = require('tessel-av');

// I want faster updates, but poorer quality. I need to get rapid updates to navigate effectively.
// Be nice to be able to change these on the fly,
var options = {
    fps: 60,
    quality: 0
};

var camera = new av.Camera( options );


module.exports.configure = function(app) {
  app.get('/stream', function (request, response) {
    response.redirect(camera.url);
  });
  console.log('-> Streamer registered at: ' + camera.url);
};
