#!/bin/bash
set -e

PACKAGE_NAME=$1

if [[ $PACKAGE_NAME == '' ]]; then
  echo 'Usage: compile.sh package-name'
  exit 1
fi

cd $(dirname $0)
mkdir -p ./out
vagrant ssh -c "sudo su root /root/compile.sh $PACKAGE_NAME 6.5.0 release /root/out/"
vagrant ssh -c "sudo su root /root/compile.sh $PACKAGE_NAME 6.5.0 debug /root/out/"
