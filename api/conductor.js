'use strict';

/*
 * Load modules
 */

var Config = require('../config');
var Util = require('util');
var Performer = require('./performer');
var Ws = require('ws').Server;

/*
 * Declare internals
 */

var internals = {
  sharedState: {
    performerCount: 0,
    performers: {},
    positions: {}
  }
};

/*
 * Api code
 */

var initConductor = function() {

  // todo init stuff
  internals.broadcastCallback = function(data) {
    console.log('TODO! broadcast callback fired!', data);
  }

};

// start websocket server
var start = function(server) {
  internals.server = server;
  var clientId = 0;

  // get the positions a performer is in, relative to other performers
  var determinePostions = function() {
    internals.sharedState.performerCount = Object.keys(internals.sharedState.performers).length;
    internals.server.log(['conductor'], Util.format('now has %d performers', internals.sharedState.performerCount));

    for (var p in Object.keys(internals.sharedState.performers)) {
      //console.log(internals.sharedState.performers[p]);
    }

    console.log(Object.keys(internals.sharedState.performers));

  };

  var wss = new Ws({port: Config.ws.port}, function() {

    // setup websocket broadcast function
    wss.broadcast = function broadcast(data) {
      for(var i in this.clients) {
        this.clients[i].send(data);
      }
    };

    // setup our broadcast callback function
    internals.broadcastCallback = function(data) {
      wss.broadcast(JSON.stringify(data));
    };

    initConductor();
    internals.server.log(['conductor'], 'started on http://'+wss._server.address().address+':'+wss._server.address().port);
  });


  // init websocket on each client connection
  wss.on('connection', function(ws) {
    var thisId = ++clientId;
    internals.server.log(['conductor'], Util.format('websocket client #%d connected', thisId));

    // callback to send a performer it's current state
    var updateCallback = function() {
      ws.send(JSON.stringify(p));
    };

    // get the position a performer is in, relative to other performers
    var performerCount = Object.keys(internals.sharedState.performers).length;
    var position = performerCount + 1;

    // create a new performer
    var p = new Performer.Performer(internals.server, position, updateCallback);
    internals.sharedState.performers[thisId] = p;
    determinePostions();
    internals.server.log(['conductor'], Util.format('new performer created in position %d for client #%d', position, thisId));
    updateCallback();

    ws.on('message', function(message) {
      var obj = JSON.parse(message);
      if (obj['event'] === 'motion') {
        // this is SUPER noisy to log
        //internals.server.log(['conductor'], Util.format('motion! %s', obj['data']));
        p.sendMotion(position, obj['data']);
      } else {
        internals.server.log(['conductor'], Util.format('websocket client #%d sent: %s', thisId, message));
      }
    });

    // delete performer on close
    ws.on('close', function() {
      internals.server.log(['conductor'], Util.format('websocket client #%d disconnected', thisId));
      delete internals.sharedState.performers[thisId];
      internals.server.log(['conductor'], Util.format('deleted performer for client #%d', thisId));
      determinePostions();
    });

    // delete performer on error
    ws.on('error', function(e) {
      internals.server.log(['conductor'], Util.format('websocket client #%d error: %s', thisId, e.message));
      delete internals.sharedState.performers[thisId];
      internals.server.log(['conductor'], Util.format('deleted performer for client #%d', thisId));
      determinePostions();
    });

  });

  return internals.sharedState;

};

/*
var setCallback = function(callback) {
  internals.tweetOscCallback = callback;
}
*/

module.exports.start = start;
//module.exports.setCallback = setCallback;
