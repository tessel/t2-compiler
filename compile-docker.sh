#!/bin/bash
set -ex
docker run --rm -v `pwd`/out:/out tessel/t2-compiler $1 8.11.3 release /out
docker run --rm -v `pwd`/out:/out tessel/t2-compiler $1 8.11.3 debug /out
