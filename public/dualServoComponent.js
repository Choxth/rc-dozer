/**
 * Created by gdick on 08/11/16.
 *
 * Assorted javascript functions that are loaded by the controlling browser
 * This file maintains the remote control servo canvas and interacts with the servoDriver module
 * to control the servo positions. This control looks for a canvas element with an id = "servoCanvas"
 * to draw in and receive events from. The servo control has a midline and only operates in one dimension
 * It does not naturally snap back to center like the motor control does, but remembers its position
 *
 * TODO: This component needs  namespacing and conversion to Class changes
 */
"use strict";

var com_allthings_servoFunctions = function() {

    var sc = document.getElementById("servoCanvas");
    var urlBox = document.getElementById("urlBox");
    var servoEnabled = document.getElementById("enabled");

    var THRESH = 0.02;
    var FREQ = 50; // 50 cycles/second = 20ms;
    var NEUTRAL_DUTY = 1500;

    var minDutyCycle = 1000;
    var maxDutyCycle = 2000;


    var ctx = sc.getContext("2d");
    var width = sc.width;
    var height = sc.height;

    height = height || 500;

    var halfW = width / 2;
    var halfH = height / 2;

    // DELTA_DUTY = The range applied to each half of the screen (doesn't appear to be linear sometimes)
    var DUTY_RANGE = (maxDutyCycle-minDutyCycle)/2;

// Set up mouse events for drawing
    var dragInProgress = false;
    var cursorReturning = false;  // true if the servo slider is returning to center

    /**
     * Various mouse control objects.
     */
    var mousePos = {x: 0, y: halfH};
    //var returnVec = {dx: 0, dy: 0};

    // THis servo code assumes two servos, one that operates clockwise, the other that operates counterclockwise
    // to manage a dozer lifter. Maybe I could export this to a module that handles this type of interaction
    // natively, or something.
    var servoSetting = {pwmPeriod: FREQ, cwCycle: 0.07, ccwCycle: 0.07 };
    var lastServoSetting = {pwmPeriod: FREQ, cwCycle: 0.07, ccwCycle: 0.07 };
    var resetTimer;

// Event listeners
    sc.addEventListener("mousedown", function (e) {
        dragInProgress = true;
    }, false);


    sc.addEventListener("mouseup", function (e) {
        getServoMousePos(sc, e);
        //setupReturn(mousePos);
        dragInProgress = false;
        //cursorReturning = true;
        drawServoControls(ctx, mousePos);

    }, false);

    sc.addEventListener("mousemove", function (e) {
        if (dragInProgress) {
            getServoMousePos(sc, e);
            if (calculateServoValues(mousePos)) {
                notifyDevice();
            }
            drawServoControls(ctx, mousePos);
        }
    }, false);

// Update the mouse positionObject
    function getServoMousePos(canvasDom, mouseEvent) {
        var rect = canvasDom.getBoundingClientRect();
        mousePos.x = mouseEvent.clientX - rect.left;
        mousePos.y = mouseEvent.clientY - rect.top;
    }

    /**
     * Write the controls to the application endpoint!!!!! Remote Control!!!
     */
    function notifyDevice() {

        var theURL = urlBox.value + '/servo';
        if (servoEnabled.checked) {
            libNotifyDevice(theURL, servoSetting);
        }
        lastServoSetting.pwmPeriod = servoSetting.pwmPeriod;
        lastServoSetting.cwCycle = servoSetting.cwCycle;
        lastServoSetting.ccwCycle = servoSetting.ccwCycle;
    }

    /**
     * Take the current position, and calculate the resultant motor power vectors from that.
     * Returns true if the servo position has changed enough to warrant an update
     */
    function calculateServoValues(mp) {

        // Yes, I think I had an extra weird crossing of the units there with the extra bit
        var cwSetting = NEUTRAL_DUTY + (( mp.y - halfH) / halfH) * DUTY_RANGE;
        var ccwSetting = NEUTRAL_DUTY - ((mp.y - halfH) / halfH) * DUTY_RANGE;

        cwSetting = (cwSetting/1000000) / (1 / FREQ);
        ccwSetting = (ccwSetting/1000000) / (1 / FREQ);

        servoSetting.pwmPeriod = FREQ;
        servoSetting.cwCycle = cwSetting;
        servoSetting.ccwCycle = ccwSetting;
        // only update on certain size change

        var cwDelta = Math.abs((servoSetting.cwCycle - lastServoSetting.cwCycle) / lastServoSetting.cwCycle);
        var ccwDelta = Math.abs((servoSetting.ccwCycle - lastServoSetting.ccwCycle) / lastServoSetting.ccwCycle);
        var sendIt = (cwDelta > THRESH || ccwDelta > THRESH);
        if (sendIt) {
            console.log('New duty cycle settings: [' + cwSetting + '][' + ccwSetting + ']');
        }
        return sendIt;
        // Return true too frequently, and the system gets bogged down making endless network requests of the
        // Tessel. Too infrequently, and the motion appears jerky.
    }

    /**
     * Draw the controls on the page
     * @param ctx The canvas context
     * @param mp A position object defining the location of the current cursor
     */
    function drawServoControls(ctx, mp) {

        ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "rgba(0, 255, 255, 1.0)";
        ctx.fillText("Hello!", 5, 20);

        // draw the slider centered on the current position
        ctx.fillStyle = "rgba(0, 0, 0, 1.0)";

        var botY = mp.y - 10;
        var topY = mp.y + 10;
        ctx.beginPath();
        ctx.moveTo(halfW, botY);
        ctx.lineTo(width - 2, botY);
        ctx.lineTo(width - 2, topY);
        ctx.lineTo(2, topY);
        ctx.lineTo(2, botY);
        ctx.lineTo(halfW, botY);
        ctx.fill();

        // Center line
        ctx.beginPath();
        ctx.moveTo(2, halfH);
        ctx.lineTo(width - 2, halfH);
        ctx.stroke();

    }

    /**
     * Function to start a timer based function to snap the cursor back to center.
     * @param mousePos
     */
//function setupReturn (mousePos) {
//    returnVec.dx = (halfW - mousePos.x) / 10;
//    returnVec.dy = (halfH - mousePos.y) / 10;
//    resetTimer = setInterval( returnToCentre, 60);
//}

    /**
     * Function to move the cursor one step back to the middle. If it reaches the middle,
     * turn off the timer, and notify the device of the last middle motor setting, or it wont stop.
     */
//function returnToCentre( ) {
//    mousePos.x += returnVec.dx;
//    mousePos.y += returnVec.dy;
//
//    if ( Math.abs(mousePos.x - (halfW)) < 20 && Math.abs(mousePos.y - halfH) < 20) {
//        mousePos.x = halfW;
//        mousePos.y = halfH;
//        cursorReturning = false;
//        clearInterval(resetTimer);
//        motorValues.leftMotor = 0;
//        motorValues.rightMotor = 0;
//        notifyDevice();
//    } else if (calculateServoValues( mousePos ) ) {
//        notifyDevice();
//    }
//
//    drawControls(ctx, mousePos);
//}

    drawServoControls(ctx, mousePos);

} ();

