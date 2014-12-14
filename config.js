var os = require('os');
var pkg = require('./package');
var GoodConsole = require('good-console');

// get config from environment
var env = process.env.NODE_ENV || process.env.ENV || 'development';
var port = process.env.PORT || 8080;
var wsPort = 8081;
var apiPort = 8082;
var oscPortServer = 3333;
var oscPortClient = 3334;

module.exports = {
  'app': {
    'path': './html/dist'
  },
  'api': {
    'base': '/api',
    'port': apiPort
  },
  'ws': {
    'host': '0.0.0.0',
    'port': wsPort
  },
  'osc': {
    'server': {
      'host': '0.0.0.0',
      'port': oscPortServer
    },
    'client': {
      'host': '127.0.0.1',
      'port': oscPortClient
    }
  },
  'package': pkg,
  'env': env,
  'port': port,
  'good': {
    opsInterval: 1000,
    reporters: [{
      reporter: GoodConsole,
      args:[{ log: '*', request: '*' }]
    }]
  }
};
