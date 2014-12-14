'use strict';

/*
* Load modules
*/

var Config = require('../config');
var Util = require('util');
//var Osc = require('node-osc');
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
  this.address = '/channel'+this._channelNumber+'/motion';

  // OSC client
  //this.oscClient = new Osc.Client(Config.osc.client.host, Config.osc.client.port);
  server.log(['channel'], Util.format('channel %d (out) created, sending OSC data to %s:%d %s',
    this._channelNumber,
    Config.osc.client.host,
    Config.osc.client.port,
    this.address));

  this.sendMotion = function(motionData) {

    // data array format:
    // 0,1,2 acceleration (aX, xY, aZ)
    // 3,4,5 rotation (alpha, beta, gamma)
    // 6,7   touch position (x, y)

    /*
    this.oscClient.send({
      address: this.address,
      args: motionData
    });
    */

    var buf = Osc.toBuffer({
      //timetag: 12345,
      elements: [
        {
          address: this.address,
          args: motionData
        }
      ]
    });
    internals.udp.send(buf, 0, buf.length, Config.osc.client.port, Config.osc.client.host);
  };


};

module.exports.out = out;
