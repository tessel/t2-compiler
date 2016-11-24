#!/bin/bash
set -e

PACKAGE_NAME=$1
OUTPUT_DIR=$2
. /root/.nvm/nvm.sh
[ -n "$3" ] && nvm use $3
RELEASE_TYPE=$4
NODE_VERSION=`node -p process.versions.node`

ARCH=mipsel
export STAGING_DIR=/root

if [[ "$PACKAGE_NAME" == '--help' || "$PACKAGE_NAME" == '' ]]; then
  echo "Usage: "
	echo "    $0 [package name]<@version> [output_dir/]"
	exit 1
fi

if [ ! -d "$OUTPUT_DIR" ]; then
  (>&2 echo "ERROR: The output directory ${OUTPUT_DIR} doesn't exist")
  exit 1
fi

cd $(dirname $0)

TOOLCHAIN_DIR=$(ls -d "/root/toolchain-"*"$ARCH"_*)
SYSROOT=$(ls -d "/root/target-"*"$ARCH"_*)
source $TOOLCHAIN_DIR/info.mk # almost a bash script

echo "Cross-compiling $PACKAGE_NAME for for ${ARCH} node@${NODE_VERSION} abi@$(node -p process.versions.modules)"

rm -rf build
mkdir build
cd build

npm pack $PACKAGE_NAME > /dev/null;
tar xf *.tgz;
cd package


export PATH=$TOOLCHAIN_DIR/bin:$PATH
export CPPPATH=$TARGET_DIR/usr/include
export LIBPATH=$TARGET_DIR/usr/lib

#TODO: anything better than this hack?
OPTS="-I $SYSROOT/usr/include -L $TOOLCHAIN_DIR/lib -L $SYSROOT/usr/lib -L $SYSROOT/lib"

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

npm_config_arch=$ARCH
npm_config_node_gyp=$(which node-gyp)

set -x
npm install --ignore-scripts # 2>1 >/dev/null
pre-gypify --package_name "{name}-{version}-{configuration}-{node_abi}-{platform}-{arch}.tgz"

if [[ $RELEASE_TYPE == "debug" ]]; then
  echo "Debug build"
  node-pre-gyp rebuild --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION --debug
  node-pre-gyp package --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION --debug
  mv -vn build/stage/*.tgz $OUTPUT_DIR
else
  echo "Release build"
  node-pre-gyp rebuild --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION
  node-pre-gyp package --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION
  mv -vn build/stage/*.tgz $OUTPUT_DIR
fi
