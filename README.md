This project contains some code and structure for a tessel-2 driven webcam enabled
remote control car with an extensible sensor package.

This project consists of a web page that loads some graphical components to 
control the car and to display some of the instrumented readings from a subset 
of the accelerometer and gyroscope sensors connected to the tessel. 


In the code in the /public directory I have adopted a simple naming convention:

 - File names ending in *Component are javascript files for use in the web interface
 - File names ending with Driver are node.js modules for controlling devices
   using the Tessel pin infrastructure. Motor/Servo drivers use PWM, while sensor drivers
   use the I2C bus. The only limitation is the number of pins available on the device
 - Files in the /routes folder ending in *Controller are RESTful endpoint handlers that accept
   requests from the client and route them to the related Driver. There are controllers for
   sending commands to the motors and servos, plus controllers for reading buffers of
   xlerometer and gyroscope data from those drivers. For simple commands there is no 
   reason the Controller couldn't do both, but I was also experimenting with controlling 
   the devices via a serial interface. 


The i2cInterface.js module uses the async package to serialize access to multiple 
devices on the i2c bus in a controlled manner.  I currently have a 2739-POLOLU AltIMU-10 
accelerometer and gyroscope, plus a SEN-12785 SparkFun ToF Range Finder mounted on 
my car. 

If you would like to replace these with similar h/w, you'll need to find out the base 
i2c device address from the device datasheet, plus determine the startup/configuration 
sequence required to communicate via i2c to the device. 



