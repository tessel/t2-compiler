#!/usr/bin/env node

var fs = require('fs');
var execSync = require('child_process').execSync;
var mkdirp = require('mkdirp');
var path = require('path');
var expandTilde = require('expand-tilde');

function cmd () {
  console.error('$', arguments[0]);
  return execSync.apply(null, arguments);
}

function clean (dir) {
  try {
    cmd('node-gyp clean', {
      cwd: dir,
      stdio: 'inherit',
    });
  } catch (e) { }
}

function replace (url, dir) {
  // dir + '/build'

  // Make full path
  var pack = require(path.join(dir, 'package.json'));
  var module_path = (pack.binary || {
    module_path: 'out/Release'
  }).module_path;

  // mkdirp.sync(dir)
  try {
    // cmd('tar -jxvf ' + __dirname + '/mips-' + url + '.tar.gz -C ' + dir, {
    var target_path = path.join(dir, path.dirname(module_path));
    mkdirp.sync(target_path);
    cmd('cat ' + url + ' | tar -jxvf - -C ' + target_path, {
      stdio: 'inherit',
    });
  } catch (e) { }
}

function rebuild (dir) {
  // dir + '/build'
  try {
    cmd('npm run install', {
      cwd: dir,
      stdio: 'inherit',
    });
  } catch (e) { }
}

function lookup(root, dir) {
  var pack = require(path.join(root, dir, 'package.json'));
  var basename = [pack.name, pack.version.replace(/^v?/, 'v'), 'node-v43', 'openwrt', 'ia32', 'Release'].join('-') + '.tar.gz';
  var loc = expandTilde('~/.tessel/binaries/') + basename;
  // console.log(loc);
  if (!fs.existsSync(loc)) {
    return null;
  }
  return loc;
}

function hunt (cur, doreplace, dorebuild) {
  try {
    var root = cur + '/node_modules/';
    fs.readdirSync(root).filter(function (dir) {
      return fs.lstatSync(root + dir).isDirectory();
    }).map(function (dir) {
      try {
        if (lookup(root, dir)) {
          clean(root + dir);
          doreplace && replace(lookup(root, dir), root + dir);
          dorebuild && rebuild(root + dir);
        }
        hunt(root + dir, doreplace, dorebuild);
      } catch (e) {}
    });
  } catch (e) {}
}

exports.populate = function () {
  hunt(fs.realpathSync('.'), true, false);
};

exports.depopulate = function () {
  hunt(fs.realpathSync('.'), false, true);
};
