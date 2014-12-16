var os = require('os');
var pkg = require('./package');
var GoodConsole = require('good-console');

// get config from environment
var env = process.env.NODE_ENV || process.env.ENV || 'development';
var port = process.env.PORT || 8080;
var oscInPort = process.env.OSC_IN_PORT || 3333;
var oscOutPort = process.env.OSC_OUT_PORT || 3334;
var wsPort = 8081;
var apiPort = 8082;

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
      'port': oscInPort
    },
    'client': {
      'host': '127.0.0.1',
      'port': oscOutPort
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
