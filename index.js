#!/usr/bin/env node

var Promise = require('bluebird');
var parser = require("nomnom");

parser.command('build')
  .callback(function () {
    var build = require('./build');

    Promise.using(build.acquire(), function () {
      return build.build();
    });
  })
  .help('compile this node package for target')

parser.command('populate')
  .callback(function () {
    require('./populate').populate();
  })
  .help('populate archive with target builds')

parser.command('depopulate')
  .callback(function () {
    require('./populate').depopulate();
  })
  .help('restore host binary builds')

parser.parse();
