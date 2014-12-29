'use strict';

var colors = require('colors');
var Util = require('util');
var Server = require('./server');
var Config = require('./config');
var GrandCentral = require('./api/grand_central');
//var SocketIO = require("socket.io")
var OscServer = require('./api/osc_server');

console.log('isihlonono'.magenta.bold,'is about to make some'.magenta,'noise'.magenta.bold.underline,'!'.magenta);

Server.start(function () {

  // start upstream websocket server
  GrandCentral.start(Server);

  // start OSC server
  OscServer.start(Server);
  OscServer.addAddressCallback('/ping', function(data) {
    console.log('osc activity callback fired for /ping address');
    console.log(data);
  });

  // start upstream websocket server
  //var io = SocketIO.listen(Server.listener);

  // Hapi HTTP Server
  Server.log(['hapi'], Util.format('HTTP server started on http://%s:%s', Server.info.host, Server.info.port));

});
