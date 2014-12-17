'use strict';

var colors = require('colors');
var Util = require('util');
var Server = require('./server');
var Config = require('./config');
//var Conductor = require('./api/conductor');
var GrandCentral = require('./api/grand_central');

console.log('isihlonono'.magenta.bold,'is about to make some'.magenta,'noise'.magenta.bold.underline,'!'.magenta);

Server.start(function () {

  // start upstream websocket server and access its shared state
  //var conductorSharedState = Conductor.start(Server);

  GrandCentral.start(Server);

  /*
  // OSC server
  var oscServer = new Osc.Server(Config.osc.server.port, Config.osc.server.host);
  Server.log(['osc-server'], Util.format('started on', Config.osc.server.host+':'+Config.osc.server.port));

  // OSC client
  var oscClient = new Osc.Client(Config.osc.client.host, Config.osc.client.port);
  Server.log(['osc-client'], Util.format('started on', Config.osc.client.host+':'+Config.osc.client.port));
  */

  /*
  // start OSC TCP emitter
  var oscMoodCallback = Osc.start(server);

  // attach the tweet callback
  Tweets.setCallback(oscMoodCallback);
  */

  // Hapi HTTP Server
  Server.log(['hapi'], Util.format('started on', Server.info.uri));
});
