'use strict';

angular.module('isihlononoApp')

.controller('NoiseCtrl', ['$scope','$rootScope', 'ConductorService',
function ($scope, $rootScope, ConductorService) {
  $scope.conductorOnline = false;

  // set the conductor online callback on the root scope
  ConductorService.setOnlineCallback(function(online) {
    $scope.$apply(function () {
      $rootScope.online = online;
    });
  });

  // websocket callback for all messages
  ConductorService.setCallback(function(data) {
    console.log('received data',data);

    // TODO

    // update performer information
    if (data.conductorOnline !== undefined) {
      $scope.$apply(function () {
        $scope.conductorOnline = true;
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
