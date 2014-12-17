'use strict';

/*
* Load modules
*/

var Config = require('../config');
var Util = require('util');
var Osc = require('osc-min');
var dgram = require('dgram');

/*
* Declare internals
*/

var internals = {
  server: null,
  channelCount: 10,
  channels: {
    out: []
  },
  availableChannels: {
    out: []
  },
  udp: dgram.createSocket('udp4')
};

internals.sendOSC = function(buf) {
  internals.udp.send(buf, 0, buf.length, Config.osc.client.port, Config.osc.client.host);
};

/*
* Api code
*/

var removeChannel = function(channelNumber) {
  internals.availableChannels.out[channelNumber] = 1;
  internals.server.log(['channel'], Util.format('output channel %d is now avilable', channelNumber));
};

// allocate a channel number
var getOpenChannel = function() {

  var channelNumber = -1;

  // iterate through channels and look for first open channel
  for (var i=0; i<internals.availableChannels.out.length; i++) {
    if (internals.availableChannels.out[i] === 1) {
      channelNumber = i;
      break;
    }
  }

  if (channelNumber === -1) {
    internals.server.log(['channel'], Util.format('no output channels are available, all %d are used', internals.channels.out.length));
  }

  return channelNumber;
};

// Channel out
var OutputChannel = function(channelNumber) {
  var oscBaseAddress = '/channel'+channelNumber;
  var oscBuffer = {
    motion: null,
    touch: null
  };
  this.channelNumber = channelNumber;

  // Create OSC client
  internals.server.log(['channel'], Util.format('output channel %d created, sending OSC data to %s:%d',
    this.channelNumber,
    Config.osc.client.host,
    Config.osc.client.port));

  // send motion data for this channel
  this.sendMotion = function(motionData) {

    // Motion data array format:
    // 0,1,2 acceleration (aX, xY, aZ)
    // 3,4,5 rotation (alpha, beta, gamma)

    oscBuffer.motion = Osc.toBuffer({
      //timetag: 12345,
      elements: [
        {
          address: oscBaseAddress + '/motion',
          args: motionData
        }
      ]
    });

    internals.sendOSC(oscBuffer.motion);
  };

  // send touch data for this channel
  this.sendTouch = function(touchData) {

    // Touch data array format:
    // 0,1   position (x, y)
    // 2,3   delta (deltaX, deltaY)
    // 4     velocity

    oscBuffer.touch = Osc.toBuffer({
      //timetag: 12345,
      elements: [
      {
        address: oscBaseAddress + '/touch',
        args: touchData
      }
      ]
    });

    internals.sendOSC(oscBuffer.touch);
  };

};

// initialize all channels, etc.
var init = function(server, channelOutMax) {
  internals.server = server;
  internals.channelCount = channelOutMax;

  // init output channels
  internals.channels.out = new Array(internals.channelCount);
  internals.availableChannels.out = new Array(internals.channelCount);
  for (var i=0; i<internals.channels.out.length; i++) {
    internals.channels.out[i] = new OutputChannel(i);
    internals.availableChannels.out[i] = 1;
  }

  internals.server.log(['channel'], Util.format('%d output channels initalized', internals.channelCount));
};

// free up an output channel
var free = function(channelNumber) {
  // mark the channel as avilable
  internals.availableChannels.out[channelNumber] = 1;
};

// return an output chanel
var get = function(channelNumber) {
  // mark the channel as taken
  internals.availableChannels.out[channelNumber] = 0;

  // return the channel
  return internals.channels.out[channelNumber];
};

// return the output channels
var outputs = function() {
  return internals.channels.out;
};

module.exports.removeChannel = removeChannel;
module.exports.getOpenChannel = getOpenChannel;
module.exports.init = init;
module.exports.get = get;
module.exports.free = free;
module.exports.outputs = outputs;
