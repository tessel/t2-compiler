#!/bin/bash
set -ex
docker run --rm -v `pwd`/out:/out tessel/t2-compiler $1 /out 4.5.0
docker run --rm -v `pwd`/out:/out tessel/t2-compiler $1 /out 6.5.0
