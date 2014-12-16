'use strict';

angular.module('isihlononoApp')

.factory('Touch', [function () {

  // We return this object to anything injecting our service
  var Service = function() {
    var self = this;
    this.online = false;
    this.hammertime = null;
    this.elementId = null;
    this.e = null;
    this.opts = {};
    this.callback = null;

    // internal touch data state
    this.data = {
      x: 0.0,
      y: 0.0,
      deltaX: 0.0,
      deltaY: 0.0,
      velocity: 0.0
    };

    // internal mouse coordinate data state
    this.mousePosition = {
      x: 0.0,
      y: 0.0
    };

    // set width and height
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // from http://www.webreference.com/programming/javascript/mk/column2/
    this.getMouseXY = function(ev){
      var x = ev.pageX;
      var y = ev.pageY;

      // limit mouse coordiantes to window size
      if (x < 0 ) { x = 0; }
      if (y < 0 ) { y = 0; }
      if (x > self.width) { x = self.width };
      if (y > self.height) { y = self.height };

      self.mousePosition = {
        x: x,
        y: y
      };
    };

    // convert a value to a 0-1 range
    this.convertRange0to1 = function(val, inputHigh) {
      var outputLow = 0.0;
      var outputHigh = 1.0;
      var inputLow = 0;
      return ((val - inputLow) / (inputHigh - inputLow)) * (outputHigh - outputLow) + outputLow;
    };

    // convert mouse coords
    this.rangeMouseCoords = function(x, y) {

      // limit coodiantes to window size
      if (x < 0 ) { x = 0; }
      if (x > self.width) { x = self.width };
      if (y < 0 ) { y = 0; }
      if (y > self.height) { y = self.height };

      return {
        x: self.convertRange0to1(x, self.width),
        y: self.convertRange0to1(y, self.height)
      };
    };

    // convert delta values
    this.rangeDeltaValues = function(dX, dY) {
      var maxDeltaX = self.width / 2;
      var maxDeltaY = self.height / 2;
      if (dX < 0 && Math.abs(dX) > maxDeltaX) { dX = -maxDeltaX; }
      if (dX > 0 && dX > maxDeltaX) { dX = maxDeltaX; }
      if (dY < 0 && Math.abs(dY) > maxDeltaY) { dY = -maxDeltaY; }
      if (dY > 0 && dY > maxDeltaY) { dY = maxDeltaY; }
      return {
        x: self.convertRange0to1(dX, maxDeltaX),
        y: self.convertRange0to1(dY, maxDeltaY)
      };
    };

    // start collecting mouse movement data
    //document.onmousemove = this.getMouseXY;

    // if touch should be captured
    this.setOnline = function(onlineState) {
      this.online = onlineState;
    };

    // start watching an element
    this.watchElement = function(elementId) {
      this.elementId = elementId;

      // Stop! Hammertime!
      this.e = document.getElementById(this.elementId);
      this.hammertime = new Hammer(this.e, this.opts);

      // touch event action
      this.hammertime.on('pan', function(ev) {

        // convert current mouse position to 0-1 range
        var rangedMouse = self.rangeMouseCoords(ev.center.x, ev.center.y);

        // convert deltas to 0-1 range
        var rangedDelta = self.rangeDeltaValues(ev.deltaX, ev.deltaY);

        self.data = {
          x: rangedMouse.x,
          y: rangedMouse.y,
          deltaX: rangedDelta.x,
          deltaY: rangedDelta.y * -1, // invert our Y-axis to be more intiitive
          velocity: Math.abs(ev.velocity)
        };

        //console.log(self.data);

        // fire callback
        if (self.online && self.callback != null) {
          self.callback(self.data);
        }

      });
    };

    // trigger on touch events
    this.setCallback = function(callback) {
      self.callback = callback;
    };

  };

  return new Service;

}])

;
