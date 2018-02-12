#!/usr/bin/env node
const fs = require('fs')
const https = require('https')
const path = require('path')
const url = require('url')
const outputDir = process.argv[2]

const releaseURL = url.parse(process.env.S3_RELEASE_URL)

if (!outputDir) {
  console.log('Error no output dir')
  console.log(`Usage: ${__filename} OUTPUT_DIR`)
  process.exit(1)
}

const files = fs.readdirSync(outputDir).filter(file => file.match(/\.tgz$/))

files.forEach(filename => {
  console.log(`Starting request to S3 for ${filename}: ${S3_RELEASE_URL}`)

  const stream = fs.createReadStream(path.join(outputDir, filename))
  const request = https.request(
    Object.assign(
      releaseURL,
      {
        method: 'PUT',
        headers: {
          'Content-Length': fs.statSync(path.join(outputDir, filename)).size,
        },
      }
    ),
    (response) => response.pipe(process.stdout),
  )

  stream.pipe(request)
})
