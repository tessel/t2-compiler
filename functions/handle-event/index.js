import 'source-map-support/register'

import Promise from 'bluebird'
import * as events from '../../lib/events'

function processEvent (record) {
  const data = JSON.parse(record.Sns.Message)
  if (typeof events[data.type] === 'function') {
    return events[data.type](data)
  } else {
    console.warn(`Unknown event type ${data.type}`, record.Sns.Message)
  }
}

export function handler (event, context, callback) {
  Promise
    .resolve(event.Records)
    .map(processEvent, { concurrency: 2 })
    .then(() => undefined)
    .asCallback(callback)
}
