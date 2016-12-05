'use strict'

const Promise = require('bluebird')
const AWS = require('aws-sdk')
const https = require('https')
// const debug = require('debug')('t2:db');

AWS.config.setPromisesDependency(Promise)

const agent = new https.Agent({
  maxSockets: 20
})

AWS.config.update({
  region: 'us-east-1',
  httpOptions: {
    agent
  }
})

module.exports = AWS
