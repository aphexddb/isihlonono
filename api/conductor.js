'use strict';

/*
 * Load modules
 */

var Config = require('../config');
var Util = require('util');

/*
 * Declare internals
 */

var internals = {
};

/*
 * Api code
 */

function Conductor(id, updateCallback) {

  this.updateClient = function() {
    this.updateCallback();
  };

  this.id = id;
  this.updateCallback = updateCallback;
}

module.exports = Conductor;
