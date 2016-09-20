# t2-compiler
[![Code of Conduct](https://img.shields.io/badge/%E2%9D%A4-code%20of%20conduct-blue.svg?style=flat)](https://github.com/tessel/project/blob/master/CONDUCT.md)

[Docker Hub | tessel/t2-compiler](https://hub.docker.com/r/tessel/t2-compiler/)

<!--
    This stuff is pointless to display until we have an actual server written

[![Travis Build Status](https://travis-ci.org/tessel/t2-compiler.svg?branch=master)](https://travis-ci.org/tessel/t2-compiler)
[![Build status](https://ci.appveyor.com/api/projects/status/fsjh9hxbf1w09794?svg=true)](https://ci.appveyor.com/project/rwaldron/t2-compiler)

-->

## Building Packages

Use vagrant or docker

### Vagrant
Install vagrant

```
vagrant up
./compile-vagrant.sh serialport@2.0.5
```

Look in the 'out' directory

### Docker

If you want to use docker you can run;

```bash
# puts the output in the `./out` directory (wont overwrite existing files)
./compile-docker.sh serialport@4.0.0
```

To update to the latest t2-compiler from docker hub.

```bash
docker pull tessel/t2-compiler
```

#### Developing the compiler

To build your local Dockerfile
```bash
# build the local directory and name it
docker build ./ -t t2-compiler:dev

# verify the localally built images
docker images
# REPOSITORY           TAG                 IMAGE ID            CREATED              SIZE
# t2-compiler:dev      latest              75f126974601        About a minute ago   1.281 GB

# Run the local image you've built
docker run --rm -v `pwd`/out:/out t2-compiler:dev serialport@4.0.0 /out
```

To get an interactive shell run
```
# from docker hub
docker run -it --rm --entrypoint bash tessel/t2-compiler
# from local dev image
docker run -it --rm --entrypoint bash t2-compiler:dev
```

Master is automatically built and pushed by the docker-hub service with our tessel account. It's the equivalent of;

```bash
docker build -t tessel/t2-compiler ./
docker push tessel/t2-compiler
```
