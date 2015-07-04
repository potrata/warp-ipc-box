'use strict';

require('babel/register')({
  ignore: false,
  extensions: '.es6'
});

let warp        = require('@hp/warp');
let decorateBus = require('./_bus-decorator.es6');

let args       = process.argv.splice(2);
let config     = JSON.parse(args.shift());
let components = JSON.parse(args.shift());

process.stdout.write(JSON.stringify(args));

process.on('SIGINT', function() {
  return false;
});

process.on('SIGTERM', function() {
  return false;
});

let app = warp(config);
let undecorateBus = decorateBus(app.bus, process);

app.bus.onRequest(`_start.${process.pid}`, function() {
  app.useConfig(components);
  return app.start();
});

app.bus.onRequest(`_destroy.${process.pid}`, function() {
  return app.destroy();
});

process.on('beforeExit', undecorateBus);