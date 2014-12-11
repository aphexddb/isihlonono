'use strict';

angular.module('isihlononoApp')

.factory('UA', [ function () {

  // get user agent info
  var parser = new UAParser();
  var ua = parser.getResult();

  // user friendly device info
  ua.toString = function() {
    var device = '';
    if (ua.device.vendor !== null) {
      device = ua.device.vendor + ' ' + ua.device.model + ' ' + ua.device.type;
    }
    var str = device + ' ' + ua.browser.name + ' ' + ua.browser.major + ' on ' + ua.os.name;
    return str.trim();
  };

  return ua;

}])

;
