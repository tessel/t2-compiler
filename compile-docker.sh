#!/bin/bash
set -e

PACKAGE_NAME=$1
OUTPUT_DIR=/out
ARCH=mipsel

if [[ "$PACKAGE_NAME" == '--help' || "$PACKAGE_NAME" == '' ]]; then
  echo "Usage: "
	echo "    docker run -v \`pwd\`:${OUTPUT_DIR} tessel/t2-compiler [package name]<@version>"
	exit 1
fi

if [ ! -d "$OUTPUT_DIR" ]; then
    echo "ERROR: The output directory ${OUTPUT_DIR} doesn't exist, it needs to be mounted as a docker volume with '-v OUTPUT_DIR:${OUTPUT_DIR}'";
    exit 1
fi

echo "Building $PACKAGE_NAME for node@$(node -v) abi@$(node -p process.versions.modules)"

mkdir build
cd build

npm pack $PACKAGE_NAME > /dev/null;
tar xf *.tgz;
cd package

# set -x
npm install --ignore-scripts # 2>1 >/dev/null
pre-gypify --package_name "{name}-{version}-{configuration}.tgz"


# node-pre-gyp rebuild --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION --debug
# node-pre-gyp package --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION --debug
# find build/stage -type f | xargs -i cp {} /work/binary-module/output
node-pre-gyp rebuild --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION
node-pre-gyp package --target_platform=linux --target_arch=$ARCH --target=$NODE_VERSION
# find build/stage -type f | xargs -i cp {} $OUTPUT_DIR

mv -vn build/stage/*.tgz $OUTPUT_DIR
