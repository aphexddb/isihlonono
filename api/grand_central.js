'use strict';

/*
* Load modules
*/

var Config = require('../config');
var Util = require('util');
var Ws = require('ws').Server;
var Client = require('./client');
var Performer = require('./performer');
var Conductor = require('./conductor');
var Channel = require('./channel');

/*
* Declare internals
*/

var internals = {
  clientId: 0,
  conductor: null,
  clients: {},
  performers: {}
};

/*
* Api code
*/


// THIS IS REPLACED WHEN A CONDUCTOR CONNECTS
internals.updateConductor = function() {
  internals.server.log(['grand_central'], 'no conductor exists, unable to update the conductor');
};

// start websocket server
var start = function(server) {
  internals.server = server;

  // init channels
  Channel.init(server, 10);

  var wss = new Ws({port: Config.ws.port, host: Config.ws.host}, function() {

    // setup global websocket broadcast function
    wss.broadcast = function broadcast(data) {
      for(var i in this.clients) {
        this.clients[i].send(data);
      }
    };

    internals.server.log(['grand_central'], 'ws running on http://'+wss._server.address().address+':'+wss._server.address().port);
  });


  // init websocket on each client connection
  wss.on('connection', function(ws) {
    var thisId = ++internals.clientId;
    this.channelNumber = null;
    this.channel = null;
    var self = this;

    internals.server.log(['grand_central'], Util.format('ws client #%d connected', thisId));

    // add a new client
    internals.clients[thisId] = new Client(internals.server, ws, thisId);

    // utility method to remove a client neatly
    this.deleteClient = function(clientId) {

      // if client is a performer, delete the performer
      var p = internals.clients[clientId].getPerformer();
      if (p !== null && p.id !== undefined) {

        // free channel if it was allocated to the performer
        if (p.channelNumber > -1) {
          Channel.free(p.channelNumber);
          internals.server.log(['grand_central'], Util.format('output channel %d is free', p.channelNumber));
        }

        delete internals.performers[p.id];
        internals.server.log(['grand_central'], Util.format('performer #%d destroyed', p.id));
      }

      // if client is a conductor, delete the conductor and disable callback
      if (internals.conductor !== null && internals.conductor.id !== undefined) {
        if (internals.conductor.id == clientId) {
          internals.updateConductor = function() {
            // noop
          };
          internals.server.log(['grand_central'], Util.format('client #%d was the conductor, conductor was destroyed', clientId));
          internals.conductor = null;
        }
      }

      // delete the client
      delete internals.clients[clientId];
      internals.server.log(['grand_central'], Util.format('client #%d destroyed', clientId));

      // let conductor know a client was deleted
      internals.updateConductor();
    };

    // handle each websocket message
    ws.on('message', function(message) {
      var obj = JSON.parse(message);
      switch(obj['event']) {

        case 'performerOnline':
          internals.server.log(['grand_central'], Util.format('ws client #%d wants to be a performer (%s)', thisId, obj['event']));

          // create new performer
          var p = new Performer(internals.server, thisId, function() {
            internals.clients[thisId].send({
              event: 'performer',
              data: p
            });
          });
          internals.performers[thisId] = p;
          internals.performers[thisId].setUserAgent(obj['data']['ua']);
          internals.clients[thisId].setPerformer(p);

          // update client with the initial performer data
          p.updateClient();

          // allocate first avilable channel to performer (if any channels are open)
          self.channelNumber = Channel.getOpenChannel();
          if (self.channelNumber > -1) {
            this.channel = new Channel.get(self.channelNumber);
            p.setChannel(this.channel);
            internals.server.log(['grand_central'], Util.format('output channel %d has been assigned', self.channelNumber));
          }

          // let the conductor know
          internals.updateConductor();

          break;

        // create new performer
        case 'conductorOnline':

          internals.server.log(['grand_central'], Util.format('ws client #%d wants to be a conductor (%s)', thisId, obj['event']));

          if (internals.conductor != null) {
            internals.server.log(['grand_central'], Util.format('client #%d is the current conductor, it will be replaced by client #%d', internals.conductor.id, thisId));
          }

          // overwrite callback to update the conductor with current state of performers
          internals.updateConductor = function() {
            try {
              ws.send(JSON.stringify({
                event: 'performers',
                data: {
                  performers: internals.performers,
                  channels: Channel.outputs()
                }
              }));
            }
            catch (e) {
              internals.server.log(['grand_central'], Util.format('error updating conductor: %s', e));
            }
          };

          // create a new conductor
          internals.conductor = new Conductor(internals.server, thisId, internals.updateConductor);
          internals.updateConductor();

          // replace existing conductor
          internals.server.log(['grand_central'], Util.format('The conductor is now client #%d', thisId));

          // activate the conductor UI
          ws.send(JSON.stringify({
            event: 'conductorReady',
            data: null
          }));
          break;

        // find a performer matching the channel and toffle its active status
        case 'toggleChannelOutput':
          for (var pId in internals.performers) {
            if(internals.performers.hasOwnProperty(pId)){
              if (internals.performers[pId].channelNumber == obj['data']['channel']) {
                // update the performer
                var activeState = (obj['data']['active'] == "true" || obj['data']['active'] == true);
                internals.performers[pId].toggleActive(activeState);
                // update the conductor with new state
                internals.updateConductor();
                break;
              }
            }
          }

          break;

        // handle touch data events
        case 'touch':
            internals.clients[thisId].getPerformer().setTouch(obj['data']);
            internals.updateConductor();
          break;

        // handle motion data events
        case 'motion':
          internals.clients[thisId].getPerformer().setMotion(obj['data']);
          internals.updateConductor();
          break;

        default:
          internals.server.log(['grand_central'], Util.format('ws client #%d sent: %s', thisId, message));
      }
    });

    // delete performer on close
    ws.on('close', function() {
      internals.server.log(['grand_central'], Util.format('ws client #%d disconnected', thisId));
      self.deleteClient(thisId);
    });

    // delete performer on error
    ws.on('error', function(e) {
      internals.server.log(['grand_central'], Util.format('ws client #%d error: %s', thisId, e.message));
      self.deleteClient(thisId);
    });

  });

};

module.exports.start = start;