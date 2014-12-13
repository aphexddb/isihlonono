'use strict';

angular.module('isihlononoApp')

.controller('NoiseCtrl', ['$scope','$rootScope', 'ConductorService',
function ($scope, $rootScope, ConductorService) {
  $scope.conductorReady = false;

  // set the conductor online callback on the root scope
  ConductorService.setOnlineCallback(function(online) {
    $scope.$apply(function () {
      $rootScope.online = online;
      if (!online) {
        $scope.conductorReady = false;
      }
    });
  });

  // websocket callback for all messages
  ConductorService.setCallback(function(data) {
    console.log('received data',data);

    // TODO

    // update performer information
    if (data.conductorReady !== undefined) {
      $scope.$apply(function () {
        $scope.conductorReady = true;
      });
    };

  });

  // connect to conductor
  ConductorService.connect();

  // Tell conductor we are ready to make noise
  $scope.conduct = function() {
    if ($rootScope.online) {
      // send event to conductor
      ConductorService.send({
        event: 'conductorOnline',
        data: null
      });
    }
  };

}])

;
