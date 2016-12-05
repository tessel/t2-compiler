'use strict'
import AWS from './aws'
import retry from 'bluebird-retry'
import config from 'shep-config'

const { eventTopic } = config

const retryOptions = {
  interval: 100,
  backoff: 2,
  timeout: 60000,
  max_tries: Infinity,
  throw_original: true,
  predicate: err => err.retryable
}

const sns = new AWS.SNS({
  apiVersion: '2010-03-31'
})

function _publish (event = {}) {
  console.log('publish', event)
  if (!event.type) {
    throw new TypeError('"event.type" is a required field')
  }
  return sns.publish({
    TopicArn: eventTopic,
    Message: JSON.stringify(event)
  }).promise()
}

export const publish = event => retry(() => _publish(event), retryOptions)
