'use strict';

angular.module('isihlononoApp')

.constant('GRAVITY', 9.80665)

.factory('Motion', [ 'GRAVITY', function (GRAVITY) {

  // We return this object to anything injecting our service
  var Service = function() {
    var self = this;
    this.doTare = true;
    this.tareValues = {x:0,y:0,z:0};
    this.online = false;
    this.callback = null;
    // internal motion data state
    this.data = {};
    this.data.lastDM = new Date().getTime();
    this.data.aX = 0.0;
    this.data.aY = 0.0;
    this.data.aZ = 0.0;
    this.data.alpha = null;
    this.data.beta = null;
    this.data.gamma = null;

    // allow external Tare on acceleration values
    this.tare = function() {
      this.doTare = true;
    };

    // if motion shoudl be captured
    this.setOnline = function(onlineState) {
      this.online = onlineState;
    };

    // what to do when motion acitivty occurs
    this.setMotionCallback = function(callback) {
      this.callback = callback;
    };

    this._tareVal = function(val, tare) {
      return val - tare;
    };

    this._dmHdlr = function(aX, aY, aZ, alpha, beta, gamma) {
      var currDM = new Date().getTime();

      // only send data every 100ms
      if (currDM < this.data.lastDM + 100) {return;}
      this.data.lastDM = currDM;

      // Tare Accel data
      aX = aX ? this._tareVal(aX, this.tareValues.x) : 0.0;
      aY = aY ? this._tareVal(aY, this.tareValues.y) : 0.0;
      aZ = aZ ? this._tareVal(aZ, this.tareValues.z) : 0.0;

      // Ensure all values are floats at fixed len
      this.data.aX = aX.toFixed(3) * 1.0;
      this.data.aY = aY.toFixed(3) * 1.0;
      this.data.aZ = aZ.toFixed(3) * 1.0;
      this.data.alpha = alpha ? alpha.toFixed(3) * 1.0 : 0.0;
      this.data.beta = beta ? beta.toFixed(3) * 1.0 : 0.0;
      this.data.gamma = gamma ? gamma.toFixed(3) * 1.0 : 0.0;

      // fire callback if online and callback exists
      if (this.callback !== null && this.online) {
        this.callback([this.data.aX, this.data.aY, this.data.aZ,
                       this.data.alpha, this.data.beta, this.data.gamma]);
      }
    };

    // if we support device motion capability
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', function(ev) {

        // get acceleration data
        var acc = ev.accelerationIncludingGravity;

        // use values to tare if a tare is requested
        if (self.doTare) {
          self.tareValues.x = acc.x;
          self.tareValues.y = acc.y;
          self.tareValues.z = acc.z;
          self.doTare = false;
        }

        if ( ev.rotationRate ) {
          // not all devices support rotation
          if (ev.rotationRate.alpha !== null) {
            self._dmHdlr(acc.x, acc.y, acc.z, ev.rotationRate.alpha, ev.rotationRate.beta, ev.rotationRate.gamma);
          } else {
            self._dmHdlr(acc.x, acc.y, acc.z, null, null, null);
          }
        }
      }, false);
    } else {
      console.error('devicemotion not supported on your device or browser.');
    }
  }

  return new Service;

}])

;
