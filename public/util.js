/**
 * Module contains some library functions
 */

"use strict";

/**
 * Write a JSON payload to the application endpoint. Any filtering or throttling should
 * be done at the client end
 * @param url the REST endpoint to hit
 * @param payload the object to send, could
 */
function libNotifyDevice(url, payload) {

    var xmlHttp = new XMLHttpRequest();
    console.log('Sending Payload - url: ' + url + ', payload: ', payload);

    // I could call a callback from here if I were interested in the status.
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status != 200) {
            console.log('Error notifying device: ', xmlHttp.status);
        } else if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            //console.log('SUCCESS!'); // Don't care!
        } else {
            //console.log('Unexpected httpRequest state: ' + xmlHttp.readyState + ', status: ' + xmlHttp.status);
        }
    };
    xmlHttp.open("POST", url, true); // 'true' for asynchronous behaviour
    xmlHttp.setRequestHeader("Content-type", "application/json");
    var str = JSON.stringify(payload);
    xmlHttp.send(str);
}

/**
 * Write the controls to the application endpoint!!!!! Remote Control!!!
 * should probably filter this a little so as to not flood the connection.
 * What might be a better approach is to have a timer that runs every
 * 100ms that sends an update if the value has changed enough to warrant it.
 * That logic could be common to both servo and motor functions.
 * @param url the REST endpoint to hit
 * @param callback the callback to return to when the data is read
 */
function libReadDevice(url, callback) {

    var xmlHttp = new XMLHttpRequest();
    //console.log('Fetching Data from URL: ' + url);

    // I could call a callback from here if I were interested in the status.
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status != 200) {
            console.log('Error communicating to device, status: ', xmlHttp.status);
        } else if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            //console.log('SUCCESS!'); // Don't care!
            var array = xmlHttp.response.split(',').map(function(n) {
                return Number(n);
            });
            callback(null, array);

        } else {
            //console.log('Unexpected httpRequest state: ' + xmlHttp.readyState + ', status: ' + xmlHttp.status);
        }
    };
    xmlHttp.open("GET", url, true); // true for asynchronous
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send();
}
