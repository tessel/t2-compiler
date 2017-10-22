#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const outputDir = process.argv[2]
if (!outputDir) {
  console.log('Error no output dir')
  console.log(`Usage: ${__filename} OUTPUT_DIR`)
  process.exit(1)
}

const files = fs.readdirSync(outputDir).filter(file => file.match(/\.tgz$/))

console.log(`Outputting ${JSON.stringify(files, null, 2)}`)
const data = {}
files.forEach(filename => {
  data[filename] = fs.readFileSync(path.join(outputDir, filename)).toString('BASE64')
})

console.log(JSON.stringify(data))
