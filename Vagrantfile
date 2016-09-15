# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "ubuntu/trusty64"

  config.vm.synced_folder "./out", "/root/out"

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", keep_color: true, inline: <<-SHELL
    set -ex
    apt-get update
    apt-get install -y git build-essential
    cd /root
    rm -rfv toolchain*
    curl -s https://tessel-builds.s3.amazonaws.com/firmware/toolchain-mipsel.tar.gz | tar -xz

    # Install node
    export NODE_VERSION=4.5.0
    echo "NODE_VERSION=4.5.0" >> /etc/environment

    curl -s https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar -xz

    export PATH=$PATH:/root/node-v${NODE_VERSION}-linux-x64/bin
    echo "PATH=$PATH:/root/node-v${NODE_VERSION}-linux-x64/bin" >> /etc/environment

    npm install -g pre-gypify node-pre-gyp node-gyp
    node-gyp install $NODE_VERSION
  SHELL

  config.vm.provision "file", source: "compile.sh", destination: "/home/vagrant/compile.sh"
  config.vm.provision "shell", keep_color: true, inline: <<-SHELL
    cp /home/vagrant/compile.sh /root/
    mkdir -p /root/out
  SHELL
end
