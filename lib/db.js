import { fromItem } from 'dynamo-converter'
import retry from 'bluebird-retry'
import AWS from './aws'
import config from 'shep-config'

const { packagesTable, settingsTable } = config

const retryOptions = {
  interval: 100,
  backoff: 2,
  timeout: 60000,
  max_tries: Infinity,
  throw_original: true,
  predicate: err => err.retryable
}

export class Table {
  constructor (TableName) {
    this.TableName = TableName
    this.table = new AWS.DynamoDB({
      apiVersion: '2012-08-10',
      params: {
        TableName
      }
    })
  }

  putItem (item) {
    return retry(() => this.table.putItem(item).promise(), retryOptions)
  }

  getItem (item) {
    return retry(() => this.table.getItem(item).promise(), retryOptions)
  }
}

export class Settings extends Table {
  set (key, value) {
    return this.putItem({
      Item: {
        name: { S: key },
        value: { S: JSON.stringify(value) }
      }
    })
  }

  get (key) {
    return this.getItem({ Key: { name: { S: key } } })
      .then(record => {
        if (record.Item && record.Item.value && record.Item.value.S) {
          return record.Item.value.S
        }
        return null
      })
      .then(JSON.parse)
      .catch({code: 'ResourceNotFoundException'}, (e) => null)
  }
}

export class Packages extends Table {
  get (name, version) {
    return this.getItem({
      Key: {
        name: { S: name },
        version: { S: version }
      }
    })
      .then(fromItem)
      .catch({code: 'ResourceNotFoundException'}, (e) => null)
  }
}

export const packages = new Packages(packagesTable)
export const settings = new Settings(settingsTable)
