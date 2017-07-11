/**
 * This module handles the REST requests for the motor control resource, passing values
 * to the local motorDriver module.
 * This conforms to the pattern:   POST /motor  with body { leftMotor: %value, rightMotor: %value }
 */
"use strict";

var motorDriver = require('../public/motorDriver');
var motorPath = '/motor';

var cachedMotorA = 0;
var cachedMotorB = 0;
var driverA;

module.exports.configure = function (app) {
    app.post (motorPath, setMotor );
    console.log('-> MotorController registered at: /motor');
    var driverAoptions = {
        motorAEnabled : true,
        motorBEnabled : true,
        motorAPort: 'A',
        motorBPort: 'A',
        motorAPWMPin: 5,
        motorADir1Pin: 4,
        motorADir2Pin: 3,

        motorBPWMPin: 6,
        motorBDir1Pin: 7,
        motorBDir2Pin: 1,

        controllerStandbyPort: 'A',
        controllerStandbyPin: 2
    };
    driverA = new motorDriver.MotorDriver();
    driverA.init(driverAoptions);
};


var setMotor = function(req, res, next) {
    var bd = req.body;
    //console.log('___ Body of request: ' + JSON.stringify(bd));

    if (bd) {
        if (bd.leftMotor && bd.rightMotor) {
            driverA.setMotor(bd.leftMotor, bd.rightMotor);
            cachedMotorA = bd.leftMotor;
            cachedMotorB = bd.rightMotor;
        } else if (bd.leftMotor) {
            driverA.setMotor(bd.leftMotor, cachedMotorB);
            cachedMotorA = bd.leftMotor;
        } else if (bd.rightMotor) {
            driverA.setMotor(cachedMotorA, bd.right);
            cachedMotorB = bd.rightMotor;
        } else {
            // This happens when the cursor is exactly in the middle, or has snapped back to center.
            //console.log('-');
            driverA.setMotor(0, 0);
        }
        res.status(200).send('Confirm setting: [' + cachedMotorA + '][' + cachedMotorB + ']');
    }
};


