'use strict';

angular.module('isihlononoApp')

.factory('Touch', [function () {

  // We return this object to anything injecting our service
  var Service = function() {
    var self = this;

    // internal touch data state
    this.data.x = 0.0;
    this.data.y = 0.0;

    // what to do when touch acitivty occurs
    this.setTouchCallback = function(callback) {
      this.callback = callback;
    };


    // TODO - implement touch movement here

  };

  return new Service;

}])

;
