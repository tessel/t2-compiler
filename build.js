var spawn = require('child_process').spawn;

spawn(__dirname + '/build.sh', {
  stdio: 'inherit',
})
.on('exit', function (code) {
  process.exit(code);
})
