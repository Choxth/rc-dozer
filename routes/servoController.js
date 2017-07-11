/**
 * This module handles the REST requests for the motor control resource, passing values
 * to the local servoDriver module.
 * This conforms to the pattern:   POST /servo  with body { leftMotor: %value, rightMotor: %value }
 */
"use strict";

var servoDriver = require('../public/servoDriver');
var servoPath = '/servo';

var driverA;
/**
 * Configure this module
 * @param app
 * @param config
 */
var configure = function (app) {
    app.post (servoPath, setServo );

    var options = {
        servoOneEnabled : true,
        servoTwoEnabled : true,
        servoOnePort: 'B',
        servoTwoPort: 'B',
        servoOnePin: 5,
        servoTwoPin: 6
    };

    driverA = new servoDriver.ServoDriver();
    driverA.init(options);
    console.log('-> ServoController registered at: /servo');

};
module.exports.configure = configure;

var setServo = function(req, res, next) {
    var bd = req.body;

    if (bd && bd.pwmPeriod) {
        //console.log( '-> Servo setting  -> pwm: [' + bd.pwmPeriod + ']' );
        //servoDriver.setFrequency( bd.pwmPeriod );
    }

    if (bd && bd.cwCycle && bd.ccwCycle) {
        //console.log( '-> Servo setting  -> dutyCyle: [' + bd.cwCycle + '][' + bd.ccwCycle + ']' );
        driverA.setDuty( bd.cwCycle, bd.ccwCycle );
        res.status(200).send('Confirm setting [cwCycle][ccwCycle]: [' + bd.cwCycle + '][' + bd.ccwCycle + ']');
    } else {

        console.log('Not setting servo! cwCycle exists? ' + (bd.cwCycle != undefined) + ', ccwExists? ' +
                    (bd.ccwCycle != undefined) );
        res.status(400).send('Rejected setting, missing parameter: ' );
    }
};
module.exports.setServo = setServo;