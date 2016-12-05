import Promise from 'bluebird'
import db from '../db'
import registry from '../registry'
import { publish } from '../sns'

const { packages } = db

function processChange (name, version) {
  const url = registry.tarballUrl(doc, version)
  return registry.checkForGypFileRetry(url)
    .then(gypFile => savePackageInfo(name, version, gypFile))
    .catch(err => saveError(name, version, err))
}

function savePackageInfo (name, version, gypFile) {
  const item = {
    Item: {
      name: { S: name },
      version: { S: version }
    }
  }

  if (typeof gypFile === 'boolean') {
    item.Item.gypFile = { BOOL: gypFile }
  }

  return packages
    .putItem(item)
}

function saveError (name, version, error) {
  const item = {
    Item: {
      name: { S: name },
      version: { S: version },
      error: { S: JSON.stringify(error) }
    }
  }
  return packages.putItem(item)
}

export function published (event) {
  console.log(`Analyzing ${event.data.name}@${event.data.version}`)
  packages.get(event.data.name, event.data.version).then(info => {
    if (info && typeof info.gypFile === 'boolean') {
      console.log(`${info.name}@${info.version} has a gypFile value of ${info.gypFile}`)
      return
    }
  })
}
