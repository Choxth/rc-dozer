/**
 * Created by gdick on 27/03/17.
 */
"use strict";


// LSM6DS33 (gyro and accelerometer) 	1101011b 	110 1010b
// LIS3MDL (magnetometer) 	0011110b 	0011100b
// LPS25H (barometer) 	1011101b 	1011100b

// these are the base device addresses to be opened by the Tessel I2C package
// This is the XLerometer and gyro
module.exports.accelerometerAddress = 0x6B;
module.exports.alternateAccerometerAddress = 0x6A;
module.exports.rangeFinderAddress = 0x29;


// this is the Magnetometer device
module.exports.magnetometerAddress = 0x1E;
module.exports.alternateMagnetometerAddress = 0x1C;

// altimeter and temperature
module.exports.altimiterAddress = 0x5D;
module.exports.alternateAltimiterAddress = 0x5C;

// The following addresses represent the addresses of registers within the accelerometer package

module.exports.FUNC_CFG_ACCESS = 0x01;

// Location of a read only known variable. Result = 0x69;
module.exports.WHO_AM_I = 0x0F;

module.exports.FIFO_CTRL1 = 0x06;
module.exports.FIFO_CTRL2 = 0x07;
module.exports.FIFO_CTRL3 = 0x08;
module.exports.FIFO_CTRL4 = 0x09;
module.exports.FIFO_CTRL5 = 0x0A;


// This is the Accelerometer control register for power and Data Rate settings
module.exports.CTRL1_XL = 0x10;
module.exports.CTRL2_G  = 0x11;
module.exports.CTRL3_C  = 0x12;
module.exports.CTRL4_C  = 0x13;
module.exports.CTRL5_C  = 0x14;
module.exports.CTRL6_C  = 0x15;
module.exports.CTRL7_G  = 0x16;
module.exports.CTRL8_XL = 0x17;
module.exports.CTRL9_XL = 0x18;
module.exports.CTRL10_C = 0x19;

// Various data status bit if we should implement a polling approach
module.exports.STATUS_REG = 0x1E;

// Temperature output register
module.exports.OUT_TEMP_L = 0x20;
module.exports.OUT_TEMP_H = 0x21;

  // Gyroscope starting offset
module.exports.OUTX_L_G = 0x22;

// Accelerometer output offsets. Reads 6 bytes starting here
module.exports.OUTX_L_XL = 0x28;
// Gyro output low order X byte. Reads 6 bytes starting here
module.exports.OUTX_L_G  = 0x22;



// =====================  Range Finder constants here ==============


// VL6180X registers
module.exports.VL6180X_WHO_AM_I                            = 0x0000;   // should be== 0xB4
module.exports.VL6180X_IDENTIFICATION_MODEL_ID             = 0x0000;
module.exports.VL6180X_IDENTIFICATION_MODEL_REV_MAJOR      = 0x0001;
module.exports.VL6180X_IDENTIFICATION_MODEL_REV_MINOR      = 0x0002;
module.exports.VL6180X_IDENTIFICATION_MODULE_REV_MAJOR     = 0x0003;
module.exports.VL6180X_IDENTIFICATION_MODULE_REV_MINOR     = 0x0004;
module.exports.VL6180X_IDENTIFICATION_DATE_HI              = 0x0006;
module.exports.VL6180X_IDENTIFICATION_DATE_LO              = 0x0007;
module.exports.VL6180X_IDENTIFICATION_TIME_HI              = 0x0008;
module.exports.VL6180X_IDENTIFICATION_TIME_LO              = 0x0009;
module.exports.VL6180X_SYSTEM_MODE_GPIO0                   = 0x0010;
module.exports.VL6180X_SYSTEM_MODE_GPIO1                   = 0x0011;
module.exports.VL6180X_SYSTEM_HISTORY_CTRL                 = 0x0012;
module.exports.VL6180X_SYSTEM_INTERRUPT_CONFIG_GPIO        = 0x0014;
module.exports.VL6180X_SYSTEM_INTERRUPT_CLEAR              = 0x0015;
module.exports.VL6180X_SYSTEM_FRESH_OUT_OF_RESET           = 0x0016;
module.exports.VL6180X_SYSTEM_GROUPED_PARAMETER_HOLD       = 0x0017;
module.exports.VL6180X_SYSRANGE_START                      = 0x0018;
module.exports.VL6180X_SYSRANGE_THRESH_HIGH                = 0x0019;
module.exports.VL6180X_SYSRANGE_THRESH_LOW                 = 0x001A;
module.exports.VL6180X_SYSRANGE_INTERMEASUREMENT_PERIOD    = 0x001B;
module.exports.VL6180X_SYSRANGE_MAX_CONVERGENCE_TIME       = 0x001C;
module.exports.VL6180X_SYSRANGE_CROSSTALK_COMPENSATION_RATE= 0x001E;
module.exports.VL6180X_SYSRANGE_CROSSTALK_VALID_HEIGHT     = 0x0021;
module.exports.VL6180X_SYSRANGE_EARLY_CONVERGENCE_ESTIMATE = 0x0022;
module.exports.VL6180X_SYSRANGE_PART_TO_PART_RANGE_OFFSET  = 0x0024;
module.exports.VL6180X_SYSRANGE_RANGE_IGNORE_VALID_HEIGHT  = 0x0025;
module.exports.VL6180X_SYSRANGE_RANGE_IGNORE_THRESHOLD     = 0x0026;
module.exports.VL6180X_SYSRANGE_MAX_AMBIENT_LEVEL_MULT     = 0x002C;
module.exports.VL6180X_SYSRANGE_RANGE_CHECK_ENABLES        = 0x002D;
module.exports.VL6180X_SYSRANGE_VHV_RECALIBRATE            = 0x002E;
module.exports.VL6180X_SYSRANGE_VHV_REPEAT_RATE            = 0x0031;
module.exports.VL6180X_SYSALS_START                        = 0x0038;
module.exports.VL6180X_SYSALS_THRESH_HIGH                  = 0x003A;
module.exports.VL6180X_SYSALS_THRESH_LOW                   = 0x003C;
module.exports.VL6180X_SYSALS_INTERMEASUREMENT_PERIOD      = 0x003E;
module.exports.VL6180X_SYSALS_ANALOGUE_GAIN                = 0x003F;
module.exports.VL6180X_SYSALS_INTEGRATION_PERIOD           = 0x0040;
module.exports.VL6180X_RESULT_RANGE_STATUS                 = 0x004D;
module.exports.VL6180X_RESULT_ALS_STATUS                   = 0x004E;
module.exports.VL6180X_RESULT_INTERRUPT_STATUS_GPIO        = 0x004F;
module.exports.VL6180X_RESULT_ALS_VAL                      = 0x0050;
module.exports.VL6180X_RESULT_HISTORY_BUFFER0              = 0x0052;// This is a FIFO buffer that can store 8 range values or 16 ALS values
module.exports.VL6180X_RESULT_HISTORY_BUFFER1              = 0x0053; // It would be read in burst mode so all that is
module.exports.VL6180X_RESULT_HISTORY_BUFFER2              = 0x0054; // needed would be to reference the first address
module.exports.VL6180X_RESULT_HISTORY_BUFFER3              = 0x0055;
module.exports.VL6180X_RESULT_HISTORY_BUFFER4              = 0x0056;
module.exports.VL6180X_RESULT_HISTORY_BUFFER5              = 0x0057;
module.exports.VL6180X_RESULT_HISTORY_BUFFER6              = 0x0058;
module.exports.VL6180X_RESULT_HISTORY_BUFFER7              = 0x0059;
module.exports.VL6180X_RESULT_HISTORY_BUFFER8              = 0x0060;  // end of FIFO
module.exports.VL6180X_RESULT_RANGE_VAL                    = 0x0062;
module.exports.VL6180X_RESULT_RANGE_RAW                    = 0x0064;
module.exports.VL6180X_RESULT_RANGE_RETURN_RATE            = 0x0066;
module.exports.VL6180X_RESULT_RANGE_REFERENCE_RATE         = 0x0068;
module.exports.VL6180X_RESULT_RANGE_RETURN_SIGNAL_COUNT    = 0x006C;
module.exports.VL6180X_RESULT_RANGE_REFERENCE_SIGNAL_COUNT = 0x0070;
module.exports.VL6180X_RESULT_RANGE_RETURN_AMB_COUNT       = 0x0074;
module.exports.VL6180X_RESULT_RANGE_REFERENCE_AMB_COUNT    = 0x0078;
module.exports.VL6180X_RESULT_RANGE_RETURN_CONV_TIME       = 0x007C;
module.exports.VL6180X_RESULT_RANGE_REFERENCE_CONV_TIME    = 0x0080;
module.exports.VL6180X_READOUT_AVERAGING_SAMPLE_PERIOD     = 0x010A;
module.exports.VL6180X_FIRMWARE_BOOTUP                     = 0x0119;
module.exports.VL6180X_FIRMWARE_RESULT_SCALER              = 0x0120;
module.exports.VL6180X_I2C_SLAVE_DEVICE_ADDRESS            = 0x0212;
module.exports.VL6180X_INTERLEAVED_MODE_ENABLE             = 0x02A3;



