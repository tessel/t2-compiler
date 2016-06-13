# t2-compiler

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

# docker run -v ~/Desktop:/out tessel/t2-compiler [package name]<@version>
# eg to put the packages in the current directory (wont overwrite existing files)
docker run -v `pwd`:/out tessel/t2-compiler serialport@4.0.0 /out

```

#### Developing the compiler

Clone this repo, cd into it, make changes to compile-docker.sh and...

```bash
docker build -t tessel/t2-compiler ./
docker push tessel/t2-compiler
```

To get an interactive shell run

```
docker run -it --entrypoint bash tessel/t2-compiler
```

