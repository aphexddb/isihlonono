'use strict';

angular.module('isihlononoApp')

.factory('ConductorService', ['$rootScope', '$timeout',
function ($rootScope, $timeout) {

  var socketUrl = 'ws://'+window.location.hostname+':8081/ws/conductor';
  var callbackFunc = null;
  var ws = null;

  var callbackOnline = null;
  var conductorOnline = false;

  // We return this object to anything injecting our service
  var Service = {};

  // Seconds to rety connection
  var reconnectInterval = 5 * 1000;

  // websocket state info
  var readyStates = {
    0: 'websocket connection not yet open',
    1: 'websocket connection open and ready to communicate',
    2: 'websocket connection in the process of closing',
    3: 'websocket connection closed or couldn\'t be opened'
  };

  var reconnect = function() {
    connect();
  };

  var connect = function(onOpenCallback) {

    ws = new WebSocket(socketUrl);

    ws.onopen = function(){
      var readyState = event.currentTarget.readyState;
      console.log('Conductor:',readyStates[readyState]);
      callbackOnline(true);
      conductorOnline = true;
      if (onOpenCallback !== undefined) {
        onOpenCallback();
      }
    };

    ws.onclose = function() {
      console.log('Conductor: websocket connection closed, will attempt to reconnect in',reconnectInterval/1000,'seconds');
      $timeout(reconnect, reconnectInterval);
      callbackOnline(false);
      conductorOnline = false;
    };

    ws.onmessage = function(message) {
      if (callbackFunc !== null) {
        callbackFunc(JSON.parse(message.data));
      }
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
};

Service.connect = function() {
  connect();
};

Service.send = function(request) {
  if (conductorOnline) {
    ws.send(JSON.stringify(request));
  }
};

Service.sendNow = function(request) {
  ws.send(JSON.stringify(request));
};

return Service;

}])

;
