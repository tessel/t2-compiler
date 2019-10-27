#!/bin/bash
set -e
echo "# compile.sh $1 $2 $3 $4"
PACKAGE_NAME=$1

echo "loading nvm"
. /root/.nvm/nvm.sh

RELEASE_TYPE=$3
OUTPUT_DIR=$4

if [ -n $2 ]; then
  echo "# installing node $2"
  nvm install $2
fi

NODE_VERSION=`node -p process.versions.node`

ARCH=mipsel
export STAGING_DIR=/root

if [[ $PACKAGE_NAME == '--help' || $PACKAGE_NAME == '' ]]; then
  echo "Usage: "
	echo "    $0 [package name]<@version> [nodeversion releaseType outputdir]"
	exit 1
fi

if [[ $OUTPUT_DIR != 'S3' ]]; then
  if [ ! -d "$OUTPUT_DIR" ]; then
    (>&2 echo "ERROR: The output directory ${OUTPUT_DIR} doesn't exist, must be a valid directory or JSON")
    exit 1
  fi
else
  if [ ! -n $S3_RELEASE_URL ]; then
    (>&2 echo "ERROR: The S3_RELEASE_URL variable should be set for upload to S3")
    exit 1
  fi
fi

cd $(dirname $0)

TOOLCHAIN_DIR=$(ls -d "/root/toolchain-"*"$ARCH"_*)
SYSROOT=$(ls -d "/root/target-"*"$ARCH"_*)
source $TOOLCHAIN_DIR/info.mk # almost a bash script

echo "Cross-compiling $PACKAGE_NAME for for ${ARCH} node@${NODE_VERSION} abi@$(node -p process.versions.modules)"

rm -rf build
mkdir build
cd build

echo "Starting package"

npm pack $PACKAGE_NAME > /dev/null;
tar xf *.tgz;
cd package


export PATH=$TOOLCHAIN_DIR/bin:$PATH
export CPPPATH=$TARGET_DIR/usr/include
export LIBPATH=$TARGET_DIR/usr/lib

# TODO: anything better than this hack?
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
else
  echo "Release build"
  node-pre-gyp rebuild --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION
  node-pre-gyp package --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION
fi

cd $(dirname $0)
if [[ $OUTPUT_DIR == 'S3' ]]; then
  node ./upload-files.js build/package/build/stage
else
  mv -vn build/package/build/stage/*.tgz $OUTPUT_DIR
fi
