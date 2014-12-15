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
      velocity: 0.0,
      direction: 0.0,
      offsetDirection: 0.0,
      angle: 0.0
    };

    // internal mouse coordinate data state
    this.mousePosition = {
      x: 0.0,
      y: 0.0
    };

    // from http://www.webreference.com/programming/javascript/mk/column2/
    this.getMouseXY = function(ev){
      var x = ev.pageX;
      var y = ev.pageY;

      // limit mouse coordiantes to window size
      if (x < 0 ) { x = 0; }
      if (y < 0 ) { y = 0; }
      if (x > window.innerWidth) { x = window.innerWidth };
      if (y > window.innerHeight) { y = window.innerHeight };

      self.mousePosition = {
        x: x,
        y: y
      };
    }

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

        self.data = {
          x: self.mousePosition.x,
          y: self.mousePosition.y,
          deltaX: ev.deltaX,
          deltaY: ev.deltaY,
          velocity: ev.velocity,
          direction: ev.direction,
          offsetDirection: ev.offsetDirection,
          angle: ev.angle
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
