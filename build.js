require('shelljs/global');

exec('VBoxManage controlvm t2-compile poweroff', {
	silent: true,
});

config.fatal = true;
exec('VBoxManage startvm t2-compile --type headless');

config.fatal = false;
do {
	exec('sleep 1');
	var out = exec('sshpass -p "tcuser" ssh tc@localhost -p 4455 "uname -a"');
} while (out.code);
config.fatal = true;

exec('tar cf - --exclude .git --exclude node_modules . | sshpass -p "tcuser" ssh tc@localhost -p 4455 "cat > /tmp/t2-build-input.tar.gz"');

exec('sshpass -p "tcuser" ssh tc@localhost -p 4455 sudo\\ date\\ --set=\\""$(date -u "+%y%m%d%H%M.%S")"\\"')

exec('sshpass -p "tcuser" ssh tc@localhost -p 4455 < ' + __dirname + '/build-remote.sh');

// cat test.sh | sshpass -p 'tcuser' ssh tc@localhost -p 4455
mkdir('-p', '~/.tessel/binaries');
exec('sshpass -p "tcuser" ssh tc@localhost -p 4455 "cat /tmp/t2-build.tar.gz" | tar -xjf - -C ~/.tessel/binaries');

exec('VBoxManage controlvm t2-compile poweroff');
