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

    // convert mouse coords to 0-1 range
    this.convertRange = function(x, y) {
      var outputLow = 0.0;
      var outputHigh = 1.0;
      var inputLow = 0;
      return {
        x: ((x - inputLow) / (self.width - inputLow)) * (outputHigh - outputLow) + outputLow,
        y: ((y - inputLow) / (self.height - inputLow)) * (outputHigh - outputLow) + outputLow
      };
    };

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

    // start collecting mouse movement data
    document.onmousemove = this.getMouseXY;

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

      // event action
      this.hammertime.on('pan', function(ev) {

        // convert current mouse position to 0-1 range
        var rangedMouse = self.convertRange(self.mousePosition.x, self.mousePosition.y);
        console.log(rangedMouse);

        self.data = {
          x: rangedMouse.x,
          y: rangedMouse.y,
          deltaX: ev.deltaX,
          deltaY: ev.deltaY,
          velocity: ev.velocity
        };

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
