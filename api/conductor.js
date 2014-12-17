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
  server: null
};

/*
 * Api code
 */

function Conductor(server, id, updateCallback) {
  if (internals.server === null) {
   internals.server = server;
  }

  internals.server.log(['conductor'], Util.format('conductor #%d created', id));

  this.updateClient = function() {
    this.updateCallback();
  };

  this.id = id;
  this.updateCallback = updateCallback;
}

module.exports = Conductor;
