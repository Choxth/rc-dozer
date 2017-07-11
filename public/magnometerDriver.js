/**
 * Created by gdick on 27/03/17.
 */
"use strict";

/**
 *  This module handles the magnetometer chip. This is a separate chip on the card and thus
 *  has a different i2c address and therefore requires a different handler.
 *
 *  TODO: This needs work
 */
var tessel = require('tessel');
var data = require('./i2Constants');

var MAX_XL_RANGE = 16383.0;

// Connect to device
var port = tessel.port.B; // Use the SCL/SDA pins of Port B
var i2c = new port.I2C(data.magnetometerAddress); // Initialize I2C communication

var init = function(barrel, cb) {

// Buffer contains address of the buffer to read, read 1 byte
    i2c.transfer(new Buffer([data.WHO_AM_I]), 1, function (error, buf) {
        // Print data received (buffer of hex values)
        if (error) {
            console.log('Error reading Magnetometer WhoAmI', error);
            return cb(error, barrel);
        }
        if (buf[0] == 0x3D) {
            console.log('Magnemometer WhoAmI... Confirmed');
        }

        //// This is for the gyro, not the magnetometer
        //i2c.send(new Buffer([data.CTRL2_G, 0x10]), function (error) {
        //
        //    if (error) {
        //        console.log('Exception enabline on magnetometer: ' + error);
        //        return cb(error, barrel);
        //    }
        //
        //    i2c.send(new Buffer([data.CTRL10_C, 0x38]), function (error) {
        //
        //        if (error) {
        //            console.log('xxxx Exception Enabling Magnetometer Axis: ' + error);
        //            return cb(error, barrel);
        //        } else {
        //            //console.log('Gyro Axis enabled!');
        //
        //            i2.send( new Buffer([ data.CTRL10_C, 0x38 ]), function (error) {
        //                if (error) {
        //                    console.log('xxxx Exception Enabling Magnetometer Axis: ' + error);
        //                    return cb(error, barrel);
        //                } else {
        //
        //                }
        //
        //            });
        //
        //            return cb(null, barrel);
        //        }
        //    });
        //});
        cb(null, barrel);
    });
};
module.exports.init = init;

/**
 * This function is
 * @param cb
 */
module.exports.pollData = function(barrel, cb) {

// Let's read!
    var errorCount = 0;

    var getDataBuffer = new Buffer([data.OUTX_L_XL]);
    var getStatusBuffer = new Buffer([data.STATUS_REG]);

    //i2c.transfer(getStatusBuffer, 1, function (err, stat) {
    //
    //    if (err) {
    //        console.log('Error reading status byte: ', err);
    //    }
    //
    //    //console.log(' -- status: [' + stat[0] + '] zero? ' + (stat[0] == 0));
    //    if (stat && 0x01 > 0) {
    //        // Starting at the first byte of the X axis accel data, read all six bytes of data
    //        // Should work while auto byte reading is enabled
    //        i2c.transfer(getDataBuffer, 6, function (error, accelData) {
    //
    //            if (error) {
    //                console.log('Error reading bytes: ', error);
    //            }
    //            barrel.mx = 0;
    //            barrel.my = 0;
    //            barrel.mz = 0;
    //            return cb(null, barrel);
    //        });
    //    } else {
    //        console.log('No news');
    //    }
    //});
    cb(null, barrel);
};
