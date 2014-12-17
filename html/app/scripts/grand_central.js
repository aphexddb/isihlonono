'use strict';

angular.module('isihlononoApp')

.factory('GrandCentralService', ['$rootScope', '$timeout',
function ($rootScope, $timeout) {

  var socketUrl = 'ws://'+window.location.hostname+':8081/ws';
  var ws = null;
  var onMessageCallback = null;

  var onlineStateChangeCallback = null;
  var serverOnline = false;

  // We return this object to anything injecting our service
  var Service = {};

  // Seconds to rety connection
  var reconnectInterval = 5 * 1000;

  // websocket state info
  var readyStates = {
    0: 'ws connection not yet open',
    1: 'ws connection open and ready to communicate',
    2: 'ws connection in the process of closing',
    3: 'ws connection closed or couldn\'t be opened'
  };

  var reconnect = function() {
    connect();
  };

  var connect = function(onOpenCallback) {

    ws = new WebSocket(socketUrl);

    ws.onopen = function(){
      var readyState = event.currentTarget.readyState;
      console.log('Grand Central:',readyStates[readyState]);
      onlineStateChangeCallback(true);
      serverOnline = true;
      if (onOpenCallback !== undefined) {
        onOpenCallback();
      }
    };

    ws.onclose = function() {
      console.log('Grand Central: ws connection closed, will attempt to reconnect in',reconnectInterval/1000,'seconds');
      $timeout(reconnect, reconnectInterval);
      onlineStateChangeCallback(false);
      serverOnline = false;
    };

    ws.onmessage = function(message) {
      if (onMessageCallback !== null) {
        onMessageCallback(JSON.parse(message.data));
      }
    };

    ws.onerror = function(event) {
      var readyState = event.currentTarget.readyState;
      console.log('Grand Central:',readyStates[readyState]);
    };
  };

  Service.setOnlineStateChangeCallback = function(callback) {
    onlineStateChangeCallback = callback;
  };

  Service.setOnMessageCallback = function(callback) {
    onMessageCallback = callback;
  };

  Service.connect = function() {
    connect();
  };

  Service.send = function(request) {
    // only send if connection is open
    if (ws.readyState == 1) {
      ws.send(JSON.stringify(request));
    } else {
      console.log('Grand Central: unable to send ('+readyStates[ws.readyState]+')');
    }
  };

  return Service;

}])

;
