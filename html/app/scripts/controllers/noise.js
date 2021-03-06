'use strict';

angular.module('isihlononoApp')

.controller('NoiseCtrl', ['$scope','$rootScope', 'GrandCentralService', 'UA',
function ($scope, $rootScope, GrandCentralService, UA) {
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
          event: 'arrival',
          data: {
            type: 'conductor',
            ua: UA.toString()
          }
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
            userAgent: null,
            performerId: null
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
                userAgent: p.userAgent,
                performerId: p.id
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

  // change the active state for a performer
  $scope.setActive = function(performerId, activeState) {
    GrandCentralService.send({
      event: 'toggleChannelOutput',
      data: {
        performerId: performerId,
        active: activeState
      }
    });
  };

  // change the current mood for a performer
  $scope.changeMood = function(performerId, mood) {
    GrandCentralService.send({
      event: 'changeMood',
      data: {
        performerId: performerId,
        mood: mood
      }
    });
  };

}])

;
