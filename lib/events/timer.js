import Promise from 'bluebird'
import listener from '../listener'
import { publish } from '../sns'
import config from 'shep-config'

const { scanTimeout } = config

function newPackage (newPackage) {
  const doc = newPackage.doc
  if (!doc.name || typeof doc.versions !== 'object') {
    return
  }
  return Promise.resolve(Object.keys(doc.versions)).each(version => {
    return publish({
      type: 'published',
      data: {
        name: doc.name,
        version: version
      }
    })
  })
}

export function timer (event) {
  return listener(newPackage)
    .tap(stream => console.log(`Processing NPM registry Stream from ${stream.sequence()}`))
    .delay(scanTimeout)
    .then(stream => {
      console.log(`Quiting after ${scanTimeout / 1000} seconds`)
      console.log(`Processed NPM registry Stream to ${stream.sequence()}`)
      stream.end()
    })
}
