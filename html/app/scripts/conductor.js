'use strict';

angular.module('isihlononoApp')

.factory('ConductorService', ['$rootScope', '$timeout',
function ($rootScope, $timeout) {

  var socketUrl = 'ws://localhost:8081/ws/conductor';
  var callbackFunc = null;
  var ws = null;

  var callbackOnline = null;
  var online = false;

  // We return this object to anything injecting our service
  var Service = {};

  // Seconds to rety connection
  var reconnectInterval = 5 * 1000;

  // websocket state info
  var readyStates = {
    0: 'websocket connection is not yet open',
    1: 'websocket connection is open and ready to communicate',
    2: 'websocket connection is in the process of closing',
    3: 'websocket connection is closed or couldn\'t be opened'
  };

  var reconnect = function() {
    connect();
  };

  var connect = function() {
    // Create our websocket object with the address to the websocket
    ws = new WebSocket(socketUrl);

    ws.onopen = function(){
      var readyState = event.currentTarget.readyState;
      console.log('Conductor:',readyStates[readyState]);
      callbackOnline(true);
      online = true;
    };

    ws.onclose = function() {
      console.log('Conductor: websocket connection closed, will attempt to reconnect in',reconnectInterval/1000,'seconds');
      $timeout(reconnect, reconnectInterval);
      callbackOnline(false);
      online = false;
    };

    ws.onmessage = function(message) {
      callbackFunc(JSON.parse(message.data));
    };

    /*
    ws.onerror = function(event) {
    var readyState = event.currentTarget.readyState;
    console.log('Conductor -',readyStates[readyState]);
  };
  */

};

Service.setOnlineCallback = function(callback) {
  callbackOnline = callback;
};

Service.setCallback = function(callback) {
  callbackFunc = callback;
  connect();
};

Service.send = function(request) {
  if (online) {
    ws.send(JSON.stringify(request));
  } else {
    console.log('Conductor: unable to send request, offline');
  }
};

Service.sendBinary = function(request) {
  if (online) {
    ws.send(request, { binary: true, mask: true });
  } else {
    console.log('Conductor: unable to send request, offline');
  }
};

return Service;

}])

;
