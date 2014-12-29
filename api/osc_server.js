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
  callback: null,
  sock: null,
  clients: [],
  clientData: {},
  addressCallbacks: {}
};

/*
* Api code
*/

internals.clientCheck = function(ipAddress) {
  if (!(internals.clients.indexOf(ipAddress) > -1)) {
    internals.server.log(['osc-server'], Util.format('receiving OSC data from new client %s:', ipAddress));
    internals.clients.push(ipAddress);
    internals.clientData[ipAddress] = {};
  }
};

internals.callback = function(msg, rinfo) {
  var ipAddress = rinfo.address;
  internals.clientCheck(ipAddress);
  try {
    var ipAddress = rinfo.address;
    var msg = Osc.fromBuffer(msg);

    // update internal state
    internals.clientData[ipAddress][msg.address] = msg.args;

    // fire callback for address if it exists
    if (internals.addressCallbacks[msg.address] !== undefined) {
      internals.addressCallbacks[msg.address](msg.args);
    }

  } catch (e) {
    internals.server.log(['osc-server'], Util.format('invalid OSC packet:', e));
  }
};

var addAddressCallback = function(addressName, callback) {
  internals.addressCallbacks[addressName] = callback;
}

var start = function(server) {
  internals.server = server;

  internals.sock = dgram.createSocket('udp4', internals.callback);

  internals.sock.bind(Config.osc.server.port);

  internals.server.log(['osc-server'], Util.format('OSC Server started on', Config.osc.server.host+':'+Config.osc.server.port));

};


module.exports.start = start;
module.exports.addAddressCallback = addAddressCallback;
