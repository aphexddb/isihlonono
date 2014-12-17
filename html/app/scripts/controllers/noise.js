'use strict';

angular.module('isihlononoApp')

.controller('NoiseCtrl', ['$scope','$rootScope', 'GrandCentralService',
function ($scope, $rootScope, GrandCentralService) {
  $scope.conductorReady = false;

  // init 10 channels as objects to start
  $scope.channels = [];

  // set the conductor online callback on the root scope
  GrandCentralService.setOnlineStateChangeCallback(function(online) {
    $scope.$apply(function () {
      $rootScope.online = online;
      if (online) {
        // Tell grand central conductor is ready
        GrandCentralService.send({
          event: 'conductorOnline',
          data: null
        });
      }
    });
  });

  // websocket callback for all messages
  GrandCentralService.setOnMessageCallback(function(data) {

    // activate the conductor!
    if (data.event == 'conductorReady') {
      $scope.$apply(function () {
        $scope.conductorReady = true;
      });
    }

    // update channels with performer information
    else if (data.event == 'performers') {
      $scope.$apply(function () {

        // for each channel, get its data and state
        for (var i=0; i<data.data['channels'].length; i++) {
          var channelNumber = data.data['channels'][i].channelNumber;

          var channelData = {
            state: 'closed',
            active: false,
            channelNumber: channelNumber,
            motionData: null,
            touchData: null,
            mood: null,
            userAgent: null
          };

          var openChannel = _.find(data.data['performers'], function(p) {
            if (p.channelNumber === channelNumber) {
              channelData = {
                state: 'open',
                active: (p.active == "true" || p.active == true),
                channelNumber: channelNumber,
                motionData: p.motionData,
                touchData: p.touchData,
                mood: p.mood,
                userAgent: p.userAgent
              };
            }
          });

          $scope.channels[channelNumber] = channelData;
        }
      });
    }

    else {
      console.log('received data',data);
    }

  });

  // connect to conductor
  GrandCentralService.connect();

  // change the active state
  $scope.setActive = function(channel, activeState) {
    GrandCentralService.send({
      event: 'toggleChannelOutput',
      data: {
        channel: channel,
        active: activeState
      }
    });
  };

}])

;
