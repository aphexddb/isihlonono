'use strict';

var Hapi = require('hapi');
var Good = require('good');
var Config = require('./config');

// Create a server with a host and port
var server = new Hapi.Server(Config.host, Config.port, { cors: true });

/* API Apps */

//var api_tweets = require('./api/tweets');

/* Plugins */

// Logging with Good
server.pack.register({
  plugin: Good,
  options: Config.good
}, function (err) {
  if (err) {
    console.log(err);
    return;
  }
});

/* Static Routes */

server.route([
  { method: 'GET', path: '/{path?}', handler: { directory: { path: Config.app.path } } },
  { method: 'GET', path: '/fonts/{path?}', handler: { directory: { path: Config.app.path + '/fonts' } } },
  { method: 'GET', path: '/images/{path?}', handler: { directory: { path: Config.app.path + '/images' } } },
  { method: 'GET', path: '/scripts/{path?}', handler: { directory: { path: Config.app.path + '/scripts' } } },
  { method: 'GET', path: '/styles/{path?}', handler: { directory: { path: Config.app.path + '/styles' } } },
  { method: 'GET', path: '/views/{path?}', handler: { directory: { path: Config.app.path + '/views' } } }
  ]);

  /* API Routes */

  var base = Config.api.base;
  //server.route({ method: 'GET',  path: base + '/ws/tweets', config: api_tweets.tweetsConfig });

  module.exports = server;
