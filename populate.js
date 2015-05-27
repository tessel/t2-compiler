#!/usr/bin/env node

var fs = require('fs');
var execSync = require('child_process').execSync;
var mkdirp = require('mkdirp');
var path = require('path');

var target = {
  'jpeg': '/Users/tim/.tessel/binaries/jpeg-v2.0.0-jpeg-node-v43-openwrt-ia32-Release.tar.gz',
  'audiovideo': '/Users/tim/.tessel/binaries/audiovideo-v1.1.1-capture-node-v43-openwrt-ia32-Release.tar.gz',
};

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
    cmd('node-gyp rebuild', {
      cwd: dir,
      stdio: 'inherit',
    });
  } catch (e) { }
}

function lookup(root, dir) {
  var pack = require(path.join(root, dir, 'package.json'));
  // console.log(pack.name + '-' + pack.version + '-' + (pack.binary || {
  //   'module_name': pack.name
  // }) + '-v43-' + 'openwrt-ia32-Release.tar.gz')
  return target[dir];
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

if (process.argv[2] != 'clean' &&
  process.argv[2] != 'replace' &&
  process.argv[2] != 'rebuild') {
  console.error('Usage: allan (clean|replace|rebuild)');
  process.exit(1);
}

hunt(fs.realpathSync('.'), process.argv[2] == 'replace', process.argv[2] == 'rebuild');
