isihlonono
==========

Making noise one grain at a time.

## Asthetics

* The control of the performance is managed by the performers. They are like conductors.
* Conductors can open up sesions (humans with devices) for controlling specific things such as a sample grain, etc.
* Conductors can treat the audience like a patch panel, and choose to engage specific humans for specific noises

## Todo

### Web hackery

* Have a web app that allows multiple phones/laptops/etc to connect
  * Accepts OSC traffic ex: /normalize 0.5
  * Have global properties that are tunable using OSC. Ex: have a normalization, etc. value.
  * Accepts websocket clients
  * Track each unique web socket connection (sticky)
  * Returns random hue/color data to identify each session (in the web UI)
* Have a web page that
  * emits accelerometer data as XYZ -> 0-127
  * tracks acceleration (G's) -> 0-127
  * displays state/info based on what the server tells it to
* Wild speculation thats probably hard
  * Capture audio from web page and send it to server (samples)
  
### Patch and Audio Wizardry

* Patch that accepts OSC data and routes it intelligently
  * Expected input: Acceleration (G force) as 0-127
  * Handle 2 input channels (two humans)

## Reading

* [HighC](http://highc.org/)
