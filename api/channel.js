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
  udp: dgram.createSocket('udp4')
};

/*
* Api code
*/

// Channel out
var out = function(server, channelNumber) {
  this._channelNumber = channelNumber;
  this.baseAddress = '/channel'+this._channelNumber;

  // Create OSC client
  server.log(['channel'], Util.format('channel %d (out) created, sending OSC data to %s:%d %s',
    this._channelNumber,
    Config.osc.client.host,
    Config.osc.client.port,
    this.address));

    // send motion data for this channel
  this.sendMotion = function(motionData) {

    // Motion data array format:
    // 0,1,2 acceleration (aX, xY, aZ)
    // 3,4,5 rotation (alpha, beta, gamma)

    var buf = Osc.toBuffer({
      //timetag: 12345,
      elements: [
        {
          address: this.baseAddress + '/motion',
          args: motionData
        }
      ]
    });
    internals.udp.send(buf, 0, buf.length, Config.osc.client.port, Config.osc.client.host);
  };

  // send touch data for this channel
  this.sendTouch = function(touchData) {

    // Touch data array format:
    // 0,1   position (x, y)
    // 2,3   delta (deltaX, deltaY)
    // 4     velocity

    var buf = Osc.toBuffer({
      //timetag: 12345,
      elements: [
      {
        address: this.baseAddress + '/touch',
        args: touchData
      }
      ]
    });
    internals.udp.send(buf, 0, buf.length, Config.osc.client.port, Config.osc.client.host);
  };


};

module.exports.out = out;
