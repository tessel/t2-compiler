#!/bin/bash
set -ex
docker run --rm -v `pwd`/out:/out tessel/t2-compiler $1 6.5.0 release /out
docker run --rm -v `pwd`/out:/out tessel/t2-compiler $1 6.5.0 debug /out
