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
  isNumber: function(obj) {
    return !isNaN(parseFloat(obj));
  },

  findTypes: function(arr) {
    // make sure all motion data is a number
    for (var i=0; i<arr.length; ++i) {
      if (internals.isNumber(arr[i])) {
        arr[i] = parseFloat(arr[i]);
      } else {
        arr[i] = 0;
      }
    }
    return arr;
  }
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
  //console.log(Util.format('channel %d opened OSC connection to %s', this._channelNumber, Config.osc.client.host+':'+Config.osc.client.port));

  this.sendMotion = function(motionData) {

    // make sure all motion data is a number
    motionData = internals.findTypes(motionData);    

    // send motion (aX, xY, aZ) and rotation (alpha, beta, gamma) data
    this.oscClient.send({
      address: '/'+this.channelName+' /motion',
      args: motionData
    });
  };


};

module.exports.out = out;
