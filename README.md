# t2-compiler
[![Code of Conduct](https://img.shields.io/badge/%E2%9D%A4-code%20of%20conduct-blue.svg?style=flat)](https://github.com/tessel/project/blob/master/CONDUCT.md)
[![Travis Build Status](https://travis-ci.org/tessel/t2-compiler.svg?branch=master)](https://travis-ci.org/tessel/t2-compiler)

The server component can be found at [t2-auto-compiler](https://github.com/tessel/t2-auto-compiler)

## Publishing

Is done automatically from master at with docker hub.

- [Docker Hub | tessel/t2-compiler](https://hub.docker.com/r/tessel/t2-compiler/)

## Building Packages

Use vagrant or docker

### Vagrant
Install vagrant

```
vagrant up
./compile-vagrant.sh serialport@6
```

Look in the 'out' directory

### Docker

If you want to use docker you can run;

```bash
# puts the output in the `./out` directory (adds new files)
./compile-docker.sh serialport@6
```

To update to the latest t2-compiler from docker hub.

```bash
docker pull tessel/t2-compiler
```

To output the build on the last line of docker output in JSON containing BASE64 encoded strings
```bash
docker run --rm tessel/t2-compiler $1 6.5.0 release JSON
# build output followed by file contents
# {"serialport-6.0.3-Release-node-v46-linux-mipsel.tgz":"H4s....."}
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
docker run --rm -v `pwd`/out:/out t2-compiler:dev serialport 6.5.0 release /out
# or
docker run --rm t2-compiler:dev serialport 6.5.0 release JSON
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
