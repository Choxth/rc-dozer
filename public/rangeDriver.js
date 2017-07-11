/**
 * Created by gdick on 27/03/17.
 */
"use strict";

// This module handles the Rangefinder module.

var tessel = require('tessel');
var data = require('./i2Constants');
var async = require('async');


var com_allthings_range = function () {

    var readFreshBuffer = new Buffer( [0x00, 0x16] );    // read the system fresh buf
    var whoAmIBuffer = new Buffer( [0x00, 0x00] );
    var resetFreshBuffer = new Buffer( [0x00, 0x16, 0x00] );   // write 00 to the system fresh buf

// Connect to device
    var port = tessel.port.B; // Use the SCL/SDA pins of Port B
    //tessel.port.B.I2C.frequency = 400000;
    console.log('rangefinder address; ' + data.rangeFinderAddress);
    var i2c = new port.I2C(data.rangeFinderAddress); // Initialize I2C communication


    /**
     * Init function for all devices on the address.
     * @param barrel
     * @param callback
     */
    var init = function(barrel, callback) {

        async.waterfall(
            [
                function(cb) {
                    cb(null);
                },
                function (cb) {
                    i2c.transfer(readFreshBuffer, 1, function (error, dataReceived) {
                        // Print data received (buffer of hex values)
                        if (error) {
                            console.log("Error in Rangefinder init read", error);
                            return cb(error, barrel);
                        }
                        //if (dataReceived[0] == 0x01) {
                            //console.log('Rangefinder Startup confirmed!');
                        //}
                        cb(null);
                    });
                },

                function (cb) {
                    i2c.transfer(whoAmIBuffer, 1, function (error, dataReceived) {
                        // Print data received (buffer of hex values)
                        if (error) {
                            console.log("Error in Rangefinder whoamI read", error);
                            return cb(error, barrel);
                        }
                        if (dataReceived[0] == 0xB4) {
                            console.log('Rangefinder WHO AM I CONFIRMED!');
                        }
                        cb(null);
                    });
                },

                // write a bunch of configuration data to the device.
                function (cb) {
                    i2c.send(new Buffer([0x02, 0x07, 0x01]), function (err) {
                        cb(err);
                    });
                },
                function(cb) {
                    i2c.send(new Buffer([0x02, 0x08, 0x01]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0x96, 0x00]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0x97, 0xFD]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xE3, 0x00]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xE4, 0x04]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xE5, 0x02]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xE6, 0x01]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xE7, 0x03]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xF5, 0x02]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xD9, 0x05]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xDB, 0xCE]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xDC, 0x03]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xDD, 0x0F8]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0x9F, 0x00]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xA3, 0x3C]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xB7, 0x00]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xBB, 0x3C]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xB2, 0x09]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xCA, 0x09]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x01, 0x98, 0x01]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x01,0xB0, 0x17]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x01, 0xAD, 0x00]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0xFF, 0x05]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x01, 0x00, 0x05]), function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x01, 0x99, 0x05]), function (err) {
                      cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x01, 0xA6, 0x1B]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x01, 0xAC, 0x3E]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x01, 0xA7, 0x1F]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    i2c.send(new Buffer([ 0x00, 0x30, 0x00]), function (err) {
                       cb(err);
                    });
                },

                // Public register settings
                function (cb) {
                    // VL6180X_SYSTEM_MODE_GPIO1
                    i2c.send(new Buffer([ 0x00, 0x11, 0x10]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    // VL6180X_READOUT_AVERAGING_SAMPLE_PERIOD
                    i2c.send(new Buffer([ 0x01, 0x0a, 0x30]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    // VL6180X_SYSALS_ANALOGUE_GAIN
                    i2c.send(new Buffer([ 0x00, 0x3F, 0x46]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    // VL6180X_SYSRANGE_VHV_REPEAT_RATE
                    i2c.send(new Buffer([ 0x00, 0x31, 0xFF]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    // VL6180X_SYSALS_INTEGRATION_PERIOD
                    i2c.send(new Buffer([ 0x00, 0x40, 0x63]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    //
                    i2c.send(new Buffer([ 0x00, 0x2E, 0x01]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    //
                    i2c.send(new Buffer([ 0x00, 0x1B, 0x09]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    //
                    i2c.send(new Buffer([ 0x00, 0x3E, 0x31]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    //
                    i2c.send(new Buffer([ 0x00, 0x14, 0x24]), function (err) {
                       cb(err);
                    });
                },
                function (cb) {
                    // Reset Fresh out of startup buffer
                    i2c.send(resetFreshBuffer, function (err) {
                       cb(err);
                    });
                }
            ],
            function (err) {
                console.log('Rangefinder initialization complete!');
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
    var pollData = function(bl, callback) {

            var barrel = {};
        async.waterfall(
        [
            function (cb) {
                // start the measurement
                i2c.send(new Buffer([0x00, 0x18, 0x01]), function (err) {
                    // Wait for 200 ms to allow the device to get a reading
                    setTimeout(function () {
                        return cb(err);
                    }, 200 );
                });
            },
            function (cb) {
                // read the error status to check for errors
                i2c.transfer(new Buffer([0x00, 0x4d]), 1,  function (err, value) {
                    if (err) {
                        console.log('Error reading rangefinder error status');
                    }
                    var error_status = value[0];

                    // It

                    //if(error_status & 0x00) console.log("No errors...");
                    //if(error_status & 0x10) console.log("VCSEL Continuity Test error!");
                    //if(error_status & 0x20) console.log("VCSEL Watchdog Test error!");
                    //if(error_status & 0x30) console.log("VCSEL Watchdog error!");
                    //if(error_status & 0x40) console.log("PLL1 Lock error!");
                    //if(error_status & 0x50) console.log("PLL2 Lock error!");
                    //if(error_status & 0x60) console.log("Early Convergence Estimate error!");
                    //if(error_status & 0x70) console.log("Max Convergence error!");
                    //if(error_status & 0x80) console.log("No Target Ignore error!");
                    //if(error_status & 0xB0) console.log("Max Signal to Noise Ratio error!");
                    //if(error_status & 0xC0) console.log("Raw Ranging Algo Underflow error!");
                    //if(error_status & 0xD0) console.log("Raw Ranging Algo Overflow error!");
                    //if(error_status & 0xE0) console.log("Ranging Algo Underflow error!");
                    if(error_status & 0xF0) {
                        //console.log('Range OOB, skipping');
                        barrel.reading = false;
                    } else {
                        barrel.reading = true;
                    }
                    cb(err);
                });
            },
            function (cb) {

                if (barrel.reading) {
                    pollStatus(barrel, function (err) {
                        cb(err);
                    });
                } else {
                    cb(null);
                }
            },
            function (cb) {
                // read the measurement
                if (barrel.ready && barrel.reading) {
                    i2c.transfer(new Buffer([0x00, 0x62]), 1,  function (err, value) {
                        if (err) {
                            console.log('Error reading rangefinder value proper');
                            return cb(err);
                        }
                        console.log('Range reading: ' + value[0] + ' mm');
                    });
                } else {
                    cb(null);
                }
            },

            function (cb) {
                // clear the interrupt flag and any error bits
                i2c.send(new Buffer([0x00, 0x15, 0x07]), function (err) {
                    if (err) {
                        console.log('Error resetting interrupt byte Rangefinder status byte');
                    }
                    cb(err);
                });
            }
        ],
            function(err) {
                if (err) {
                    console.log('Error reading rangefinder results');
                }
                callback(err, bl);
            }
        );
    };

    module.exports.pollData = pollData;

    var pollStatus = function(barrel, callback) {
        i2c.transfer(new Buffer([0x00, 0x4F]), 1, function (err, readResult) {
            if (err) {
                console.log('Error reading Rangefinder status byte');
                return callback(err);
            }
            //console.log("Read_status: 0x" + readResult[0].toString(16))
            if ((readResult[0] & 0x40) > 0) {
                console.log('Laser safety error!');
            }
            if ((readResult[0] & 0x80) > 0) {
                console.log('PLL Error! ?');
            }
            if (readResult[0] & 0x04) {
                barrel.ready = true;
            }
            callback(null);
        });
    };
}();

