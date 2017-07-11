"use strict";


var tessel = require('tessel');

function ServoDriver() {


    this.servoPWMFrequency = 50;   // This is equal to 20 ms default servo frequency setting. This doesn't need to be set
                                  // all the time unless it changes
    this.defaultDuty = 0.075;

    /**
     * Set the defaults, and allow the client to override them if necessary.
     * Export this block so a client can easily access the correct properties
     */
    this.options = {
        servoAEnabled: true,
        servoBEnabled: true,
        servoAPort: 'B',
        servoBPort: 'B',
        servoAPWMPin: 5,
        servoBPWMPin: 6
    };
}
ServoDriver.prototype.constructor = ServoDriver;
module.exports.ServoDriver = ServoDriver;



function init(clientOptions) {

    var theThis = this;
    Object.getOwnPropertyNames( this.options).forEach(
        function (val, idx, array) {
            theThis.options[val] = clientOptions[val] || theThis.options[val];
            console.log('  > ServoDriver.' + val + ' = ' + theThis.options[val]);
        });
    console.log('-------------------------');

    /**
     * This driver accepts a call to set the motor speed and direcion
     */
    this.pwmAPin = tessel.port[this.options.servoAPort].pin[this.options.servoAPWMPin];    // Servo A PWM servo output
    this.pwmBPin = tessel.port[this.options.servoBPort].pin[this.options.servoBPWMPin];    // Servo B PWM servo output

    // Set the frequency at the start and we wont touch it again
    tessel.pwmFrequency(this.servoPWMFrequency);
}
ServoDriver.prototype.init = init;

/**
 * Function to set the duty cycle on one or more servo pins.
 *
 * @param aDuty Duty cycle in range 0 .. 1
 * @param bDuty Duty cycle for B output pin in range: 0 .. 1
 */
function setDuty  (aDuty, bDuty) {

    if (aDuty < 0) {
        aDuty = 0;
    }
    if (aDuty > 1) {
        aDuty = 1;
    }
    if (bDuty < 0) {
        bDuty = 0;
    }
    if (bDuty > 1) {
        bDuty = 1;
    }
    console.log('-- cwDuty: ' + aDuty + ', ccw: ' + bDuty);

    this.pwmAPin.pwmDutyCycle (aDuty);
    this.pwmBPin.pwmDutyCycle (bDuty);
}
ServoDriver.prototype.setDuty = setDuty;


function setFrequency (frequency) {
    if (frequency <= 0) {
        frequency = this.servoPWMFrequency;
    }
    if (frequency != this.servoPWMFrequency) {
        tessel.pwmFrequency(frequency);
    }
}
ServoDriver.prototype.setFrequency = setFrequency;