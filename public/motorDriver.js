"use strict";

// Import the interface to Tessel hardware
var tessel = require('tessel');

function MotorDriver () {

    /**
     * Set the defaults, and allow the client to override them if necessary.
     * Export this block so a client can easily access the correct properties
     */
    this.options = {
        motorAEnabled: true,
        motorBEnabled: true,
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
}
MotorDriver.prototype.constructor = MotorDriver;
module.exports.MotorDriver = MotorDriver;

/**
 * Init the motor driver allowing user configuration or resorting back to default values
 * @param options
 */
function init (clientOptions) {
    var theThis = this;
    // Copy all potential user values over any default values
    console.log('--- Motor Driver properties ---------');
    Object.getOwnPropertyNames( this.options).forEach(
        function (val, idx, array) {
            theThis.options[val] = clientOptions[val] || theThis.options[val];
            console.log('  > MotorDriver.' + val + ' = ' + theThis.options[val]);
        });
    console.log('-------------------------');

    this.pwmAPin = tessel.port[this.options.motorAPort].pin[this.options.motorAPWMPin];  // PWM pin goes to PWMA pin on controller
    this.dirA1Pin = tessel.port[this.options.motorAPort].pin[this.options.motorADir1Pin];  // Direction 1 pin port A goes to AIN1 pin on controller
    this.dirA2Pin = tessel.port[this.options.motorAPort].pin[this.options.motorADir2Pin];  // Direction 2 pin port A goes to AIN2 pin on controller

    this.pwmBPin = tessel.port[this.options.motorBPort].pin[this.options.motorBPWMPin];
    this.dirB1Pin = tessel.port[this.options.motorBPort].pin[this.options.motorBDir1Pin];
    this.dirB2Pin = tessel.port[this.options.motorBPort].pin[this.options.motorBDir2Pin];

    this.stbyPin = tessel.port[this.options.controllerStandbyPort].pin[this.options.controllerStandbyPin];  //  Standby pin goes to STBY pin on controller


// Set the signal frequency to 500 Hz, or 500 refreshes per second
// This the rate at which Tessel will send the PWM signals
// If this is too low, for specific applications such as LEDs, the
// dimness would be off.
    tessel.pwmFrequency(50);

// No use for standby atm, so set it high and forget it
    this.stbyPin.output(1);

}
MotorDriver.prototype.init = init;

/**
 * Function to set motor speeds. This function is called from the API endpoint either REST or
 * serial.
 *
 * @param leftPercent The speed setting for the left motor from -100 to 100
 * @param rightPercent The speed setting for the right motor from -100 to +100
 */
function setMotor (leftPercent, rightPercent) {

    var lDuty = Math.abs( leftPercent / 100.0);
    var rDuty = Math.abs( rightPercent / 100.0);
    //console.log('Setting motors: [' + leftPercent + '][' + rightPercent + ']');

    if (lDuty > 1) {
        lDuty = 0.99;
    }
    if (rDuty > 1) {
        rDuty = 0.99;
    }

    this.pwmAPin.pwmDutyCycle( lDuty );
    this.pwmBPin.pwmDutyCycle( rDuty );

    if (leftPercent < 0) {
        this.dirA1Pin.output(1);
        this.dirA2Pin.output(0);
    } else {
        this.dirA1Pin.output(0);
        this.dirA2Pin.output(1);
    }

    if (rightPercent < 0) {
        this.dirB1Pin.output(1);
        this.dirB2Pin.output(0);
    } else {
        this.dirB1Pin.output(0);
        this.dirB2Pin.output(1);
    }
}
MotorDriver.prototype.setMotor = setMotor;
