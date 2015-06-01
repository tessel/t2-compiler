#!/usr/bin/env node

var parser = require("nomnom");

parser.command('build')
  .callback(function () {
    var build = require('./build');

    build.launch()
    .then(function () {
      return build.build();
    })
    .then(function () {
      return build.terminate();
    })
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
