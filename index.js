#!/usr/bin/env node

var Promise = require('bluebird');
var parser = require("nomnom");
var fs = require('fs');
var path = require('path');

var build = require('./build');
var pop = require('./populate');

function compile (pwd, recursive, force) {
  if (recursive) {
    var list = [];
    pop.iterate(path.dirname(pwd), path.basename(pwd), function (root, dir) {
      if (pop.hasGypfile(path.join(root, dir))) {
        list.push(path.join(root, dir));
      }
    })
  } else {
    if (pop.hasGypfile(pwd)) {
      list = [pwd];
    } else {
      console.error('No binaries to compile.');
      list = [];
    }
  }

  var compilelist = list.filter(function (pwd) {
    if (!force && pop.lookup(path.dirname(pwd), path.basename(pwd))) {
      console.error('Using cached binaries for', path.basename(pwd));
    } else {
      return true;
    }
  });

  if (compilelist.length) {
    return Promise.using(build.acquire(), function () {
      return Promise.map(list, function (dir) {
        console.log(dir);
        return build.build(dir);
      }, {
        concurrency: 1
      })
    });
  } else {
    return Promise.resolve();
  }
}

parser.command('build')
  .option('force', {
    flag: true,
  })
  .option('recursive', {
    flag: true,
    default: false,
  })
  .option('target', {
    default: 'vm',
    choices: ['vm', 't2'],
  })
  .callback(function (opts) {
    process.env.T2_COMPILER_TARGET = opts.target;
    console.error('target=' + opts.target);

    compile(fs.realpathSync('.'), opts.recursive !== false, opts.force)
    .then(function () {
      console.error('done.');
    })
  })
  .help('compile this node package for target')

parser.command('populate')
  .option('build-needed', {
    flag: true,
    default: true,
  })
  .option('force', {
    flag: true,
  })
  .option('recursive', {
    flag: true,
    default: true,
  })
  .option('target', {
    default: 'vm',
    choices: ['vm', 't2'],
  })
  .callback(function (opts) {
    process.env.T2_COMPILER_TARGET = opts.target;
    console.error('target=' + opts.target);

    Promise.try(function () {
      if (opts['build-needed']) {
        return compile(fs.realpathSync('.'), opts.recursive !== false, opts.force)
      } else {
        console.error('Using only cached builds...')
        return Promise.resolve();
      }
    })
    .then(function () {
      require('./populate').populate();
      console.error('Done.');
    })
  })
  .help('populate archive with target builds')

parser.command('depopulate')
  .callback(function () {
    require('./populate').depopulate();
  })
  .help('restore host binary builds')

parser.parse();
