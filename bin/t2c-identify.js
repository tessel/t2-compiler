#!/usr/bin/env node

'use strict'

const registry = require('../lib/registry')

function logPackageInfo (name, version, found) {
  const cversion = version || 'latest'
  if (found) {
    console.log(`${name}@${cversion}`, 'binding.gyp detected')
  } else {
    console.log(`${name}@${cversion}`, 'no binding.gyp detected')
  }
}

function checkPackageforGypeFile (name, version) {
  return registry.checkPackage(name, version)
    .then(found => logPackageInfo(name, version, found), console.error)
}

checkPackageforGypeFile(process.argv[2], process.argv[3])
