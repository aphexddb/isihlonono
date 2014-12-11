'use strict';

angular.module('isihlononoApp')

.controller('HomeCtrl', ['$scope','$rootScope', 'ConductorService',
function ($scope, $rootScope, ConductorService) {

  // set the conductor online callback on the root scope
  ConductorService.setOnlineCallback(function(online) {
    $scope.$apply(function () {
      $rootScope.online = online;
    });
  });


}])


.controller('ClientCtrl', ['$scope', 'ConductorService', 'Motion',
function ($scope, ConductorService, Motion) {
  $scope.performer = {};
  $scope.motionData = {};

  ConductorService.setCallback(function(performer) {
    $scope.$apply(function () {
      $scope.performer = performer;
    });
  });

  Motion.setMotionCallback(function(motionData) {
    $scope.$apply(function () {
      ConductorService.sendBinary(motionData);
      //ConductorService.send(motionData);
      $scope.motionData = motionData;
    });
  });

}])

;
