/**
 * Created by gdick on 08/11/16.
 *
 * Assorted javascript functions that are loaded by the controlling browser
 * These motor functions draw a hexagonal grid with three speed ranges where the code
 * sets a motor control to a predetermined value depending on the 'sector' that the user
 * has the mouse in, rather than trying to calculate the exact speed based on position
 */
"use strict";

var com_allthings_motorFunctions = function() {

    var mc = document.getElementById("motorCanvas");
    var urlBox = document.getElementById("urlBox");
    var enabled = document.getElementById("enabled");
    var reversed = document.getElementById("reversed");

    var radius1 = 30;  // dead zone
    var radius2 = 100; // 20 - 100 lower ring
    var radius3 = 175; // 100 - 175  outer ring

    var eigthPi = Math.PI / 8;   // 0.3927
    var threeEigthPi = eigthPi * 3;  // 1.17
    var prevSector, prevZone;

    var motorCtx = mc.getContext("2d");
    var motorWidth = mc.width;
    var motorHeight = mc.height;

    var halfMotorW = motorWidth / 2;
    var halfMotorH = motorHeight / 2;

    var rx5 = halfMotorW / Math.cos (Math.PI/8);
    var delta = rx5 * Math.sin( Math.PI/8);

    console.log('-Constrained motor functions loaded...');

    // Motor constants are in %
    var motorConstants = [
        { 0 : { leftMotor: 20, rightMotor: -20},
            1 : { leftMotor: 45, rightMotor: -45},
            2 : { leftMotor: 55, rightMotor: -55},
            3 : { leftMotor: 75, rightMotor: -75}
        },
        // ahead , turning slightly to the right
        { 0 : { leftMotor: 20, rightMotor: 15 },
            1 : { leftMotor: 45, rightMotor: 25},
            2 : { leftMotor: 70, rightMotor: 50},
            3 : { leftMotor: 85, rightMotor: 65}
        },
        // straight ahead/back
        { 0 : { leftMotor: 35, rightMotor: 35},
          1 : { leftMotor: 45, rightMotor: 45},
          2 : { leftMotor: 55, rightMotor: 55},
          3 : { leftMotor: 75, rightMotor: 75}
        }
    ];

    var quadrantConsts = {
        0 : { x: motorWidth, y :  halfMotorH - delta },
        1 : { x : halfMotorW + delta, y: 0 },
        2 : { x : halfMotorW - delta, y: 0 },
        3 : { x : 0, y : halfMotorH - delta},

        4 : { x : 0 , y : halfMotorH + delta},
        5 : { x: halfMotorW - delta, y : motorHeight},
        6 : { x : halfMotorW + delta, y : motorHeight},
        7 : { x : motorWidth, y : halfMotorH + delta}
    };

// Set up mouse events for drawing
    var dragInProgress = false;
    var cursorReturning = false;  // true if the nav circle is cursorReturning to center.

    /**
     * Various mouse control objects
     */
    var mouseMotorPos = {x: 0, y: 0};
    var returnVec = {dx: 0, dy: 0};
    var motorValues = {leftMotor: 0, rightMotor: 0}; // Object to send to device range -255 ... 255
    var lastUpdatedPos = {leftMotor: 0, rightMotor: 0};  // The last value written to the device

    var resetTimer;

// Event listeners
// Update the mouse positionObject
    function getMotorMousePos(canvasDom, mouseEvent) {
        var rect = canvasDom.getBoundingClientRect();
        mouseMotorPos.x = mouseEvent.clientX - rect.left;
        mouseMotorPos.y = mouseEvent.clientY - rect.top;
    }


    // For this event, in this UI, we don't want to wait for a
    // mouse move event to run the motor, it's possible to run the
    // motors from a simple click
    mc.addEventListener("mousedown", function (e) {
        dragInProgress = true;
        getMotorMousePos(mc, e);
        if (calculateMotorVectors(mouseMotorPos)) {
            notifyMotorDevice();
        }
        drawMotorControls(motorCtx, mouseMotorPos);
    }, false);


    mc.addEventListener("mouseup", function (e) {
        getMotorMousePos(mc, e);
        // be sure to clear existing timers or they will get orphaned
        if (resetTimer) {
            console.log('-- Uptimer reset collision repaired!');
            clearInterval(resetTimer);
        }
        setupMotorReturn(mouseMotorPos);
        dragInProgress = false;
        cursorReturning = true;
        drawMotorControls(motorCtx, mouseMotorPos);

    }, false);

    mc.addEventListener("mousemove", function (e) {
        if (dragInProgress) {
            getMotorMousePos(mc, e);
            if (calculateMotorVectors(mouseMotorPos)) {
                notifyMotorDevice();
            }
            drawMotorControls(motorCtx, mouseMotorPos);
        }
    }, false);

    /**
     * Write the controls to the application endpoint!!!!! Remote Control!!!
     * should probably filter this a little so as to not flood the connection
     */
    function notifyMotorDevice() {

        var theURL = urlBox.value + '/motor';

        if (enabled.checked) {
            libNotifyDevice(theURL, motorValues);
        }
        lastUpdatedPos.leftMotor = motorValues.leftMotor;
        lastUpdatedPos.rightMotor = motorValues.rightMotor;
    }

    /**
     * Take the current position, and calculate the resultant motor power vectors from that.
     * Returns true if the motor position has changed enough to warrant an update
     */
    function calculateMotorVectors(mp) {
        return calculateHelperMotorVectors(mp);
    }

    /**
     * Calculate the motor vectors if the game is in helper mode.
     * @param mp
     * @returns {boolean}
     */
    function calculateHelperMotorVectors(mp) {


        var dx = mp.x - halfMotorW;  // Negative on left of center
        var dy = halfMotorH - mp.y;  // Negative if below center
        if (reversed.checked) {
            dy *= -1;
        }

        var r = Math.sqrt( (dx * dx) + (dy * dy) );

        // Zone is magnitude, sector is navigation quadrant
        var zone = 0;
        var sector = 0;
        if (r < radius1) {
            // deadzone
        } else if (r >= radius1 && r < radius2) {
            zone = 1;
        } else if (r >= radius2 && r < radius3) {
            zone = 2;
        } else if (r >= radius3) {
            zone = 3;
        }

        if (zone != 0) {
            var rads = Math.PI/2;
            if (dx != 0) {
                rads = Math.abs ( Math.atan( dy / dx ));
            }
            if (rads >=  eigthPi && rads < threeEigthPi) {
                sector = 1;
            } else if (rads >= threeEigthPi) {
                sector = 2;
            } else {
                //console.log('Default sector ' + rads);
            }

            // if x < 0 and zone != 2, then swap left <-> right wheel settings.
            // if y > halfH and zone != 0, then change sign of all settings
            var mVals = JSON.parse ( JSON.stringify(motorConstants[sector]));

            mVals = mVals[zone];
            //console.log('zone: ' + zone + ', sector: ' + sector + ' [dx, dy] + [' + dx + ',' + dy + ']');
            var temp;
            if (dx < 0 && sector != 2) {
                temp = mVals.leftMotor;
                mVals.leftMotor = mVals.rightMotor;
                mVals.rightMotor = temp;
                //console.log('-----> LEFT/RIGHT FLIP now: ' + JSON.stringify(mVals));
            }
            if ( (dy < 0 && sector != 0) || (sector == 0 && reversed.checked) ) {
                mVals.leftMotor *= -1;
                mVals.rightMotor *= -1;
                console.log('------------- FOR/AFT FLIP now: ' + JSON.stringify(mVals));
            }
            // Don't need to remember the exact values or do threshold tests, only send the motor setting once if the
            // zone/sector have changed. That's an improvement. I should do the same with the servo. Down/up.
        }
        var changed = zone != prevZone || sector != prevSector;
        motorValues.leftMotor = mVals.leftMotor;
        motorValues.rightMotor = mVals.rightMotor;

        if (changed) {
            console.log('--> Would send: ' + JSON.stringify(motorValues) );
            prevZone = zone;
            prevSector = sector;
        }
        return changed;

    }


    /**
     * Draw the controls on the page
     * @param motorCtx The canvas context
     * @param mp A position object defining the location of the current cursor
     */
    function drawMotorControls(motorCtx, mp) {
        drawHelperControls(motorCtx, mp);
    }

    /**
     * Function to start a timer based function to snap the cursor back to center
     * @param mouseMotorPos
     */
    function setupMotorReturn(mouseMotorPos) {
        returnVec.dx = (halfMotorW - mouseMotorPos.x) / 10;
        returnVec.dy = (halfMotorH - mouseMotorPos.y) / 10;
        resetTimer = setInterval(returnToCentre, 60);
    }

    /**
     * Function to move the cursor one step back to the middle. If it reaches the middle,
     * turn off the timer, and notify the device of the last middle motor setting, or it wont stop.
     */
    function returnToCentre() {

        mouseMotorPos.x += returnVec.dx;
        mouseMotorPos.y += returnVec.dy;

        if (Math.abs(mouseMotorPos.x - (halfMotorW)) < 20 && Math.abs(mouseMotorPos.y - halfMotorH) < 20) {
            mouseMotorPos.x = halfMotorW;
            mouseMotorPos.y = halfMotorH;
            cursorReturning = false;
            clearInterval(resetTimer);
            resetTimer = undefined;

            motorValues.leftMotor = 0;
            motorValues.rightMotor = 0;
            notifyMotorDevice();

        } else if (calculateMotorVectors(mouseMotorPos)) {
            notifyMotorDevice();
        }

        drawMotorControls(motorCtx, mouseMotorPos);
    }

    function drawHelperControls( motorCtx, mp) {


        motorCtx.fillStyle = "rgba(100, 255, 255, 1.0)";
        motorCtx.fillRect(0, 0, motorWidth, motorHeight);

        //motorCtx.fillStyle = "rgba(0, 255, 255, 1.0)";
        //motorCtx.fillText("Mouse: " + mouseMotorPos.x + ',' + mouseMotorPos.y, 5, 20);

        motorCtx.strokeStyle = "rgba(0, 0, 0, 1.0)";
        motorCtx.beginPath();
        motorCtx.arc(halfMotorW, halfMotorH, 25, 0, 2 * Math.PI, true);
        motorCtx.fill();

        motorCtx.beginPath();
        motorCtx.arc( halfMotorW, halfMotorH, radius1, 0, 2 * Math.PI, true);
        motorCtx.stroke();

        motorCtx.beginPath();
        motorCtx.arc( halfMotorW, halfMotorH, radius2, 0, 2 * Math.PI, true);
        motorCtx.stroke();

        motorCtx.beginPath();
        motorCtx.arc( halfMotorW, halfMotorH, radius3, 0, 2 * Math.PI, true);
        motorCtx.stroke();

        motorCtx.strokeStyle = "rgba(0, 0, 0, 1.0)";

        motorCtx.beginPath();
        motorCtx.moveTo( quadrantConsts[0].x, quadrantConsts[0].y);
        motorCtx.lineTo( quadrantConsts[4].x, quadrantConsts[4].y);
        motorCtx.stroke();

        motorCtx.beginPath();
        motorCtx.moveTo( quadrantConsts[1].x, quadrantConsts[1].y);
        motorCtx.lineTo( quadrantConsts[5].x, quadrantConsts[5].y);
        motorCtx.stroke();

        motorCtx.beginPath();
        motorCtx.moveTo( quadrantConsts[2].x, quadrantConsts[2].y);
        motorCtx.lineTo( quadrantConsts[6].x, quadrantConsts[6].y);
        motorCtx.stroke();

        motorCtx.beginPath();
        motorCtx.moveTo( quadrantConsts[3].x, quadrantConsts[3].y);
        motorCtx.lineTo( quadrantConsts[7].x, quadrantConsts[7].y);
        motorCtx.stroke();

        if (dragInProgress || cursorReturning) {
            motorCtx.fillStyle = "rgba(3, 120, 140, 0.5)";
            motorCtx.beginPath();
            motorCtx.arc(mp.x, mp.y, 30, 0, 2 * Math.PI, true);
            motorCtx.fill();
        }
    }
    drawMotorControls(motorCtx, mouseMotorPos);
}();