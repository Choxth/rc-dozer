"use strict";


var xlPath = '/bodyMonitor/acceleration';
var gyroPath = '/bodyMonitor/rotation';
var velocityPath = '/bodyMonitor/velocity';
var positionPath = '/bodyMonitor/position';

var workingBody;

module.exports.configure = function (app, body) {
    app.get(xlPath, getBodyAcceleration);
    app.get(gyroPath, getBodyRotation);
    app.get(velocityPath, getBodyVelocity);
    app.get(positionPath, getBodyPosition);

    workingBody = body;
    console.log('AccelerationMonitor at: /bodyMonitor/acceleration');
    console.log('RotationMonitor at: /bodyMonitor/rotation');
};

function getBodyAcceleration(req, res, next) {
    res.status(200).send( workingBody.getXLBuffer() );
}

function getBodyRotation(req, res, next) {
    res.status(200).send( workingBody.getGyroBuffer() );
}

function getBodyVelocity(req, res, next) {
    res.status(200).send( workingBody.getVelocityBuffer() );
}

function getBodyPosition(req, res, next) {
    res.status(200).send( workingBody.getPositionBuffer() );
}