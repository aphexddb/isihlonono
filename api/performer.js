'use strict';

/*
 * Load modules
 */

var Util = require('util');
var Config = require('../config');

/*
 * Declare internals
 */

// create an array from range begin to end
var createRange = function(begin, end) {
  if (typeof end === undefined) {
    end = begin; begin = 0;
  }
  var result = [], modifier = end > begin ? 1 : -1;
  for ( var i = 0; i <= Math.abs(end - begin); i++ ) {
    result.push(begin + i * modifier);
  }
  return result;
};

var internals = {
  moodTypes: ['calm','indifferent','violent'],
  defaultHue: 0,
  hues: createRange(0,360),
  server: null
};

/*
 * Api code
 */

 // see if its a number
function isNumber(obj) {
  return !isNaN(parseFloat(obj))
}

// find a random hue
var randomHue = function() {
  return internals.hues[Math.floor(Math.random()*internals.hues.length)];
};

// get an opposite hue color
var opposingColor = function(hue) {
  var opposing = hue + 180;
  if (opposing > 360) {
    opposing = opposing - 360;
  }
  return opposing;
};

// convert a value to a 0.0 - 1.0 range
var convertRange = function(inputLow, inputHigh, input) {
  input = parseInt(input);
  var outputLow = 0.0;
  var outputHigh = 1.0;
  var val = ((input - inputLow) / (inputHigh - inputLow)) * (outputHigh - outputLow) + outputLow;
  return val;
}

function Performer(server, id, updateCallback) {
  if (internals.server === null) {
    internals.server = server;
  }
  internals.server.log(['performer'], Util.format('#%d created', id));

  this.setChannelNumber = function(channelNumber) {
    this.channelNumber = channelNumber;
  };

  this.setActive = function(state) {
    this.active = state;
  };

  this.id = id;
  this.channelNumber = null;
  this.mood = internals.moodTypes[1];
  this.active = false;
  this.color = randomHue();
  this.altColor = opposingColor(this.color);
  this.motionData = {};
  this.updateCallback = updateCallback;

  this.sendMotion = function(tag, motionData) {

    // make sure all motion data is a number
    for (var i=0; i<motionData.length; ++i) {
      if (isNumber(motionData[i])) {
        motionData[i] = parseFloat(motionData[i]);
      } else {
        motionData[i] = 0;
      }
    }

    // send motion (aX, xY, aZ) and rotation (alpha, beta, gamma) data
    oscClient.send({
      address: '/performer'+tag+' /motion',
      args: motionData
    });
  };

  this.setState = function(motionObject) {

  }

}

module.exports.Performer = Performer;
