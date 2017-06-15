FROM buildpack-deps:jessie-scm
ENV DOCKER_FILE_VERSION 0.0.3

WORKDIR /root/

# cross compile toolchain
# change DOCKER_FILE_VERSION to update this file
RUN curl -s https://tessel-builds.s3.amazonaws.com/firmware/toolchain-mipsel.tar.gz | tar -xz

RUN apt-get update \
  && apt-get install -y build-essential \
  && apt-get autoremove -y \
  && apt-get clean -y

# Install NVM
RUN ["/bin/bash", "-c", "curl -s -o - https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash"]

# Install node 4.5.0
RUN ["/bin/bash", "-c", ". /root/.nvm/nvm.sh \
  && nvm install 4.5.0 \
  && npm install -g pre-gypify node-pre-gyp node-gyp \
  && node-gyp install 4.5.0 \
  "]

# Install node 6.10.3
RUN ["/bin/bash", "-c", ". /root/.nvm/nvm.sh \
  && nvm install 6.10.3 \
  && npm install -g pre-gypify node-pre-gyp node-gyp \
  && node-gyp install 6.10.3 \
  "]

COPY ./compile.sh /root/
ENTRYPOINT ["/root/compile.sh"]
CMD ["--help"]
