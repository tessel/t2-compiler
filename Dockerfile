FROM buildpack-deps:jessie-scm
ENV DOCKER_FILE_VERSION 0.0.1

WORKDIR /root/

# cross compile toolchain
RUN curl -s https://tessel-builds.s3.amazonaws.com/firmware/toolchain-mipsel.tar.gz | tar -xz

RUN apt-get update \
  && apt-get install -y build-essential \
  && apt-get autoremove -y \
  && apt-get clean -y

# Install node 4x
ENV NODE_VERSION 4.5.0
RUN curl -s https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar -xz
ENV PATH $PATH:/root/node-v${NODE_VERSION}-linux-x64/bin

RUN npm install -g pre-gypify node-pre-gyp node-gyp \
  && node-gyp install $NODE_VERSION

COPY ./compile.sh /root/
ENTRYPOINT ["/root/compile.sh"]
CMD ["--help"]
