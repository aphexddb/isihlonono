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
