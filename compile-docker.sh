#!/bin/bash
set -ex
docker run -v `pwd`/out:/out tessel/t2-compiler $1 /out
