#!/usr/bin/env node

var parser = require("nomnom");

parser.command('build')
  .callback(function () {
    require('./build');
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
