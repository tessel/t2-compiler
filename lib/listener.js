'use strict'

import changes from 'concurrent-couch-follower'
import { settings } from './db'

const saveEventId = seq => settings.set('registry-last-event-id', seq)
const getEventId = () => settings.get('registry-last-event-id')

const createListener = processChange => (eventId) => {
  const stream = changes((data, done) => {
    Promise.resolve(processChange(data))
      .catch(err => {
        console.error(err)
        console.error(err.stack)
      })
      .then(() => done())
  }, {
    db: 'https://skimdb.npmjs.com/registry',
    include_docs: true,
    since: eventId || 0,
    sequence: (id, cb) => saveEventId(id).then(cb).catch((err) => {
      stream.end()
      console.error(`Error saving sequence "${id}", stopping processing`)
      console.error(err)
      console.error(err.stack)
    }),
    concurrency: 20,
    timeout: 10
  })
  return stream
}

export default function startListening (cb) {
  return getEventId()
    .then(createListener(cb))
}
