isihlonono
==========

Making noise one grain at a time.

## Asthetics

* The creators of noise are conductors. They control the performance.
* Members of the audience (humans with devices) are considered performers.
* Conductors make use of performers as input channels for controlling specific things such as a sample grain, etc.
* Conductors can choose to engage specific performers for specific noises, or request a change in mood.

## Todo

### Web and Server Hackery

* Some soft of wifi router setup that forwards all traffic to web app
    * wifi name "Make Music" or something fun
* Conductor UI
    * Set a message to display on performer UI
* Have a PERFORMER web app  
  * Display message from conductor  
  * Animated .GIF for mood maybe?
* Wild speculation thats probably hard
  * Capture audio from web page and send it to server (samples)

### Patch and Audio Wizardry

* Patch that accepts the below OSC data
  * Handle at least 2 input channels (two humans)
* See [audio_ideas.md](audio_ideas.md)

## Running

**isihlonono** requires [node.js](http://nodejs.org/). To run the server, run the following commands from this directory:

    npm install
    npm start

Navigate to [http://localhost:8080/#/noise](http://localhost:8080/#/noise) to see the conductor screen, otherwise [http://localhost:8080](http://localhost:8080) to join as a audience performer.

Note: the install step may take some time, especially on a slow connection.

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

## Additional Info & Related Reading

Music

* [HighC](http://highc.org/)
* [Audacity](http://audacity.sourceforge.net/)

Code

* [Jpg glitching](https://github.com/snorpey/jpg-glitch/blob/develop/scripts/lib/glitch-canvas.js)
* [Creating sound waves with JavaScript](http://js.do/blog/sound-waves-with-javascript/)
* [supercollider](http://supercollider.github.io/)
* [Lich.js](https://github.com/aphexddb/Lich.js)
* [Angular Performance Tuning](http://www.slideshare.net/dragosrusu/angularjs-overcoming-performance-issues-limits)
* [HSL Color Picker](http://hslpicker.com/)
