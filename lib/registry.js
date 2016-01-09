'use strict'

const debug = require('debug')('t2:registry')
const gunzip = require('gunzip-maybe')
const tar = require('tar')
const got = require('got')
const retry = require('bluebird-retry')

const retryOptions = {
  interval: 200,
  backoff: 2,
  max_tries: 10,
  throw_original: true
}

function getInfo (name) {
  if (!name) { throw TypeError('"name" is not defined') }
  debug(`Getting package info: ${name}`)
  return got(`https://skimdb.npmjs.com/registry/${name}`, { json: true })
    .then(request => request.body)
}

function tarballUrl (info, version) {
  const cversion = version || (info['dist-tags'] && info['dist-tags'].latest)
  if (!cversion || !info.versions) {
    throw new Error(`Unable to detect URL for ${info.name}@${version}`)
  }

  const meta = info.versions[cversion]
  if (!meta) {
    throw new Error(`Unable to find version for ${info.name}@${version}`)
  }
  if (!meta.dist.tarball) {
    throw new Error(`Unable to find url for ${info.name}@${version}`)
  }
  return meta.dist.tarball
}

function checkForGypFile (url) {
  debug(`Scanning ${url} for binding.gyp`)
  const response = got.stream(url)
  const unzip = gunzip()
  const untar = tar.Parse()

  let clientResponse
  response.on('response', res => (clientResponse = res))

  return new Promise((resolve, reject) => {
    let detected = false
    let finished = false
    function finish () {
      if (finished) { return }
      finished = true
      response.end()

      // this seriously doesn't always exist
      if (clientResponse && clientResponse.destroy) {
        clientResponse.destroy()
      }

      if (!detected) {
        debug(`No binding.gyp found in ${url}`)
      } else {
        debug(`Found binding.gyp in ${url}`)
      }
      resolve(detected)
    }

    function error (e) {
      if (finished) { return }
      finished = true
      reject(e)
    }

    untar.on('entry', (entry) => {
      entry.abort()
      const file = entry.props.path
      if (file.match(/binding\.gyp$/)) {
        detected = true
        finish()
      }
    })

    untar.on('end', finish)
    response.on('error', error)
    unzip.on('error', error)
    untar.on('error', error)

    response.pipe(unzip).pipe(untar)
  })
}

function checkPackage (name, version) {
  return getInfo(name)
    .then(info => tarballUrl(info, version))
    .then(checkForGypFile)
}

function checkForGypFileRetry (url) {
  return retry(() => checkForGypFile(url), retryOptions)
}

module.exports = {
  getInfo,
  tarballUrl,
  checkForGypFile,
  checkForGypFileRetry,
  checkPackage
}
