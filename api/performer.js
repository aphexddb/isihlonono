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
var isNumber = function(obj) {
  return !isNaN(parseFloat(obj))
};

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
  var self = this;
  this.id = id;
  this.updateCallback = updateCallback;
  this.channelNumber = -1;
  this.mood = internals.moodTypes[1];
  this.active = false;
  this.color = randomHue();
  this.altColor = opposingColor(this.color);
  this.motionData = {};
  this.userAgent = '';

  internals.server.log(['performer'], Util.format('performer #%d created', id));

  this.updateClient = function() {
    this.updateCallback();
  };

  this.setChannel = function(channel) {
    this.channel = channel;
    this.channelNumber = this.channel.channelNumber;
  };

  this.toggleActive = function(activeState) {
    this.active = (activeState == "true" || activeState == true);
    this.updateCallback();
  };

  this.setUserAgent = function(userAgent) {
    this.userAgent = userAgent;
    this.updateCallback();
  };

  // Motion data array format:
  // 0,1,2 acceleration (aX, xY, aZ)
  // 3,4,5 rotation (alpha, beta, gamma)
  this.motionData = new Array(6);
  for (var i=0; i < this.motionData.length; i++) {
    this.motionData[i] = 0.0;
  }

  // Touch data array format:
  // 0,1   position (x, y)
  // 2,3   delta (deltaX, deltaY)
  // 4     velocity
  this.touchData = new Array(5);
  for (var i=0; i < this.touchData.length; i++) {
    this.touchData[i] = 0.0;
  }

  this.setMotion = function(motionData) {

    // make sure all motion data is a number
    for (var i=0; i<this.motionData.length; ++i) {
      if (isNumber(motionData[i])) {
        this.motionData[i] = parseFloat(motionData[i]);
      } else {
        this.motionData[i] = 0.0;
      }
    }

    if (this.active) {
      this.channel.sendMotion(this.motionData);
    }
  };

  this.setTouch = function(touchData) {

    // make sure all motion data is a number
    for (var i=0; i<this.touchData.length; ++i) {
      if (isNumber(touchData[i])) {
        this.touchData[i] = parseFloat(touchData[i]);
      } else {
        this.touchData[i] = 0.0;
      }
    }

    if (this.active) {
      this.channel.sendTouch(this.touchData);
    }

  };

  this.getMotion = function() {
    return this.motionData;
  };

  this.getTouch = function() {
    return this.touchData;
  };

}

module.exports = Performer;
