"use strict";


var helloPath = '/hello';

module.exports.configure = function (app) {
    app.get(helloPath, sayHello);
    console.log('-> Hello Responder at: /hello');
};

function sayHello(req, res, next) {
  console.log('HELLO');
  res.status(200).send('Hello Earthling! Many Salutations...');
}
