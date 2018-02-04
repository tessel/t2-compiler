const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const s3Bucket = 'packages.tessel.io'

const url = s3.getSignedUrl('putObject', {
  Key: 'test/testurl-for-nick',
  Bucket: s3Bucket,
  ACL: 'public-read'
})

console.log(url)
