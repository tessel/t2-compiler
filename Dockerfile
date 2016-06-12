# FROM asmimproved/qemu-mips
# FROM hypnza/qemu_debian_mipsel
# FROM buildpack-deps/trusty-scm
ENV DOCKER_FILE_VERSION 0.0.1

WORKDIR /root/

# the emdebian source that qemu_debian_mipsel provides is bad this doesn't fix it
RUN apt-get install -y emdebian-archive-keyring \
  && apt-get update --fix-missing \
  && apt-get install -y git python build-essential

# Install node 4x
ENV NODE_VERSION 4.2.1
RUN curl https://nodejs.org/dist/v4.2.1/node-v${NODE_VERSION}-linux-x64.tar.gz | tar -xz
ENV PATH $PATH:/root/node-v${NODE_VERSION}-linux-x64/bin/

RUN npm install -g pre-gypify node-pre-gyp node-gyp \
  && node-gyp install $NODE_VERSION

COPY ./compile-docker.sh /root/
ENTRYPOINT ["/root/compile-docker.sh"]
CMD ["--help"]
