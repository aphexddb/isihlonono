isihlonono
==========

Making noise one grain at a time.

## Asthetics

* The control of the performance is managed by the performers. They are like conductors.
* Conductors can open up sesions (humans with devices) for controlling specific things such as a sample grain, etc.
* Conductors can treat the audience like a patch panel, and choose to engage specific humans for specific noises

## Todo

### Web hackery

* Have a CONDUCTOR server
  * Allows multiple phones to connect to server via wifi/HTTP
  * Accepts Websocket clients (8081)
  * Accepts HTTP clients (80)
  * Accepts OSC traffic (3333) ex: /normalize 0.5
  * Sends OSC traffic (3334)
    * Input for each PERFORMER that is ACTIVE
    * ex: /performer1 10 20 30 40 50 60
  * Maintains a state of each PERFORMER
    * ACTIVE
    * MOOD
    * COLOR (hue/alpha/etc)
    * Input State (xyz axis, acceleration, mouse xy)
  * Conductor UI
    * See each PERFORMER thats online
      * See live input data for each PERFORMER
      * Toggle ACTIVE on/off
      * Select MOOD calm/indifferent/violent
    * Returns COLOR data to each PERFORMER
* Have a PERFORMER web app
  * Displays ONLINE or OFFLINE
  * displays MOOD that is set by CONDUCTOR
    * animated GIF
  * displays COLOR in the background
  * displays input data
    * Accelerometer
    * some sort of visual to indicate movement
  * streams data to the CONDUCTOR
    * emits accelerometer data as XYZ -> 0-1
    * tracks acceleration (G's) -> 0-1
* Wild speculation thats probably hard
  * Capture audio from web page and send it to server (samples)

### Patch and Audio Wizardry

* Patch that accepts OSC data and routes it intelligently
  * Expected input: Acceleration (G force) as 0-1
  * Handle 2 input channels (two humans)

## Reading

* [HighC](http://highc.org/)

## OSC Output

Isihlonono generates data from performers. Performer data exists in 10 channels starting from channel 0.

### OSC Data Format

The format for OSC data is `/channel0/motion`, `/channel0/touch`, etc. where each channel has multiple data messages.

### Motion Data

Motion data is captured by the device accelerometer. Not all devices support all this data. For example, a MacBook only has acceleration data while an iPhone has rotation. Example motion data:

    /channel0/motion 0.195 0.078 9.611 0 0 0

Motion data array format:

    motion[0] - acceleration X axis (aX)
    motion[1] - acceleration Y axis (aY)
    motion[2] - acceleration Z axis (aZ)
    motion[3] - rotation alpha
    motion[4] - rotation beta
    motion[5] - rotation gamma

A device lying flat on a horizontal surface with the top of the screen pointing West has the following orientation:

    alpha: 90
    beta: 0
    gamma: 0

A user is holding the device in their hand, with the screen in a vertical plane and the top of the screen pointing upwards. The value of beta is 90, irrespective of what alpha and gamma are.

    alpha: 0
    beta: 90
    gamma: 0

### Touch Data

Touch data is captured by the touch/mouse position. On a smartphone this is captured on touch. On a PC the data requires clicking. Example touch data:

    /channel0/touch 0.366466 0.811787 0.403614 -0.00760456 0.0810811

Touch data array format:

    touch[0] - position X coordinate (x)
    touch[1] - position Y coordinate (y)
    touch[2] - position delta X (deltaX)
    touch[3] - position delta Y (deltaY)
    touch[4] - velocity

* The X and Y coordinates are normalized to `0.0` to `1.0`, where 1 is the max edge of the window
* The X and Y delta values are normalized to `-1.0` to `1.0`  
* The velocity has no upper limit, however testing indicates that it's hard to get past `20` even on a computer

A "delta" value is the position from where a touch or click event first occured, and the movement away from that position. For example, if you touch the middle of the screen and move all the way left, you will end up at `-1.0`. If you touch the middle again and move right you will end up at `1.0`.
