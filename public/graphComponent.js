/**
 * Created by gdick on 08/11/16.
 *
 * A class to graph various bits of data coming from the accelerometer and
 * whatever other sort of thing we can hook up to the device.
 *
 * To be useful, this should allow configuration with a component to get the proper
 * canvas from, and second, the URL from which to poll data for the graph, and third
 * might be the options argument.
 *
 * All those things are now possible. The component is namespaced in such a way that I can
 * use it from a web page with a couple steps and script sections in the html file,
 *
 */
"use strict";

var com_allthings = (function() {

    var GraphComponent = function() {
        this.insets = [10.0, 20.0, 10.0, 50.0];
        this.axisOptions = {
            labels : true,
            tickCount : 4,
            label : true
        }
    };


    /**
     * Initialize the graph component with runtime values. This should be called
     * when the DOM is established so that we can find the page items required
     *
     * @param canvasId
     * @param rootURLBoxId The id of the textbox containing the device root URL
     * @param dataExtension The resource part of the ultimate data retrieval URL eg. '/bodyMonitor/rotation'
     * @param options The options object
     */
    GraphComponent.prototype.init = function (canvasId, rootURLBoxId, dataExtension, options) {

        var mc;
        if (canvasId) {
            mc = document.getElementById(canvasId);
        }
        var urlBox;
        if (rootURLBoxId) {
            urlBox = document.getElementById(rootURLBoxId);
        }

        if (mc) {
            console.log('Got a graph Canvas!');
            this.width = mc.width;
            this.height = mc.height;

            this.halfW = this.width / 2;
            this.halfH = this.height / 2;
            this.ctx = mc.getContext('2d');

        } else {
            console.log('Couldnt load graphical canvas, drawing disabled...');
        }

        if (!dataExtension) {
            console.log('No data extension to read from, polling disabled...');
        } else {
            if (urlBox) {
                this.deviceURL = urlBox.value + dataExtension;
            } else {
                console.log('Couldnt load device URL textbox, refreshes disabled...');
            }
        }

        if (options) {
            this.graphOptions = options;
        } else {
            this.graphOptions = {
                plotFirst: 0,
                plotEvery: 3,
                min: -1,
                max: 1,
                pollEvery: 1000
            }
        }

    };

    /**
     * Graph some data. This will be called from a spot where the data is gathered from the device
     * @param buffer A buffer containing the data to graph
     */
    GraphComponent.prototype.graph = function(buffer) {
        //console.log('2) Graphing data');
        this.graphData(this.ctx, this.graphOptions, buffer);
    };

    /**
     * Pause the polling of the device for the data from this component
     */
    GraphComponent.prototype.pause = function() {
        clearInterval(this.timer);
        this.timer = undefined;
    };

    /**
     * StartTimer can be used to start the timer, or resume it if it is paused.
     * Not entirely sure the responsibility to poll the data lies with the graph component.
     * We should probably fetch a large block of data once, then graph various bits from that.
     */
    GraphComponent.prototype.startTimer = function() {
        var theThis = this;
        if (this.timer) {
            console.log('Timer seems to be running, not restarting');
            return;
        }

        if (this.deviceURL && this.graphOptions.pollEvery > 0) {
            this.timer = setInterval(function () {

                //console.log('Trying to reach: ' + theThis.deviceURL);
                libReadDevice(theThis.deviceURL, function (err, data) {
                    try {
                        theThis.graph(data);
                    } catch (e) {
                        console.log('Exception graphing! ', e);
                    }
                });

            }, this.graphOptions.pollEvery);
        } else {
            console.log('No URL to poll or no valid poll interval, polling disabled');
        }
    };

    /**
     * Graph the data. The options object supports the following properties:
     *  {
     *    plotFirst: N, start plotting at the N'th datum: default 0
     *    plotEvery: N,   use every Nth data in the buffer: default 1
     *    axisXLocation:  "top|bottom|middle configure the x-axis in one of several places
     *    axisLabels: true|false,
     *    tickCount: N  number of Y axis ticks above and below center line
     *  }
     *
     * @param ctx
     * @param options
     * @param buffer
     */
    GraphComponent.prototype.graphData = function (ctx, options, buffer) {

        if (!ctx) {
            return;
        }
        var graphMax = Math.max(Math.abs(options.min), Math.abs(options.max));

        // Scale is total value range / total graphical height
        // All this is the same no matter where the axis is.
        var graphYScale = (this.halfH - this.insets[0]) / graphMax;
        var graphXScale = (this.width - (this.insets[1] + this.insets[3])) / buffer.length;


        /**
         * Height = 200. - 20 for insets = 180. positive range = 90, negative range = 90.
         * Max = 2, so yscale should be 45.
         */

        console.log('GraphMax: ' + graphMax.toFixed(2) + ', yScale: ' + graphYScale.toFixed(2));

        ctx.fillStyle = "rgba(60, 220, 220, 1.0)";
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";

        // Should be able to have all sorts of graphs. This is just a simple +- center axis
        // model
        ctx.beginPath();
        ctx.moveTo(this.insets[3], this.insets[0]);
        ctx.lineTo(this.insets[3], this.height - this.insets[2]);
        ctx.stroke();

        // Center line
        ctx.beginPath();
        ctx.moveTo(this.insets[3], this.halfH);
        ctx.lineTo(this.width - this.insets[1], this.halfH);
        ctx.stroke();

        ctx.beginPath();
        var x, y;

        x = this.insets[3];
        y = this.halfH - (buffer[options.plotFirst] * graphYScale);

        ctx.moveTo(x, y);
        var dataDx = options.plotFirst + options.plotEvery;

        for (var idx = dataDx; idx < buffer.length; idx += options.plotEvery) {

            x = this.insets[3] + (idx * graphXScale);
            if (buffer[idx]) {
                y = this.halfH - (graphYScale * buffer[idx] );
            } else {
                y = this.halfH;
            }
            ctx.lineTo(x, y);
        }
        ctx.stroke();


        if (this.axisOptions.labels) {
            var dY = (this.halfH - this.insets[0])  / this.axisOptions.tickCount;

            // dY = 400/2 200 - 10 / 4 = 190/4 = 45
            var deltaVal = graphMax / this.axisOptions.tickCount;
            for (var i = 0; i < this.axisOptions.tickCount; i++) {
                x = this.insets[3] - 5;
                y = (this.halfH * 1.0) - ((i+1) * dY);
                var txt = ((i+1) * deltaVal ).toFixed(2);
                ctx.moveTo(x,y);
                ctx.lineTo(x+10, y);
                ctx.stroke();
                ctx.strokeText(txt, x - 40, y+2);
            }
            for (i = 0; i < this.axisOptions.tickCount; i++) {
                x = this.insets[3] - 5;
                y = this.halfH + ((i+1) * dY);
                txt = ((i+1) * -deltaVal ).toFixed(2);
                ctx.moveTo(x,y);
                ctx.lineTo(x+10, y);
                ctx.stroke();
                ctx.strokeText(txt, x - 40, y+2);
            }
        }
    };


return {
    GraphComponent: GraphComponent,
    init: GraphComponent.init,
    graphData: GraphComponent.graphData,
    pause: GraphComponent.pause,
    resume: GraphComponent.startTimer
}

})();