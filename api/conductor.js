'use strict';

/*
 * Load modules
 */

var Config = require('../config');
var Util = require('util');
var Performer = require('./performer');
var Channel = require('./channel');
var Ws = require('ws').Server;
var Osc = require('node-osc');

/*
 * Declare internals
 */

var internals = {
  maxOutputs: 10,
  sharedState: {
    outputs: [],
    performers: {}
  }
};

/*
 * Api code
 */

var initConductorInternals = function() {

  // push a message to all clients
  internals.broadcastCallback = function(data) {
    console.log('TODO! broadcast callback fired!', data);
  };

  // find an open output channel number
  internals.allocateChannelNumber = function() {
    internals.performerCount = Object.keys(internals.sharedState.performers).length;
    var channelNumber = null;

    // iterate through outputs and look for an open positions to add performer
    for (var i=0; i<internals.maxOutputs; i++) {
      if (internals.sharedState.outputs[i] === undefined) {
        internals.sharedState.outputs[i] = {};
        channelNumber = i;
        break;
      }
    }
    internals.server.log(['conductor'], Util.format('allocated channel %d', channelNumber));
    return channelNumber;
  };


  // Creates an output channel
  internals.allocateChannel = function(channelNumber, performerId, updateCallback, initCallback) {

    internals.sharedState.performers[performerId] = new Performer.Performer(internals.server, performerId, updateCallback);

    internals.sharedState.outputs[channelNumber] = {
      channelNumber: channelNumber,
      outputChannel: new Channel.out(channelNumber),
      performer: internals.sharedState.performers[performerId]
    };

    // set performers channel #
    internals.sharedState.performers[performerId].setChannelNumber(channelNumber);
    internals.sharedState.performers[performerId].setActive(true);

    // fire initial callback to performer
    initCallback(channelNumber);

    internals.server.log(['conductor'], Util.format('output created on channel %d', channelNumber));
    return internals.sharedState.outputs[channelNumber];
  };

  // get a channel
  internals.getChannel = function(channelNumber) {
    return internals.sharedState.outputs[channelNumber];
  };

  // remove an output channel
  internals.removeOutput = function(channelNumber) {
    internals.server.log(['conductor'], Util.format('output channel %d removed', channelNumber));
    delete internals.sharedState.outputs[channelNumber];
  }

  // remove a performer
  internals.removePerformer = function(id) {
    internals.server.log(['conductor'], Util.format('performer #%d removed', id));
    delete internals.sharedState.performers[id];
  }

};

// start websocket server
var start = function(server) {
  initConductorInternals();
  internals.server = server;
  var clientId = 0;

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

    internals.server.log(['conductor'], 'started on http://'+wss._server.address().address+':'+wss._server.address().port);
  });


  // init websocket on each client connection
  wss.on('connection', function(ws) {
    var performer = {}; // performer object
    var thisId = ++clientId;
    internals.server.log(['conductor'], Util.format('websocket client #%d connected', thisId));

    // callback to send a performer it's current state
    var updateCallback = function() {
      ws.send(JSON.stringify(performer));
    };

    var updatePerformerState = function(channelNumber) {
      var performerState = {
        performer: internals.getChannel(channelNumber).performer
      };
      ws.send(JSON.stringify(performerState));
    };

    // allocate a new channel for the performer
    var channelNumber = internals.allocateChannelNumber();
    var channelOut = internals.allocateChannel(channelNumber, thisId, updateCallback, updatePerformerState);

    ws.on('message', function(message) {
      console.log('received message',message);
      var obj = JSON.parse(message);
      if (obj['event'] === 'motion') {
        internals.getChannel(channelNumber).outputChannel.sendMotion(obj['data']);
      } else if (obj['event'] === 'conductorOnline') {
        // TODO
        ws.send(JSON.stringify({conductorOnline: true}));
      } else {
        internals.server.log(['conductor'], Util.format('websocket client #%d sent: %s', thisId, message));
      }
    });

    // delete performer on close
    ws.on('close', function() {
      internals.server.log(['conductor'], Util.format('websocket client #%d disconnected', thisId));
      internals.removeOutput(channelNumber);
      internals.removePerformer(thisId);
    });

    // delete performer on error
    ws.on('error', function(e) {
      internals.server.log(['conductor'], Util.format('websocket client #%d error: %s', thisId, e.message));
      internals.removeOutput(channelNumber);
      internals.removePerformer(thisId);
    });

  });

  return internals.sharedState;

};

module.exports.start = start;
