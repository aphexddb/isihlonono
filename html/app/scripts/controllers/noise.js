'use strict';

angular.module('isihlononoApp')

.controller('NoiseCtrl', ['$scope','$rootScope', 'ConductorService',
function ($scope, $rootScope, ConductorService) {
  $scope.conductorReady = false;
  var maxChannels = 10;
  $scope.channels = new Array(maxChannels);
  // init channels as objects
  for (var i=0; i<maxChannels; i++) {
    $scope.channels[i] = {};
  }

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
    //console.log('received data',data);

    // update channels with performer information
    if (data.performers !== undefined) {
      $scope.$apply(function () {

        var gotData = new Array(maxChannels);
        for (var id in data.performers){
          if (data.performers.hasOwnProperty(id)) {
            $scope.channels[data.performers[id].channelNumber] = data.performers[id];
            //console.log('channel #',data.performers[id].channelNumber,'data:',data.performers[id]);
            gotData[data.performers[id].channelNumber] = 1;
          }
        }

        // set channel state
        for (var i=0; i<maxChannels; i++) {
          if (gotData[i] === 1) {
            $scope.channels[i].state = 'open';
          } else {
            // create dummy channel placeholder if the channel doesn't exist
            $scope.channels[i] = {
              state: 'closed',
              active: false,
              channelNumber: i
            };
          }
        }

      });
    }

    // activate the conductor!
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
