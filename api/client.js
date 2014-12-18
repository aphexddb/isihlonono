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

var Client = function(ws, id) {
  var self = this;
  this.id = id;
  this.ws = ws;
  this.performer = null;
  this.conductor = null;

  this.setPerformer = function(performer) {
    self.performer = performer;
  };

  this.getPerformer = function() {
    return self.performer;
  };

  this.setConductor = function(conductor) {
    self.conductor = conductor;
  };

  // send websocket message
  this.send = function(obj) {
    self.ws.send(JSON.stringify(obj));
  };

};

module.exports = Client;
