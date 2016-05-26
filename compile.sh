#!/bin/bash

FOLDER_PATH=$1

if [[ "$FOLDER_PATH" == '' ]]; then
	echo 'Usage: compile.sh package-name'
	exit 1
fi


read -r -d '' RUN_SCRIPT <<'EOF'
#!/bin/bash

set -e

which nvm || { curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash; }

export NVM_DIR="/home/vagrant/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

nvm install 4.4.3
nvm use 4.4.3
npm i -g pre-gypify node-pre-gyp node-gyp
node-gyp install 4.4.3

rm -rf /work/binary-module/output
mkdir -p /work/binary-module/output
cd /work/binary-module/package

set -x

export STAGING_DIR=/home/vagrant/
export NODEGYP=node-gyp
export NODE=4.4.3
export TOOLCHAIN_ARCH=mipsel
#export ARCH=mipsel

echo OHOHOH
echo $TOOLCHAIN_ARCH
echo $NODE

set -e

if [ ! -d "$STAGING_DIR" ]; then
    echo "STAGING_DIR needs to be set to your cross toolchain path";
    exit 1
fi

ARCH=${ARCH:-mipsel}
NODE=${NODE:-4.4.3}
NODEGYP=${NODEGYP:-node-gyp}

TOOLCHAIN_DIR=$(ls -d "$STAGING_DIR/toolchain-"*"$TOOLCHAIN_ARCH"_*)
echo $TOOLCHAIN_DIR

export SYSROOT=$(ls -d "$STAGING_DIR/target-"*"$TOOLCHAIN_ARCH"_*)

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

pre-gypify --package_name "{name}-{version}-{configuration}.tgz"

node-pre-gyp rebuild --target_platform=linux --target_arch=$ARCH --target=$NODE --debug
node-pre-gyp package --target_platform=linux --target_arch=$ARCH --target=$NODE --debug
find build/stage -type f | xargs -i cp {} /work/binary-module/output
node-pre-gyp rebuild --target_platform=linux --target_arch=$ARCH --target=$NODE
node-pre-gyp package --target_platform=linux --target_arch=$ARCH --target=$NODE
find build/stage -type f | xargs -i cp {} /work/binary-module/output
EOF

set -e

cd $(dirname $0)

vagrant ssh-config > ssh.conf

rm -rf out; mkdir out
echo 'downloading package...'
vagrant ssh -c "rm -rf /work/binary-module/; mkdir -p /work/binary-module/build; cd /work/binary-module; ls -la; npm pack $FOLDER_PATH; tar xf *.tgz; rm *.tgz"
echo 'running build...'
vagrant ssh -c "$RUN_SCRIPT" || exit 1
echo 'downloading files...'
rsync -avz -e 'ssh -F ./ssh.conf' default:/work/binary-module/output/. ./out
