/**
 * Created by gdick on 27/03/17.
 */
"use strict";

// This module handles the accelerometer/gyroscope

var tessel = require('tessel');
var data = require('./i2Constants');
var async = require('async');


var com_allthings_accelDriver = function() {

    var MAX_XL_RANGE = 16383.0;
    var DC_VALUE_COUNTER = 10.0;
    var getXLBuffer = new Buffer([data.OUTX_L_XL]);
    var getGyroBuffer = new Buffer([data.OUTX_L_G]);
    var getStatusBuffer = new Buffer([data.STATUS_REG]);

    var dcXLValues = [0.0, 0.0, 0.0];
    var dcGyroValues  = [0.0, 0.0, 0.0];

    var xlValues = [0.0, 0.0, 0.0];
    var gyroValues = [0.0, 0.0, 0.0];

    var xlReadingIdx = 0;
    var gyroReadingIdx = 0;

    //var validDataIdx = 0;
    //var accumulatedTime = 0;

    var gyroFudge = 143.358689;


// Connect to device
    var port = tessel.port.B; // Use the SCL/SDA pins of Port B
    //tessel.port.B.I2C.frequency = 400000;
    var i2c = new port.I2C(data.accelerometerAddress); // Initialize I2C communication


    /**
     * Init function for all devices on the address. For the Accelerometer chip, this is the
     * XLeromter and the gyroscope.
     * @param barrel
     * @param callback
     */
    var init = function(barrel, callback) {

        async.waterfall(
        [
            function (cb) {
                i2c.transfer(new Buffer([data.WHO_AM_I]), 1, function (error, dataReceived) {
                    // Print data received (buffer of hex values)
                    if (error) {
                        console.log("Error in xl init", error);
                        return cb(error, barrel);
                    }
                    console.log('Value of Who_am_I address: ', dataReceived);
                    cb(null);
                });
            },

            function(cb) {
                i2c.send(new Buffer([data.CTRL9_XL, 0x38]), function (error) {

                    if (error) {
                        console.log('Exception Enabling Accelerometer Axis: ' + error);
                        return cb(error);
                    } else {
                        console.log('XL Axis enabled!');
                    }
                    cb(null);
                });
            },

            function(cb) {
                i2c.send(new Buffer([data.CTRL1_XL, 0x10]), function (error) {
                    if (error) {
                        console.log('Exception setting XL power mode: ', error);
                        return cb(error);
                    }
                    cb(null);
                });
            },
            function(cb) {
                i2c.send(new Buffer([data.CTRL2_G, 0x30]), function (error) {
                    if (error) {
                        console.log('Exception setting Gyro power mode: ', error);
                        return cb(error);
                    }
                    console.log('G power mode set... Confirmed');
                    cb(null);
                });
            },
            function(cb) {
                // enable gyro output for axis
                i2c.send(new Buffer([data.CTRL10_C, 0x38]), function (error) {
                    if (error) {
                        console.log('Exception Enabling Gyro Axis: ' + error);
                        return cb(error);
                    }

                    console.log('Gyro axis output enabled... Confirmed');
                    return cb(null);
                });
            }
        ],

            function (err) {
                callback(err, barrel);
            }
        );
    };
    module.exports.init = init;

    /**
     * All the code that is to read devices should be in this function as an async waterfall
     * pattern. The pattern should be to read the status word in the first access, then check
     * the data ready bits to prevent reading any data from a chip that isn't ready. I could put
     * all the devices in a separate function, but would then have to read the status word
     * multiple times.
     * @param barrel the map object in which to store device results
     * @param callback the callback for the calling function
     */
    var pollData = function(barrel, callback) {

        // Let's read some data !
        var start;

        async.waterfall(
            [
                function (cb) {
                    i2c.transfer(getStatusBuffer, 1, function (err, stat) {

                        if (err) {
                            console.log('Error reading chip ready status: ', err);
                            return cb(err);
                        }
                        //console.log('Got a stat word... ', stat[0]);
                        barrel.statWord = stat[0];
                        cb(null);
                    });
                },
                /**
                 * Based on the status bytes, determine the start location and
                 * read count of the data, knowing that the gyro data is first, and the
                 * xl data address is contiguously after the gyro data.
                 * @param cb
                 */
                function (cb) {
                    var statString = "No new data at all";
                    barrel.readCount = 0;
                    if (barrel.statWord & 0x02) {
                        barrel.addressBuffer = getGyroBuffer;
                        barrel.readCount = 6;
                        statString = 'G ';
                    }
                    if (barrel.statWord & 0x01) {
                        // If the gyro data is available too, extend the read range
                        // Otherwise, adjust the read location and count to fit
                        if (barrel.addressBuffer) {
                            barrel.readCount += 6;
                            statString += ' + XL';
                        } else {
                            barrel.addressBuffer = getXLBuffer;
                            barrel.readCount = 6;
                            statString += 'XL only';
                        }
                    }
                    //console.log(statString + ' count: ' + barrel.readCount);
                    cb(null);
                },

                function (cb) {

                    // Read the determined start address and number of bytes
                    // When we get temperature online, it's before the gyro data !
                    if (barrel.addressBuffer) {
                        i2c.transfer(barrel.addressBuffer, barrel.readCount, function (error, allData) {

                            if (error) {
                                console.log('Error reading gyro buffer: ', error);
                                return cb(err);
                            }
                            //console.log('Got data: ', allData);
                            barrel.allData = allData;
                            cb(null);
                        });
                    } else {
                        cb(null);
                    }
                },


                function(cb) {

                    barrel.xlReading = false;
                    barrel.gyroReading = false;
                    if ((barrel.statWord & 0x01) > 0) {
                        start = Date.now();
                        // in the buffer that we have read, there should be some new data
                        if (!((barrel.statWord & 0x02) > 0) ) {
                            barrel.xlOffset = 0;
                        } else {
                            barrel.xlOffset = 6;
                        }
                        xlReadingIdx++;
                        //console.log('Yo: ' + xlReadingIdx);
                        handleXLData(barrel, dcXLValues, xlReadingIdx, xlValues);
                        barrel.ax = xlValues[0];
                        barrel.ay = xlValues[1];
                        barrel.az = xlValues[2];
                        barrel.xlReading = true;
                    }
                    cb(null);
                },

                function (cb) {

                    if ((barrel.statWord & 0x02) > 0) {
                        gyroReadingIdx++;
                        handleGyroData(barrel, dcGyroValues, gyroReadingIdx, gyroValues);
                        barrel.wx = gyroValues[0];
                        barrel.wy = gyroValues[1];
                        barrel.wz = gyroValues[2];
                        //console.log(gyroValues);
                        barrel.gyroReading = true;
                    }
                    cb(null);
                }
            ],
            function (err) {
                callback (err, barrel);
            }
        );
    };

    /**
     * This function does the appropriate bits with the data depending on the sampling
     * counter. That means,
     * 1) establish a dc level, or
     * 2) return the reading with the dc bias taken out.
     *
     * I don't think it's so much real dc bias as it is a non-level bias. If I leave it in,
     * it will look like the car is continuously accelerating at some value off into the
     * distance.
     *
     * @param barrel the map containing the allData buffer
     * @param dcVals
     * @param counter
     * @param vals
     */
    function handleXLData (barrel, dcVals, counter, vals) {

        vals[0] = 0.0;
        vals[1] = 0.0;
        vals[2] = 0.0;
        var dx = barrel.xlOffset;
        if (counter < DC_VALUE_COUNTER) {
            // for the first little while, accumulate all readings
            dcVals[0] +=  barrel.allData.readInt16LE(dx)   / MAX_XL_RANGE;
            dcVals[1] +=  barrel.allData.readInt16LE(dx+2) / MAX_XL_RANGE;
            dcVals[2] +=  barrel.allData.readInt16LE(dx+4) / MAX_XL_RANGE;
            //console.log('Handling bias zeroing: ' + counter, ', ->', dcVals);
        } else if (counter == DC_VALUE_COUNTER) {
            // then, once, divide the accumulation by the number of readings
            dcVals[0] /= DC_VALUE_COUNTER;
            dcVals[1] /= DC_VALUE_COUNTER;
            dcVals[2] /= DC_VALUE_COUNTER;
            console.log('Calculated XL dc values!', dcVals);
        } else if (counter > DC_VALUE_COUNTER) {
            // and henceforth, use those initial readings as the base level
            vals[0] = (barrel.allData.readInt16LE(dx)   / MAX_XL_RANGE) - dcVals[0];
            vals[1] = (barrel.allData.readInt16LE(dx+2) / MAX_XL_RANGE) - dcVals[1];
            vals[2] = (barrel.allData.readInt16LE(dx+4) / MAX_XL_RANGE) - dcVals[2];
            //console.log('-> Values ' + vals[0].toFixed(2) + ',' + vals[1].toFixed(2) + ',' + vals[2].toFixed(2));
        }
    }

    /**
     * This function processes the gyro data. Take the first DC_VALUE_COUNTER
     * readings and the average is the base dc bias.
     *
     * Then each reading is taken wrt those baseline zero readings.
     *
     * @param barrel the runtime values map
     * @param dcValsBuf The flatline data buffer.
     * @param counter An external counter
     * @param outVals The output buffer
     */
    function handleGyroData (barrel, dcValsBuf, counter, outVals) {

        outVals[0] = 0.0;
        outVals[1] = 0.0;
        outVals[2] = 0.0;

        // The gyro data is currently first in the allData buffer. This might
        // change when/if we enable the temp data, which is also in there
        if (counter < DC_VALUE_COUNTER) {
            dcValsBuf[0] +=  barrel.allData.readInt16LE(0) * gyroFudge / MAX_XL_RANGE;
            dcValsBuf[1] +=  barrel.allData.readInt16LE(2) * gyroFudge / MAX_XL_RANGE;
            dcValsBuf[2] +=  barrel.allData.readInt16LE(4) * gyroFudge / MAX_XL_RANGE;
            //console.log('Handling bias zeroing: ' + counter, ', ->', dcVals);
        } else if (counter == DC_VALUE_COUNTER) {
            dcValsBuf[0] /= DC_VALUE_COUNTER;
            dcValsBuf[1] /= DC_VALUE_COUNTER;
            dcValsBuf[2] /= DC_VALUE_COUNTER;
            console.log('Calculated dc Gyro values!', dcValsBuf);
        } else if (counter > DC_VALUE_COUNTER + 10) {
            outVals[0] = (barrel.allData.readInt16LE(0) * gyroFudge / MAX_XL_RANGE) - dcValsBuf[0];
            outVals[1] = (barrel.allData.readInt16LE(2) * gyroFudge / MAX_XL_RANGE) - dcValsBuf[1];
            outVals[2] = (barrel.allData.readInt16LE(4) * gyroFudge / MAX_XL_RANGE) - dcValsBuf[2];
            //if (display) {
            //    console.log('-> Values (x)' + outVals[0].toFixed(2) + ', (y)' +  outVals[1].toFixed(2) + ',(z)' + outVals[2].toFixed(2));
            //}
        }
    }

    module.exports.pollData = pollData;

}();