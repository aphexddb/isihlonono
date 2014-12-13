'use strict';

/*
* Load modules
*/

var Config = require('../config');
var Util = require('util');
var Osc = require('node-osc');

/*
* Declare internals
*/

var internals = {

};

/*
* Api code
*/

// Channel out
var out = function(channelNumber) {
  this._channelNumber = channelNumber;
  this.channelName = 'performer' + this._channelNumber;

  // OSC client
  this.oscClient = new Osc.Client(Config.osc.client.host, Config.osc.client.port);

  this.sendMotion = function(motionData) {

    // data array format:
    // 0,1,2 acceleration (aX, xY, aZ)
    // 3,4,5 rotation (alpha, beta, gamma)
    // 6,7   touch position (x, y)
    this.oscClient.send({
      address: '/'+this.channelName+' /motion',
      args: motionData
    });
  };


};

module.exports.out = out;
