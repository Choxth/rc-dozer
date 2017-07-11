/**
 * Created by gdick on 21/03/17.
 */

function Body(x, y, z, mass) {

    this.x = x;
    this.y = y;
    this.z = z;

    this.vx = 0;
    this.vy = 0;
    this.vz = 0;

    // The readings at the start of time period dT
    this.lastAx = 0;
    this.lastAy = 0;
    this.lastAz = 0;

    // the acceleration history buffer
    this.accelerationBuffer = [];
    this.gyroBuffer = [];
    this.velocityBuffer = [];
    this.positionBuffer = [];

    this.mass = mass;
}
Body.prototype.constructor = Body;

module.exports.Body = Body;


/**
 * Apply an acceleration at time T
 */
Body.prototype.applyAcceleration = function(barrel, dT) {

    handleFIFOData(barrel.ax, barrel.ay, barrel.az, this.accelerationBuffer);

    this.vx += ((this.lastAx + barrel.ax)/2.0 ) * dT;
    this.vy += ((this.lastAy + barrel.ay)/2.0 ) * dT;
    this.vz += ((this.lastAz + barrel.az)/2.0 ) * dT;

    // Not  yet
    //handleFIFOData(this.vx, this.vy, this.vz, this.velocityBuffer);

    this.lastAx = barrel.ax;
    this.lastAy = barrel.ay;
    this.lastAz = barrel.az;

    this.x += this.vx * dT;
    this.y += this.vy * dT;
    this.z += this.vz * dT;

    //handleFIFOData(this.x, this.y, this.z, this.positionBuffer);

};

/**
 * Common function to handle inserting data into a FIFO buffer.
 *
 * @param value
 * @param buf
 * @param idx
 */
function handleFIFOData(v1, v2, v3, buf) {

    var count = 0;
    if (buf.length >= 200) {
        count = 3;
    }
    buf.splice(0, count);
    buf.push(v1);
    buf.push(v2);
    buf.push(v3);
}

/**
 * Apply rotational values to the body
 * @param barrel
 * @param dT
 */
Body.prototype.applyRotation = function (barrel, dT) {

    handleFIFOData(barrel.wx, barrel.wy, barrel.wz, this.gyroBuffer);

    this.vx += ((this.lastAx + barrel.ax)/2.0 ) * dT;
    this.vy += ((this.lastAy + barrel.ay)/2.0 ) * dT;
    this.vz += ((this.lastAz + barrel.az)/2.0 ) * dT;
};


/**
 * A function to get out the existing array of data. Since the buffer is FIFO,
 * We no longer have to keep track of the index, etc.
 */
Body.prototype.getXLBuffer = function()  {
    //console.log('Length of xl buffer: ' + this.accelerationBuffer.length);
    return this.accelerationBuffer;
};

Body.prototype.getGyroBuffer = function() {
    //console.log('Length of gyro buffer: ' + this.accelerationBuffer.length);
    return this.gyroBuffer;
};

/**
 * A function to get out the velocity buffer
 */
Body.prototype.getVelocityBuffer = function()  {
    console.log('Length of V buffer: ' + this.accelerationBuffer.length);
    return this.accelerationBuffer;
};

/**
 * A function to retrieve the position history
 */
Body.prototype.getPositionBuffer = function() {

};


