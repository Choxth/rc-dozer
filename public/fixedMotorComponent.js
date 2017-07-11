/**
 * Created by gdick on 08/11/16.
 *
 * Assorted javascript functions that are loaded by the controlling browser
 * This functional component represents the speed of a motor as a slider which can be set to a fixed
 * value without reset. The panel can represent the state of up to four motors depending on a configuration setting.
 *
 * These modules both draw the graphical representation of themselves in a canvas, and interpret the mouse
 * interaction to generate the rest calls to the motor drivers running in node on the device.
 *
 * TODO: This component needs namespacing and converting to Class changes
 */
"use strict";

var com_allthings_motorFunctions = function() {

    var mc = document.getElementById("motorCanvas");
    var urlBox = document.getElementById("urlBox");
    var enabled = document.getElementById("enabled");
    var reversed = document.getElementById("reversed");

    var THRESH = 0.05;

    var motorCtx = mc.getContext("2d");
    var width = mc.width;
    var height = mc.height;

    var halfW = width / 2;
    var halfH = height / 2;

    // adjust (1 or 2) to change the number of panels to display inside the allotted space
    var control_count = 1;
    var center_divider_width = 5;

//    dont need return constants since this control doesn't return to center automatically.
    var dragInProgress = false;
//    var cursorReturning = false;  // true if the nav circle is cursorReturning to center.

    /**
     * The mouseMotorPos holds the mouse position during drag, but also the pretend mouse position
     * when the cursor is being returned to center. The motorValues represent the current motor values
     * after a mouseAdjustment, and the lastMotorvalues are the last values sent to the device
     */
    var mouseMotorPos = {y0: halfH, y1: halfH};
    var motorValues = {leftMotor: 0, rightMotor: 0}; // Object to send to device range -255 ... 255
    var lastMotorValues = {leftMotor: 0, rightMotor: 0}; // Object to send to device range -255 ... 255

    var resetTimer = false;

// Event listeners
// Update the mouse positionObject
    function getMotorMousePos(canvasDom, mouseEvent) {

        var rect = canvasDom.getBoundingClientRect();
        var cIdx = getColumnIdx(mouseEvent);

        // better, but still tedious
        var prop = 'y' + cIdx;
        mouseMotorPos[prop] = mouseEvent.clientY - rect.top;
        //console.log('MouseMotorPos: ' + mouseMotorPos.y0.toString());
    }

    mc.addEventListener("mousedown", function (e) {
        dragInProgress = true;
    }, false);


    mc.addEventListener("mouseup", function (e) {
        getMotorMousePos(mc, e);
        // be sure to clear existing timers or they will get orphaned
        //if (resetTimer) {
        //    console.log('-- Uptimer reset collision repaired!');
        //    clearInterval(resetTimer);
        //}
        dragInProgress = false;
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
        lastMotorValues.leftMotor = motorValues.leftMotor;
        lastMotorValues.rightMotor = motorValues.rightMotor;
    }

    /**
     * Calculate the motor vectors for up to 'count' panels.
     *
     * @param mp the mouseMotorPosition, not the mouse event
     * @returns {boolean}
     */
    function calculateMotorVectors(mp) {

        var columnIdx = getColumnIdx(mp);
        var prop = 'y' + columnIdx.toString();
        var dy = mp[prop] - halfH;  // Positive if below center
        var linearComp = dy / (halfH);       //
        var changed = false;
        if (columnIdx == 0) {
            //console.log("dy: " + dy + " Linear: " + linearComp);
            motorValues.leftMotor = linearComp * 100;
            changed = ((Math.abs(lastMotorValues.leftMotor - motorValues.leftMotor) > THRESH));
        }
        if (columnIdx == 1) {
            motorValues.rightMotor = linearComp * 100;
            changed = ((Math.abs(lastMotorValues.rightMotor - motorValues.rightMotor) > THRESH));
        }
        console.log('Changed? ' + changed);
        return changed;
    }


    /**
     * Get the columnIdx from the mouse position
     * @param mousePos
     * @returns {number}
     */
    function getColumnIdx(mousePos) {
        var columnId = 0;
        if (control_count==2 && mousePos.x > halfW) {
            columnId = 1;
        }
        return columnId;
    }

    /**
     * This function draws the controls without guide lines for freestyle operation
     * @param motorCtx
     * @param mp
     */
    function drawMotorControls(ctx, mp) {


        ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "rgba(0, 255, 255, 1.0)";

        // draw the slider centered on the current position
        ctx.fillStyle = "rgba(0, 0, 128, 1.0)";



        if (control_count == 1) {
            var botY = mp.y0 - 10;
            var topY = mp.y0 + 10;

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
            //console.log('leftMotor: ' +  motorValues.leftMotor);
            ctx.fillText ( motorValues.leftMotor.toString(), halfW - 10, 20);

        } else if (control_count == 2) {

            // Left slider control
            var botY = mp.y0 - 10;
            var topY = mp.y0 + 10;
            ctx.beginPath();
            ctx.moveTo(2, topY);
            ctx.lineTo(2, botY);
            ctx.lineTo(halfW - center_divider_width, botY);
            ctx.lineTo(halfW + center_divider_width, topY);
            ctx.lineTo(2, topY);
            ctx.stroke();

            // Center line right
            ctx.beginPath();
            ctx.moveTo(width-2, topY);
            ctx.lineTo(halfW + center_divider_width, topY);
            ctx.lineTo(halfW + center_divider_width, botY);
            ctx.lineTo(width-2, botY);
            ctx.lineTo(width-2, topY);
            ctx.stroke();


            // Right slider control
            botY = mp.y1 - 10;
            topY = mp.y1 + 10;
            ctx.moveTo(2, botY);
            ctx.lineTo(halfW - center_divider_width, botY);
            ctx.lineTo(halfW - center_divider_width, topY);
            ctx.lineTo(2, topY);
            ctx.lineTo(2, botY);
            ctx.fill();


            ctx.moveTo(halfW + center_divider_width, botY);
            ctx.lineTo(width-2, botY);
            ctx.lineTo(width-2, topY);
            ctx.lineTo(halfW + center_divider_width, topY);
            ctx.lineTo(halfW + center_divider_width, botY);
            ctx.fill();


            // Put in the current setting text
            ctx.fillText ( motorValues.leftMotor.toString(), 20, 20);
            ctx.fillText ( motorValues.rightMotor.toString(), halfW + 20, 20);
        }

        //if (dragInProgress) {
        //    motorCtx.fillStyle = "rgba(120, 12, 12, 0.5)";
        //    motorCtx.beginPath();
        //    motorCtx.arc(mp.x, mp.y, 10, 0, 2 * Math.PI, true);
        //    motorCtx.fill();
        //}
    }
    drawMotorControls(motorCtx, mouseMotorPos);
}();