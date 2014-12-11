'use strict';

angular.module('isihlononoApp')

.factory('Motion', ['$rootScope',
function ($rootScope) {

  // We return this object to anything injecting our service
  var Service = {};
  var motionCallback = null;

  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', function(ev) {

      // get acceleration data
      var acc = ev.accelerationIncludingGravity;
      if ( ev.rotationRate ) {
        // not all devices support rotation
        if (ev.rotationRate.alpha != null) {
          dmHdlr(acc.x, acc.y, acc.z, ev.rotationRate.alpha, ev.rotationRate.beta, ev.rotationRate.gamma);
        } else {
          dmHdlr(acc.x, acc.y, acc.z, null, null, null);
        }
      }
    }, false);
  } else {
    console.error("devicemotion not supported on your device or browser.");
  }

  // internal motion data state
  var motionData = {};
  var motionDataArray = new Float32Array(6);
  motionData.lastDM = new Date().getTime();
  motionData.aX = 0.0;
  motionData.aY = 0.0;
  motionData.aZ = 0.0;
  motionData.alpha = null;
  motionData.beta = null;
  motionData.gamma = null;

  function dmHdlr(aX, aY, aZ, alpha, beta, gamma) {
    var currDM = new Date().getTime();

    // only send data every 100ms
    if (currDM < motionData.lastDM + 100) {return;}

    motionData.lastDM = currDM;

    motionData.aX = aX ? aX.toFixed(3) : '?';
    motionData.aY = aY ? aY.toFixed(3) : '?';
    motionData.aZ = aZ ? aZ.toFixed(3) : '?';
    motionData.alpha = alpha;
    motionData.beta = beta;
    motionData.gamma = gamma;

    // fire callback
    if (motionCallback !== null) {
      motionCallback(JSON.stringify({
        event: 'motion',
        data: [motionData.aX, motionData.aY, motionData.aZ,
              motionData.alpha, motionData.beta, motionData.gamme]
      }));
    }
  }

  Service.setMotionCallback = function(callback) {
    motionCallback = callback;
  };

  return Service;

}])

;
