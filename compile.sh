set -e

VBoxManage controlvm t2-compile poweroff || true
# VBoxManage snapshot t2-compile restore boot
VBoxManage startvm t2-compile --type headless

set +e
false
while [ $? -ne 0 ]; do
	sleep 1
    sshpass -p 'tcuser' ssh tc@localhost -p 4455 'uname -a'
done
set -e

tar cf - --exclude .git --exclude node_modules . | sshpass -p 'tcuser' ssh tc@localhost -p 4455 'cat > /tmp/t2-build-input.tar.gz'

sshpass -p 'tcuser' ssh tc@localhost -p 4455 sudo\ date\ --set=\""$(date -u "+%y%m%d%H%M.%S")"\"

cat <<'EOF' |
echo running
rm -rf /tmp/t2-build-result
mkdir -p /tmp/t2-build-result
rm -rf /tmp/t2-build
mkdir -p /tmp/t2-build
cd /tmp/t2-build
tar xf /tmp/t2-build-input.tar.gz

export STAGING_DIR=/mnt/sda1/toolchain/
export PANGYP_RUNTIME=iojs
export NODEGYP=pangyp
export NODE=1.2.0
export ARCH=ia32

set -e

if [ ! -d "$STAGING_DIR" ]; then
    echo "STAGING_DIR needs to be set to your cross toolchain path";
    exit 1
fi

ARCH=${ARCH:-mipsel}
NODE=${NODE:-0.10.33}
NODEGYP=${NODEGYP:-node-gyp}

TOOLCHAIN_DIR=$(ls -d "$STAGING_DIR/toolchain-"*)
echo $TOOLCHAIN_DIR

export SYSROOT=$(ls -d "$STAGING_DIR/target-"*)

source $TOOLCHAIN_DIR/info.mk # almost a bash script

echo "Cross-compiling for" $TARGET_CROSS

export PATH=$TOOLCHAIN_DIR/bin:$PATH
export CPPPATH=$TARGET_DIR/usr/include
export LIBPATH=$TARGET_DIR/usr/lib

#TODO: anything better than this hack?
OPTS="-I $SYSROOT/usr/include -L $TOOLCHAIN_DIR/lib -L $SYSROOT/usr/lib"

export CC="${TARGET_CROSS}gcc $OPTS"
export CXX="${TARGET_CROSS}g++ $OPTS"
export AR=${TARGET_CROSS}ar
export RANLIB=${TARGET_CROSS}ranlib
export LINK="${TARGET_CROSS}g++ $OPTS"
export CPP="${TARGET_CROSS}gcc $OPTS -E"
export STRIP=${TARGET_CROSS}strip
export OBJCOPY=${TARGET_CROSS}objcopy
export LD="${TARGET_CROSS}g++ $OPTS"
export OBJDUMP=${TARGET_CROSS}objdump
export NM=${TARGET_CROSS}nm
export AS=${TARGET_CROSS}as

export npm_config_arch=$ARCH
export npm_config_node_gyp=$(which $NODEGYP)
npm install --ignore-scripts
./node_modules/.bin/node-pre-gyp rebuild --target=$NODE --debug
./node_modules/.bin/node-pre-gyp package --target_platform=openwrt --target_arch=$ARCH --target=$NODE --debug

find build/stage/pre-gyp -type f | xargs -i cp {} /tmp/t2-build-result
cd /tmp/t2-build-result; tar czf ../t2-build.tar.gz .

# ./node_modules/.bin/node-pre-gyp unpublish --target_platform=openwrt --target_arch=$ARCH --target=$NODE --debug
# ./node_modules/.bin/node-pre-gyp publish --target_platform=openwrt --target_arch=$ARCH --target=$NODE --debug

EOF
sshpass -p 'tcuser' ssh tc@localhost -p 4455

# cat test.sh | sshpass -p 'tcuser' ssh tc@localhost -p 4455
mkdir -p ~/.tessel/binaries
sshpass -p 'tcuser' ssh tc@localhost -p 4455 'cat /tmp/t2-build.tar.gz' | tar -xjf - -C ~/.tessel/binaries

VBoxManage controlvm t2-compile poweroff
