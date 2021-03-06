'use strict';

angular.module('isihlononoApp')

.controller('HomeCtrl', ['$scope','$rootScope', 'GrandCentralService', 'Motion', 'UA', 'Touch',
function ($scope, $rootScope, GrandCentralService, Motion, UA, Touch) {

  // set the conductor online callback on the root scope
  GrandCentralService.setOnlineStateChangeCallback(function(onlineState) {
    $scope.$apply(function () {
      $rootScope.online = onlineState;

      // tell conductor we are a performer
      GrandCentralService.send({
        event: 'arrival',
        data: {
          type: 'performer',
          ua: UA.toString()
        }
      });

    });
  });

  // set online state for motion and touch events
  Touch.setOnline(false);
  Motion.setOnline(false);

}])

.controller('ClientCtrl', ['$scope', 'GrandCentralService', 'Motion', 'Touch', 'Glitch',
function ($scope, GrandCentralService, Motion, Touch, Glitch) {
  $scope.performer = null;
  $scope.motionData = null;
  /*
  var strokeStyle = 'hsla(360, 100%, 100%, 1)'; // black

  // circle object
  var Circle = function(canvasId) {
    this.c = document.getElementById(canvasId);
    this.ctx = this.c.getContext('2d');
    this.centerX = Math.floor(this.c.width / 2);
    this.centerY = Math.floor(this.c.height / 2);
    this.radius = 30;
    this.startAngle = 0;
    this.endAngle = 2*Math.PI;

    this.draw = function(xDelta, yDelta, radiusDelta) {

      // clear canvas
      this.ctx.clearRect(0, 0, this.c.width, this.c.height);
      this.ctx.lineJoin = 'round';

      this.centerX = Math.floor(this.c.width / 2);
      this.centerY = Math.floor(this.c.height / 2);
      this.ctx.beginPath();

      var centerX = this.centerX + xDelta;
      var centerY = this.centerY + yDelta;
      var radius = Math.abs(this.radius + radiusDelta);

      //this.ctx.moveTo(centerY, centerX);
      this.ctx.arc(centerX, centerY, radius, this.startAngle, this.endAngle);
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.stroke();
    };
  };
  */

  // websocket callback for all messages
  GrandCentralService.setOnMessageCallback(function(data) {

    if (data.event == 'performer') {
      $scope.$apply(function () {
        $scope.performer = data.data;
        //strokeStyle = 'hsla('+$scope.performer.altColor+', 100%, 50%, 1)';

        // enable data emisson once active
        if ($scope.performer.active) {
          Touch.setOnline(true);
          Motion.setOnline(true);
          Glitch.init('glitchCanvas');
          Glitch.glitch('images/zoku.jpg');
        }
      });
    }

    else {
      console.log('received data', data);
    }

  });

  // connect to the conductor
  GrandCentralService.connect();

  /*
  // draw initial circle
  var accelCircle = new Circle('gameCanvas');
  accelCircle.draw(0, 0);
  */

  // subscribe to motion events
  Motion.setMotionCallback(function(motionData) {
    var tweakFactor = 10;
    $scope.$apply(function () {
      // update local scope with motion data
      $scope.motionData = motionData;

      /*
      // magnify the values being sent to draw
      var moveTweak = 10;
      var sizeTweak = 5;
      accelCircle.draw((motionData[0] * moveTweak), (motionData[1] * moveTweak), (motionData[2] * sizeTweak));
      */

      // send motion data to conductor
      GrandCentralService.send({
        event: 'motion',
        data: [motionData[0],motionData[1],motionData[2],motionData[3],motionData[4],motionData[5]]
      });

      Glitch.fuzz(motionData[0], motionData[1]);
    });
  });

  // set touch data callback
  Touch.setCallback(function(touchData) {
    $scope.$apply(function () {
      $scope.touch = touchData;
    });

    GrandCentralService.send({
      event: 'touch',
      data: [touchData.x, touchData.y, touchData.deltaX, touchData.deltaY, touchData.velocity]
    });
  });

  // start finger touch capture on element
  Touch.watchElement('touchArea');

  // allow taring of values
  $scope.tare = function() {
    Motion.tare();
  };

}])

;
