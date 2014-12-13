'use strict';

angular.module('isihlononoApp')

.controller('HomeCtrl', ['$scope','$rootScope', 'ConductorService', 'Motion', 'UA',
function ($scope, $rootScope, ConductorService, Motion, UA) {

  // set the conductor online callback on the root scope
  ConductorService.setOnlineCallback(function(online) {
    $scope.$apply(function () {
      $rootScope.online = online;

      // tell conductor we are a performer
      ConductorService.sendNow({
        event: 'performerOnline',
        data: {
          ua: UA.toString()
        }
      });

    });
  });


}])


.controller('ClientCtrl', ['$scope', 'ConductorService', 'Motion',
function ($scope, ConductorService, Motion) {
  $scope.performer = null;
  $scope.motionData = null;
  var strokeStyle = 'hsla(360, 100%, 100%, 1)'; // black

  // circle object
  var Circle = function(canvasId) {
    this.c = document.getElementById(canvasId);
    this.ctx = this.c.getContext('2d');
    this.centerX = this.c.width / 2;
    this.centerY = this.c.height / 2;
    this.radius = 30;
    this.startAngle = 0;
    this.endAngle = 2*Math.PI;

    this.draw = function(xDelta, yDelta, radiusDelta) {

      // clear canvas
      this.ctx.clearRect(0, 0, this.c.width, this.c.height);

      this.centerX = this.c.width / 2;
      this.centerY = this.c.height / 2;
      this.ctx.beginPath();

      var centerX = this.centerX + xDelta;
      var centerY = this.centerY + yDelta;
      var radius = Math.abs(this.radius + radiusDelta);

      this.ctx.arc(centerX, centerY, radius, this.startAngle, this.endAngle);
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.stroke();
    };
  };

  // websocket callback for all messages
  ConductorService.setCallback(function(data) {
    console.log('received data',data);

    // update performer information
    if (data.performer !== undefined) {
      $scope.$apply(function () {
        $scope.performer = data.performer;
        strokeStyle = 'hsla('+data.performer.altColor+', 100%, 50%, 1)';
      });
    }

    // conductor is ready to accept motion data
    if (data.acceptInput !== undefined) {
      console.log('Conductor is ready to accept input');
      Motion.setOnline(true);
    };
  });

  // connect to the conductor
  ConductorService.connect();

  // draw initial circle
  var accelCircle = new Circle('gameCanvas');
  accelCircle.draw(0, 0);

  // allow taring of values
  $scope.tare = function() {
    Motion.tare();
  }

  // subscribe to motion events
  Motion.setMotionCallback(function(motionData) {
    var tweakFactor = 10;
    $scope.$apply(function () {
      // update local scope with motion data
      $scope.motionData = motionData;
      accelCircle.draw(motionData[0] * tweakFactor,
                       motionData[1] * tweakFactor,
                       motionData[2] * tweakFactor);

      // send motion data to conductor
      ConductorService.send({
        event: 'motion',
        data: [motionData[0],motionData[1],motionData[2],motionData[3],motionData[4],motionData[5]]
      });
    });
  });

}])

;
