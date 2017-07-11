/**
 * Created by gdick on 03/04/17.
 */

/**
 * This module coordinates the use of the i2c bus to poll various interfaces.
 * This could have a configuration interface, but that seems a bit overkill. Simply (un)comment
 * modules as pertaining to each project.
 *
 */
"use strict";

var xlDrv = require('./accelerometerDriver');
//var magDrv = require('./magnometerDriver');
var rgeDrv = require('./rangeDriver');

var async = require('async');

var pollTimer;
var BASE_POLL_INTERVAL = 40;
var car;
var errCounter = 0;

/**
 * Configure the
 * @param body
 */
module.exports.configure = function(body) {


    car = body;

    var barrel = {};
    async.waterfall(
        [
            function(cb) {
                return cb(null, barrel);
            },

            xlDrv.init,
            //magDrv.init
            rgeDrv.init,

            // Afer all the init functions have returned, setup the timer
            setupTimer
        ],
        function (err, barrel) {
            console.log('Init functions complete');
        }
    );

};

/**
 * Function to establish the local timer to
 * @param barrel
 * @param callback
 */
var setupTimer = function(barrel, callback) {

    var start = Date.now();
    var dT = 0;

    //console.log('Setting up timer');

    pollTimer = setInterval(function () {

        var barrel = {};
        barrel.pollInterval = BASE_POLL_INTERVAL;
        async.waterfall(
            [
                function(cb) {
                    return cb(null, barrel);
                },
                xlDrv.pollData,
                //magDrv.pollData
                rgeDrv.pollData
            ],
            function (err, barrel) {

                if (err) {
                    console.log('error in one of the polling attempts: ', err);
                    if (++ errCounter >= 3) {
                        // Stop the madness/sadness/badness
                        clearInterval(pollTimer);
                    }
                }
                // Apply any changes to the car model.

                if (barrel.xlReading) {
                    var now = Date.now();
                    dT = (now - start) / 1000.0;
                    car.applyAcceleration(barrel, dT);
                }
                if (barrel.gyroReading) {
                    var now = Date.now();
                    dT = (now - start) / 1000.0;
                    car.applyRotation(barrel, dT);
                }
            });
    }, BASE_POLL_INTERVAL);

    callback(null, barrel);

};