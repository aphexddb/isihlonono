'use strict';

var colors = require('colors');
var Util = require('util');
var Server = require('./server');
var Config = require('./config');
var GrandCentral = require('./api/grand_central');

console.log('isihlonono'.magenta.bold,'is about to make some'.magenta,'noise'.magenta.bold.underline,'!'.magenta);

Server.start(function () {

  // start upstream websocket server
  GrandCentral.start(Server);

  /*
  // OSC server
  var oscServer = new Osc.Server(Config.osc.server.port, Config.osc.server.host);
  Server.log(['osc-server'], Util.format('started on', Config.osc.server.host+':'+Config.osc.server.port));
  */

  // Hapi HTTP Server
  Server.log(['hapi'], Util.format('HTTP server started on http://%s:%s', Server.info.host, Server.info.port));

});
